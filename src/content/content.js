/**
 * FormRescuer - Content Script Engine
 * Real-time form auto-save and instant recovery
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__FORM_RESCUER_INJECTED__) return;
  window.__FORM_RESCUER_INJECTED__ = true;

  const DEFAULT_SETTINGS = {
    autoRestore: true,
    showToast: true,
    blacklistWords: ['password', 'passwd', 'pin', 'cvv', 'cvc', 'creditcard', 'kartukredit', 'token', 'secret', 'otp', 'nik', 'ktp', 'auth'],
    debounceMs: 300
  };

  let currentSettings = { ...DEFAULT_SETTINGS };
  let saveTimeout = null;
  let isRestoring = false;

  // Universal Storage Adapter:
  // Uses chrome.storage.local if available in extension context;
  // Falls back to window.localStorage if running directly in page/file/localhost
  const storage = {
    get: function (keys, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, callback);
      } else {
        const result = {};
        keys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw !== null) {
              result[key] = JSON.parse(raw);
            }
          } catch (e) {}
        });
        callback(result);
      }
    },
    set: function (items, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(items, callback);
      } else {
        Object.keys(items).forEach((key) => {
          try {
            localStorage.setItem(key, JSON.stringify(items[key]));
          } catch (e) {}
        });
        if (callback) callback();
      }
    },
    remove: function (keys, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(keys, callback);
      } else {
        const keysArr = Array.isArray(keys) ? keys : [keys];
        keysArr.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) {}
        });
        if (callback) callback();
      }
    }
  };

  // Generate deterministic storage key for the current page
  function getPageKey() {
    try {
      const url = new URL(window.location.href);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(p => url.searchParams.delete(p));
      const origin = (url.origin && url.origin !== 'null') ? url.origin : (url.protocol + '//' + url.host);
      return `fr_draft_${origin}${url.pathname}${url.search ? '?' + url.searchParams.toString() : ''}`;
    } catch (e) {
      return `fr_draft_${window.location.href.split('#')[0]}`;
    }
  }

  // Load user settings
  function loadSettings(callback) {
    storage.get(['fr_settings'], (result) => {
      if (result && result.fr_settings) {
        currentSettings = { ...DEFAULT_SETTINGS, ...result.fr_settings };
      }
      if (callback) callback();
    });
  }

  // Check if an input field is sensitive (GDPR / UU PDP compliance)
  function isSensitiveField(element) {
    if (!element) return true;

    // Direct input type checks
    const type = (element.type || '').toLowerCase();
    if (type === 'password' || type === 'hidden') return true;

    // Autocomplete attribute
    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();
    const sensitiveAutocompletes = [
      'current-password', 'new-password', 'cc-number', 'cc-csc', 'cc-exp', 'cc-type', 'one-time-code'
    ];
    if (sensitiveAutocompletes.includes(autocomplete)) return true;

    // Inspect name, id, placeholder, aria-label, and classes
    const inspectStrings = [
      element.name || '',
      element.id || '',
      element.placeholder || '',
      element.getAttribute('aria-label') || '',
      element.className || ''
    ].join(' ').toLowerCase();

    const words = currentSettings.blacklistWords || DEFAULT_SETTINGS.blacklistWords;
    for (const word of words) {
      if (word && inspectStrings.includes(word.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  // Generate unique selector for an element
  function getElementIdentifier(element) {
    if (element.id) return `#${CSS.escape(element.id)}`;
    if (element.name) {
      const form = element.closest('form');
      const formIdentifier = form && form.id ? `#${CSS.escape(form.id)} ` : '';
      return `${formIdentifier}[name="${CSS.escape(element.name)}"]`;
    }
    if (element.getAttribute('aria-label')) {
      return `[aria-label="${CSS.escape(element.getAttribute('aria-label'))}"]`;
    }
    if (element.getAttribute('placeholder')) {
      return `[placeholder="${CSS.escape(element.getAttribute('placeholder'))}"]`;
    }

    // Fallback: hierarchy path
    const path = [];
    let current = element;
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.nodeName.toLowerCase();
      if (current.id) {
        selector += `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break;
      } else {
        let sibling = current;
        let nth = 1;
        while (sibling = sibling.previousElementSibling) {
          if (sibling.nodeName.toLowerCase() === selector) nth++;
        }
        if (nth > 1) selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  // Find human-readable label for a field
  function findFieldLabel(element) {
    if (element.id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (labelEl && labelEl.textContent.trim()) {
        return labelEl.textContent.trim();
      }
    }

    const parentLabel = element.closest('label');
    if (parentLabel && parentLabel.textContent.trim()) {
      return parentLabel.textContent.trim().replace(element.value || '', '').trim();
    }

    if (element.getAttribute('aria-label')) return element.getAttribute('aria-label').trim();
    if (element.placeholder) return element.placeholder.trim();

    const gfContainer = element.closest('div[role="listitem"]') || element.closest('.freebirdFormviewerViewNumberedItemContainer');
    if (gfContainer) {
      const titleEl = gfContainer.querySelector('div[role="heading"], .M7eMe, .freebirdFormviewerViewItemsItemItemTitle');
      if (titleEl && titleEl.textContent.trim()) {
        return titleEl.textContent.trim();
      }
    }

    return element.name || element.id || 'Kolom Isian';
  }

  // Collect all savable fields on page
  function collectPageFields() {
    const fields = {};
    const pageInputs = document.querySelectorAll('input, textarea, select, [contenteditable="true"]');

    pageInputs.forEach((el) => {
      if (isSensitiveField(el)) return;

      const tag = el.tagName.toLowerCase();
      const type = (el.type || '').toLowerCase();
      const selector = getElementIdentifier(el);
      const label = findFieldLabel(el);

      if (tag === 'input') {
        if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image' || type === 'file') {
          return;
        }

        if (type === 'radio') {
          if (el.checked) {
            const groupKey = el.name ? `radio_group_${el.name}` : selector;
            fields[groupKey] = {
              type: 'radio',
              name: el.name || '',
              selector,
              label,
              value: el.value,
              checked: true
            };
          }
        } else if (type === 'checkbox') {
          fields[selector] = {
            type: 'checkbox',
            name: el.name || '',
            selector,
            label,
            value: el.value,
            checked: el.checked
          };
        } else {
          // Normal text, email, tel, number, url, search, date, etc.
          if (el.value !== undefined && el.value.trim() !== '') {
            fields[selector] = {
              type: 'text',
              name: el.name || '',
              selector,
              label,
              value: el.value
            };
          }
        }
      } else if (tag === 'textarea') {
        if (el.value !== undefined && el.value.trim() !== '') {
          fields[selector] = {
            type: 'textarea',
            name: el.name || '',
            selector,
            label,
            value: el.value
          };
        }
      } else if (tag === 'select') {
        if (el.multiple) {
          const selected = Array.from(el.selectedOptions).map(opt => opt.value);
          if (selected.length > 0) {
            fields[selector] = {
              type: 'select-multiple',
              name: el.name || '',
              selector,
              label,
              values: selected
            };
          }
        } else if (el.value) {
          fields[selector] = {
            type: 'select',
            name: el.name || '',
            selector,
            label,
            value: el.value
          };
        }
      }
    });

    // Google Forms custom radio / checkbox divs
    const gfCustomControls = document.querySelectorAll('div[role="radio"][aria-checked="true"], div[role="checkbox"][aria-checked="true"]');
    gfCustomControls.forEach((el) => {
      const role = el.getAttribute('role');
      const val = el.getAttribute('data-value') || el.textContent.trim();
      const label = findFieldLabel(el);
      const selector = getElementIdentifier(el);

      fields[`gf_${role}_${selector}`] = {
        type: `gf-${role}`,
        selector,
        label,
        value: val,
        checked: true
      };
    });

    return fields;
  }

  // Save current form state immediately
  function saveCurrentStateNow() {
    if (isRestoring) return;

    const fields = collectPageFields();
    const count = Object.keys(fields).length;
    const pageKey = getPageKey();

    if (count === 0) {
      return;
    }

    const draftData = {
      key: pageKey,
      url: window.location.href,
      title: document.title || 'Formulir Web',
      domain: window.location.hostname || 'Lokal',
      updatedAt: Date.now(),
      fieldsCount: count,
      fields
    };

    storage.get(['fr_draft_index'], (res) => {
      const index = (res && res.fr_draft_index) ? res.fr_draft_index : [];
      const updatedIndex = index.filter(item => item.key !== pageKey);
      updatedIndex.unshift({
        key: pageKey,
        url: window.location.href,
        title: draftData.title,
        domain: draftData.domain,
        updatedAt: draftData.updatedAt,
        fieldsCount: count
      });

      storage.set({
        [pageKey]: draftData,
        fr_draft_index: updatedIndex
      }, () => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: 'UPDATE_BADGE',
              count: count
            });
          }
        } catch (e) {}

        // Dispatch custom event for on-page indicators (like in demo page)
        window.dispatchEvent(new CustomEvent('formrescuer:saved', {
          detail: { count, time: draftData.updatedAt }
        }));
      });
    });
  }

  // Debounced input listener
  function scheduleSave() {
    if (isRestoring) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentStateNow, currentSettings.debounceMs || 300);
  }

  // Visual green glow animation on restored fields
  function highlightField(el) {
    if (!el) return;
    const originalBorder = el.style.borderColor;
    const originalShadow = el.style.boxShadow;
    const originalTransition = el.style.transition;

    el.style.transition = 'all 0.3s ease';
    el.style.borderColor = '#10b981';
    el.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.35)';

    setTimeout(() => {
      el.style.borderColor = originalBorder;
      el.style.boxShadow = originalShadow;
      el.style.transition = originalTransition;
    }, 2000);
  }

  // Restore fields from stored draft
  function restoreFormData(draftData, callback) {
    if (!draftData || !draftData.fields) {
      if (callback) callback(0);
      return;
    }

    isRestoring = true;
    let restoredCount = 0;

    Object.keys(draftData.fields).forEach((key) => {
      const field = draftData.fields[key];
      let el = null;

      // 1. Match by selector
      if (field.selector) {
        try {
          el = document.querySelector(field.selector);
        } catch (e) {}
      }

      // 2. Fallback: match by name
      if (!el && field.name) {
        try {
          if (field.type === 'radio') {
            el = document.querySelector(`input[type="radio"][name="${CSS.escape(field.name)}"][value="${CSS.escape(field.value)}"]`);
          } else {
            el = document.querySelector(`[name="${CSS.escape(field.name)}"]`);
          }
        } catch (e) {}
      }

      // 3. Fallback: match by aria-label or placeholder
      if (!el && field.label) {
        try {
          el = document.querySelector(`[aria-label="${CSS.escape(field.label)}"]`) ||
               document.querySelector(`[placeholder="${CSS.escape(field.label)}"]`);
        } catch (e) {}
      }

      if (!el) return;

      try {
        if (field.type === 'text' || field.type === 'textarea') {
          el.value = field.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          restoredCount++;
          highlightField(el);
        } else if (field.type === 'checkbox') {
          el.checked = !!field.checked;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          restoredCount++;
          highlightField(el);
        } else if (field.type === 'radio') {
          if (el.value === field.value) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            restoredCount++;
            highlightField(el);
          }
        } else if (field.type === 'select') {
          el.value = field.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          restoredCount++;
          highlightField(el);
        } else if (field.type === 'select-multiple' && Array.isArray(field.values)) {
          Array.from(el.options).forEach((opt) => {
            opt.selected = field.values.includes(opt.value);
          });
          el.dispatchEvent(new Event('change', { bubbles: true }));
          restoredCount++;
          highlightField(el);
        } else if (field.type.startsWith('gf-')) {
          if (el.getAttribute('aria-checked') !== 'true') {
            el.click();
            restoredCount++;
            highlightField(el);
          }
        }
      } catch (err) {
        console.warn('[FormRescuer] Error restoring field:', key, err);
      }
    });

    setTimeout(() => {
      isRestoring = false;
      if (restoredCount > 0 && currentSettings.showToast) {
        showRestoredToast(restoredCount);
      }
      // Dispatch custom event for on-page indicators
      window.dispatchEvent(new CustomEvent('formrescuer:restored', {
        detail: { count: restoredCount }
      }));
      if (callback) callback(restoredCount);
    }, 150);
  }

  // Clear current draft from storage (Auto-cleanup on Submit)
  function clearCurrentDraft(reason = 'submit') {
    const pageKey = getPageKey();

    storage.get(['fr_draft_index'], (res) => {
      const index = (res && res.fr_draft_index) ? res.fr_draft_index : [];
      const updatedIndex = index.filter(item => item.key !== pageKey);

      storage.remove([pageKey], () => {
        storage.set({ fr_draft_index: updatedIndex }, () => {
          try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
              chrome.runtime.sendMessage({ action: 'UPDATE_BADGE', count: 0 });
            }
          } catch (e) {}

          window.dispatchEvent(new CustomEvent('formrescuer:cleared', { detail: { reason } }));

          if (reason === 'submit') {
            showSimpleToast('✓ Form terkirim. Draf otomatis dibersihkan.');
          } else if (reason === 'manual') {
            showSimpleToast('Draf formulir berhasil dihapus.');
          }
        });
      });
    });
  }

  // Floating notification toast on restored
  function showRestoredToast(count) {
    const existing = document.getElementById('formrescuer-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'formrescuer-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      background: linear-gradient(135deg, #0b0f19 0%, #1e293b 100%);
      color: #f8fafc;
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: frSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
      <style>
        @keyframes frSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes frFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
      </style>
      <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div>
        <div style="font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 6px;">
          FormRescuer
          <span style="background: #10b981; color: #022c22; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 800;">DIPULIHKAN</span>
        </div>
        <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">
          ${count} data kolom berhasil dipulihkan otomatis dari sesi sebelumnya!
        </div>
      </div>
      <button id="fr-toast-close" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px; display: flex; align-items: center; margin-left: 8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    document.body.appendChild(toast);

    const closeBtn = document.getElementById('fr-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.remove();
      });
    }

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'frFadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  // Simple small notification toast
  function showSimpleToast(message) {
    const existing = document.getElementById('formrescuer-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'formrescuer-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 16px;
      border-radius: 10px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
      border: 1px solid #334155;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 3000);
  }

  // Check and execute auto-restore
  function checkAndRestore() {
    const pageKey = getPageKey();
    storage.get([pageKey], (result) => {
      const draftData = result ? result[pageKey] : null;
      if (draftData && draftData.fields) {
        if (currentSettings.autoRestore) {
          restoreFormData(draftData);
        }

        try {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: 'UPDATE_BADGE',
              count: draftData.fieldsCount || Object.keys(draftData.fields).length
            });
          }
        } catch (e) {}
      }
    });
  }

  // Initialize
  function init() {
    loadSettings(() => {
      // Delay slightly (150ms) to ensure dynamic forms (Google Forms, React) have rendered
      setTimeout(checkAndRestore, 150);
    });

    // Listeners for user input
    document.addEventListener('input', scheduleSave, { capture: true, passive: true });
    document.addEventListener('change', scheduleSave, { capture: true, passive: true });

    // Immediate save on blur
    document.addEventListener('blur', () => {
      saveCurrentStateNow();
    }, { capture: true, passive: true });

    // CRITICAL: Immediate save before unload / reload / close!
    window.addEventListener('beforeunload', () => {
      saveCurrentStateNow();
    });
    window.addEventListener('pagehide', () => {
      saveCurrentStateNow();
    });

    // Auto-cleanup on submit
    document.addEventListener('submit', (e) => {
      clearCurrentDraft('submit');
    }, { capture: true });

    // Button click submit detector
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;

      const btn = target.closest('button, input[type="submit"], div[role="button"]');
      if (btn) {
        const text = (btn.textContent || btn.value || '').trim().toLowerCase();
        const isSubmit = (
          btn.type === 'submit' ||
          text.includes('kirim') ||
          text.includes('submit') ||
          text.includes('send') ||
          text.includes('daftar') ||
          btn.getAttribute('jsname') === 'M2HAEc'
        );

        if (isSubmit) {
          setTimeout(() => {
            clearCurrentDraft('submit');
          }, 600);
        }
      }
    }, { capture: true });
  }

  // Runtime message handler from extension popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'GET_CURRENT_STATUS') {
        const pageKey = getPageKey();
        storage.get([pageKey], (res) => {
          sendResponse({
            pageKey,
            url: window.location.href,
            title: document.title,
            draft: res ? res[pageKey] : null
          });
        });
        return true;
      }

      if (message.action === 'RESTORE_NOW') {
        const pageKey = getPageKey();
        storage.get([pageKey], (res) => {
          if (res && res[pageKey]) {
            restoreFormData(res[pageKey], (count) => {
              sendResponse({ success: true, count });
            });
          } else {
            sendResponse({ success: false, message: 'Tidak ada draf ditemukan.' });
          }
        });
        return true;
      }

      if (message.action === 'CLEAR_CURRENT') {
        clearCurrentDraft('manual');
        sendResponse({ success: true });
        return true;
      }
    });
  }

  // Expose global methods for direct testing in page
  window.__FormRescuer = {
    saveNow: saveCurrentStateNow,
    restoreNow: checkAndRestore,
    clearNow: clearCurrentDraft,
    getPageKey
  };

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
