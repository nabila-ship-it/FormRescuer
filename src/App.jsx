import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CurrentTabStatus from './components/CurrentTabStatus';
import SavedDraftsList from './components/SavedDraftsList';
import SettingsTab from './components/SettingsTab';
import PrivacyNotice from './components/PrivacyNotice';
import WebLandingPage from './components/WebLandingPage';

const DEFAULT_SETTINGS = {
  autoRestore: true,
  showToast: true,
  blacklistWords: ['password', 'passwd', 'pin', 'cvv', 'cvc', 'creditcard', 'kartukredit', 'token', 'secret', 'otp', 'nik', 'ktp', 'auth'],
  debounceMs: 350
};

export default function App() {
  const [activeTab, setActiveTab] = useState('current');
  const [currentTabInfo, setCurrentTabInfo] = useState(null);
  const [currentDraft, setCurrentDraft] = useState(null);
  const [allDrafts, setAllDrafts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isStandaloneWeb, setIsStandaloneWeb] = useState(false);

  // Helper to normalize current URL to storage key
  const computePageKey = (urlStr) => {
    try {
      const url = new URL(urlStr);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(p => url.searchParams.delete(p));
      const origin = (url.origin && url.origin !== 'null') ? url.origin : (url.protocol + '//' + url.host);
      return `fr_draft_${origin}${url.pathname}${url.search ? '?' + url.searchParams.toString() : ''}`;
    } catch (e) {
      return `fr_draft_${urlStr.split('#')[0]}`;
    }
  };

  // Determine if running as a web page (e.g. deployed on Vercel) or inside Chrome Extension popup
  useEffect(() => {
    const isExtensionPopup = (
      typeof chrome !== 'undefined' &&
      chrome.runtime &&
      chrome.runtime.id &&
      window.location.protocol === 'chrome-extension:' &&
      window.innerWidth <= 450
    );

    // If on web (Vercel, localhost full window, etc.), display full web landing page
    setIsStandaloneWeb(!isExtensionPopup);
  }, []);

  // Load state from Chrome APIs or Mock data
  const refreshData = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      // 1. Get current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          const tab = tabs[0];
          let domain = 'Lokal';
          try {
            domain = new URL(tab.url).hostname;
          } catch (e) {}

          const info = {
            id: tab.id,
            url: tab.url,
            title: tab.title,
            domain
          };
          setCurrentTabInfo(info);

          const pageKey = computePageKey(tab.url);

          chrome.storage.local.get([pageKey], (res) => {
            setCurrentDraft(res ? res[pageKey] : null);
          });
        }
      });

      // 2. Load all drafts index
      chrome.storage.local.get(['fr_draft_index', 'fr_settings'], (res) => {
        if (res && res.fr_settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...res.fr_settings });
        }
        if (res && res.fr_draft_index && Array.isArray(res.fr_draft_index)) {
          setAllDrafts(res.fr_draft_index);
        } else {
          chrome.storage.local.get(null, (all) => {
            const drafts = [];
            if (all) {
              Object.keys(all).forEach((k) => {
                if (k.startsWith('fr_draft_') && k !== 'fr_draft_index') {
                  drafts.push(all[k]);
                }
              });
            }
            drafts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            setAllDrafts(drafts);
          });
        }
      });
    } else {
      // Development / Vercel fallback data
      const mockTab = {
        id: 1,
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-Demo/viewform',
        title: 'Formulir Pendaftaran Mahasiswa Baru',
        domain: 'docs.google.com'
      };
      setCurrentTabInfo(mockTab);

      const mockDraft = {
        key: 'fr_draft_mock',
        url: mockTab.url,
        title: mockTab.title,
        domain: mockTab.domain,
        updatedAt: Date.now() - 15000,
        fieldsCount: 4,
        fields: {
          '#nama': { type: 'text', label: 'Nama Lengkap', name: 'nama', value: 'Nabila Nur Azizah' },
          '#email': { type: 'text', label: 'Email Mahasiswa', name: 'email', value: 'nabila@kampus.ac.id' },
          '#alamat': { type: 'textarea', label: 'Alamat Tinggal', name: 'alamat', value: 'Jl. Merdeka No. 45, Gedung Menara' },
          '#jurusan': { type: 'select', label: 'Program Studi', name: 'jurusan', value: 'Sistem Informasi' }
        }
      };
      setCurrentDraft(mockDraft);
      setAllDrafts([
        mockDraft,
        {
          key: 'fr_draft_tokopedia',
          url: 'https://tokopedia.com/cart/shipping',
          title: 'Pengisian Alamat Pengiriman',
          domain: 'tokopedia.com',
          updatedAt: Date.now() - 3600000,
          fieldsCount: 3,
          fields: {
            '#recipient': { type: 'text', label: 'Penerima', value: 'Nabila' },
            '#phone': { type: 'text', label: 'No Handphone', value: '081234567890' },
            '#notes': { type: 'textarea', label: 'Catatan Kurir', value: 'Pagar warna hitam' }
          }
        }
      ]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Restore current tab form
  const handleRestoreCurrent = () => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.tabs && currentTabInfo?.id) {
        chrome.tabs.sendMessage(currentTabInfo.id, { action: 'RESTORE_NOW' }, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, message: 'Harap muat ulang halaman atau periksa ekstensi.' });
          } else {
            resolve(response || { success: true });
          }
        });
      } else {
        setTimeout(() => {
          resolve({ success: true, count: 4 });
        }, 400);
      }
    });
  };

  // Delete current tab draft
  const handleDeleteCurrent = () => {
    if (!currentTabInfo) return;
    const pageKey = computePageKey(currentTabInfo.url);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([pageKey], () => {
        chrome.storage.local.get(['fr_draft_index'], (res) => {
          const index = (res && res.fr_draft_index) ? res.fr_draft_index : [];
          const updated = index.filter(i => i.key !== pageKey);
          chrome.storage.local.set({ fr_draft_index: updated }, () => {
            setCurrentDraft(null);
            setAllDrafts(updated);
            if (currentTabInfo.id) {
              chrome.tabs.sendMessage(currentTabInfo.id, { action: 'CLEAR_CURRENT' }, () => {});
            }
          });
        });
      });
    } else {
      setCurrentDraft(null);
      setAllDrafts(allDrafts.filter(d => d.key !== 'fr_draft_mock'));
    }
  };

  // Delete a specific draft from vault
  const handleDeleteDraft = (key) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([key], () => {
        const updated = allDrafts.filter(d => d.key !== key);
        chrome.storage.local.set({ fr_draft_index: updated }, () => {
          setAllDrafts(updated);
          if (currentDraft && currentDraft.key === key) {
            setCurrentDraft(null);
          }
        });
      });
    } else {
      setAllDrafts(allDrafts.filter(d => d.key !== key));
      if (currentDraft && currentDraft.key === key) {
        setCurrentDraft(null);
      }
    }
  };

  // Clear all drafts
  const handleClearAllDrafts = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(null, (items) => {
        const keysToRemove = Object.keys(items || {}).filter(k => k.startsWith('fr_draft_'));
        chrome.storage.local.remove(keysToRemove, () => {
          chrome.storage.local.set({ fr_draft_index: [] }, () => {
            setCurrentDraft(null);
            setAllDrafts([]);
          });
        });
      });
    } else {
      setCurrentDraft(null);
      setAllDrafts([]);
    }
  };

  // Update Settings
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ fr_settings: newSettings });
    }
  };

  // Open demo test page
  const handleOpenDemo = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      const demoUrl = chrome.runtime.getURL('demo/demo-form.html');
      chrome.tabs.create({ url: demoUrl });
    } else {
      window.open('/demo/demo-form.html', '_blank');
    }
  };

  const activeFieldsCount = currentDraft?.fields ? Object.keys(currentDraft.fields).length : 0;

  // Render Full Web Landing Page if accessed on Vercel / full browser width
  if (isStandaloneWeb) {
    return (
      <WebLandingPage
        mockData={{
          currentTabInfo,
          currentDraft,
          allDrafts,
          settings,
          activeTab,
          setActiveTab,
          onRestore: handleRestoreCurrent,
          onDeleteCurrent: handleDeleteCurrent,
          onOpenDemo: handleOpenDemo,
          onUpdateSettings: handleUpdateSettings,
          onClearAllDrafts: handleClearAllDrafts
        }}
      />
    );
  }

  // Render Compact Extension Popup (400px) when opened as Chrome Extension
  return (
    <div className="w-[400px] min-h-[540px] bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeFieldsCount={activeFieldsCount}
        />

        <main className="animate-fadeIn">
          {activeTab === 'current' && (
            <CurrentTabStatus
              currentTabInfo={currentTabInfo}
              currentDraft={currentDraft}
              onRestore={handleRestoreCurrent}
              onDeleteCurrent={handleDeleteCurrent}
              onOpenDemo={handleOpenDemo}
            />
          )}

          {activeTab === 'vault' && (
            <SavedDraftsList
              drafts={allDrafts}
              onDeleteDraft={handleDeleteDraft}
              onClearAllDrafts={handleClearAllDrafts}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearAllData={handleClearAllDrafts}
            />
          )}

          {activeTab === 'privacy' && <PrivacyNotice />}
        </main>
      </div>

      {/* Mini Footer */}
      <footer className="px-4 py-2.5 border-t border-slate-900 bg-slate-950/80 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>100% Penyimpanan Offline Lokal</span>
        </div>
        <button
          onClick={handleOpenDemo}
          className="hover:text-blue-400 transition-colors font-medium underline underline-offset-2"
        >
          Buka Demo Form
        </button>
      </footer>
    </div>
  );
}
