/**
 * FormRescuer - Standalone Engine for Demo Page
 * Enables full autosave, restore, and privacy protection across all contexts
 * (file:///, chrome-extension://, localhost, and live web)
 */

(function () {
  'use strict';

  if (window.__FORM_RESCUER_INJECTED__) return;
  window.__FORM_RESCUER_INJECTED__ = true;

  const DEFAULT_SETTINGS = {
    autoRestore: true,
    showToast: true,
    blacklistWords: ['password', 'passwd', 'pin', 'cvv', 'cvc', 'creditcard', 'kartukredit', 'token', 'secret', 'otp', 'nik', 'ktp', 'auth'],
    debounceMs: 250
  };

  let currentSettings = { ...DEFAULT_SETTINGS };
  let saveTimeout = null;
  let isRestoring = false;

  const storage = {
    get: function (keys, callback) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, (res) => {
          // If chrome.storage had data, return it; otherwise check localStorage as fallback
          if (res && Object.keys(res).length > 0) {
            callback(res);
          } else {
            const fallbackRes = {};
            keys.forEach((key) => {
              try {
                const raw = localStorage.getItem(key);
                if (raw !== null) fallbackRes[key] = JSON.parse(raw);
              } catch (e) {}
            });
            callback({ ...fallbackRes, ...res });
          }
        });
      } else {
        const result = {};
        keys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw !== null) result[key] = JSON.parse(raw);
          } catch (e) {}
        });
        callback(result);
      }
    },
    set: function (items, callback) {
      // Save to both chrome.storage and localStorage for maximum persistence in demo
      try {
        Object.keys(items).forEach((key) => {
          localStorage.setItem(key, JSON.stringify(items[key]));
        });
      } catch (e) {}

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(items, callback);
      } else {
        if (callback) callback();
      }
    },
    remove: function (keys, callback) {
      const keysArr = Array.isArray(keys) ? keys : [keys];
      try {
        keysArr.forEach((key) => localStorage.removeItem(key));
      } catch (e) {}

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(keys, callback);
      } else {
        if (callback) callback();
      }
    }
  };

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

  function isSensitiveField(element) {
    if (!element) return true;
    const type = (element.type || '').toLowerCase();
    if (type === 'password' || type === 'hidden') return true;

    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();
    const sensitiveAutocompletes = ['current-password', 'new-password', 'cc-number', 'cc-csc', 'cc-exp', 'cc-type', 'one-time-code'];
    if (sensitiveAutocompletes.includes(autocomplete)) return true;

    const inspectStrings = [
      element.name || '',
      element.id || '',
      element.placeholder || '',
      element.getAttribute('aria-label') || '',
      element.className || ''
    ].join(' ').toLowerCase();

    for (const word of currentSettings.blacklistWords) {
      if (word && inspectStrings.includes(word.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

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
    return element.tagName.toLowerCase();
  }

  function findFieldLabel(element) {
    if (element.id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (labelEl && labelEl.textContent.trim()) return labelEl.textContent.trim();
    }
    const parentLabel = element.closest('label');
    if (parentLabel && parentLabel.textContent.trim()) {
      return parentLabel.textContent.trim().replace(element.value || '', '').trim();
    }
    return element.name || element.id || 'Kolom Isian';
  }

  function collectPageFields() {
    const fields = {};
    const pageInputs = document.querySelectorAll('input, textarea, select');

    pageInputs.forEach((el) => {
      if (isSensitiveField(el)) return;

      const tag = el.tagName.toLowerCase();
      const type = (el.type || '').toLowerCase();
      const selector = getElementIdentifier(el);
      const label = findFieldLabel(el);

      if (tag === 'input') {
        if (type === 'button' || type === 'submit' || type === 'reset') return;

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
        if (el.value) {
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

    return fields;
  }

  function saveCurrentStateNow() {
    if (isRestoring) return;

    const fields = collectPageFields();
    const count = Object.keys(fields).length;
    const pageKey = getPageKey();

    if (count === 0) return;

    const draftData = {
      key: pageKey,
      url: window.location.href,
      title: document.title || 'Demo Pengujian FormRescuer',
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
            chrome.runtime.sendMessage({ action: 'UPDATE_BADGE', count: count });
          }
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('formrescuer:saved', {
          detail: { count, time: draftData.updatedAt }
        }));
      });
    });
  }

  function scheduleSave() {
    if (isRestoring) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentStateNow, currentSettings.debounceMs || 250);
  }

  function highlightField(el) {
    if (!el) return;
    const originalBorder = el.style.borderColor;
    const originalShadow = el.style.boxShadow;
    const originalTransition = el.style.transition;

    el.style.transition = 'all 0.3s ease';
    el.style.borderColor = '#10b981';
    el.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.4)';

    setTimeout(() => {
      el.style.borderColor = originalBorder;
      el.style.boxShadow = originalShadow;
      el.style.transition = originalTransition;
    }, 2500);
  }

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

      if (field.selector) {
        try { el = document.querySelector(field.selector); } catch (e) {}
      }
      if (!el && field.name) {
        try {
          if (field.type === 'radio') {
            el = document.querySelector(`input[type="radio"][name="${CSS.escape(field.name)}"][value="${CSS.escape(field.value)}"]`);
          } else {
            el = document.querySelector(`[name="${CSS.escape(field.name)}"]`);
          }
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
        }
      } catch (err) {}
    });

    setTimeout(() => {
      isRestoring = false;
      if (restoredCount > 0 && currentSettings.showToast) {
        showRestoredToast(restoredCount);
      }
      window.dispatchEvent(new CustomEvent('formrescuer:restored', {
        detail: { count: restoredCount }
      }));
      if (callback) callback(restoredCount);
    }, 150);
  }

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
          showSimpleToast(reason === 'submit' ? '✓ Formulir terkirim! Draf otomatis dibersihkan.' : 'Draf formulir telah dihapus.');
        });
      });
    });
  }

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
      background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
      color: #f8fafc;
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: frSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
      <style>
        @keyframes frSlideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes frFadeOut { from { opacity: 1; } to { opacity: 0; transform: scale(0.95); } }
      </style>
      <div style="background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
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
      <button id="fr-toast-close" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 4px; display: flex; align-items: center; margin-left: 8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    document.body.appendChild(toast);
    document.getElementById('fr-toast-close').onclick = () => toast.remove();

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'frFadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  function showSimpleToast(message) {
    const existing = document.getElementById('formrescuer-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'formrescuer-toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
      background: #0f172a; color: #f8fafc; padding: 10px 16px; border-radius: 10px;
      box-shadow: 0 10px 15px rgba(0,0,0,0.3); border: 1px solid #334155;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12.5px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
  }

  function checkAndRestore() {
    const pageKey = getPageKey();
    storage.get([pageKey], (result) => {
      const draftData = result ? result[pageKey] : null;
      if (draftData && draftData.fields) {
        restoreFormData(draftData);
      }
    });
  }

  function init() {
    setTimeout(checkAndRestore, 100);

    document.addEventListener('input', scheduleSave, { capture: true, passive: true });
    document.addEventListener('change', scheduleSave, { capture: true, passive: true });

    document.addEventListener('blur', () => {
      saveCurrentStateNow();
    }, { capture: true, passive: true });

    window.addEventListener('beforeunload', () => {
      saveCurrentStateNow();
    });
    window.addEventListener('pagehide', () => {
      saveCurrentStateNow();
    });

    document.addEventListener('submit', () => {
      clearCurrentDraft('submit');
    }, { capture: true });
  }

  window.__FormRescuer = {
    saveNow: saveCurrentStateNow,
    restoreNow: checkAndRestore,
    clearNow: clearCurrentDraft,
    getPageKey
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
