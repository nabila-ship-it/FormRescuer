/**
 * FormRescuer - Background Service Worker (Manifest V3)
 */

const DEFAULT_SETTINGS = {
  autoRestore: true,
  showToast: true,
  blacklistWords: ['password', 'passwd', 'pin', 'cvv', 'cvc', 'creditcard', 'kartukredit', 'token', 'secret', 'otp', 'nik', 'ktp', 'auth'],
  debounceMs: 350
};

// On installation initialize defaults
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['fr_settings'], (res) => {
    if (!res.fr_settings) {
      chrome.storage.local.set({ fr_settings: DEFAULT_SETTINGS });
    }
  });
  console.log('[FormRescuer] Extension installed & ready.');
});

// Update badge count
function updateBadge(tabId, count) {
  if (count && count > 0) {
    chrome.action.setBadgeText({ tabId, text: String(count) });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#2563eb' });
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
  }
}

// Listen to messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'UPDATE_BADGE') {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      updateBadge(tabId, message.count);
    }
    sendResponse({ received: true });
  }
});

// Sync badge when tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) return;

    try {
      const url = new URL(tab.url);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(p => url.searchParams.delete(p));
      const pageKey = `fr_draft_${url.origin}${url.pathname}${url.search ? '?' + url.searchParams.toString() : ''}`;

      chrome.storage.local.get([pageKey], (res) => {
        const draft = res[pageKey];
        if (draft && draft.fieldsCount) {
          updateBadge(activeInfo.tabId, draft.fieldsCount);
        } else {
          updateBadge(activeInfo.tabId, 0);
        }
      });
    } catch (e) {}
  });
});
