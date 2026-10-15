(function(){if(window.__FORM_RESCUER_INJECTED__)return;window.__FORM_RESCUER_INJECTED__=!0;const g={autoRestore:!0,showToast:!0,blacklistWords:["password","passwd","pin","cvv","cvc","creditcard","kartukredit","token","secret","otp","nik","ktp","auth"],debounceMs:300};let l={...g},b=null,m=!1;const c={get:function(e,o){if(typeof chrome<"u"&&chrome.storage&&chrome.storage.local)chrome.storage.local.get(e,o);else{const r={};e.forEach(t=>{try{const i=localStorage.getItem(t);i!==null&&(r[t]=JSON.parse(i))}catch{}}),o(r)}},set:function(e,o){typeof chrome<"u"&&chrome.storage&&chrome.storage.local?chrome.storage.local.set(e,o):(Object.keys(e).forEach(r=>{try{localStorage.setItem(r,JSON.stringify(e[r]))}catch{}}),o&&o())},remove:function(e,o){typeof chrome<"u"&&chrome.storage&&chrome.storage.local?chrome.storage.local.remove(e,o):((Array.isArray(e)?e:[e]).forEach(t=>{try{localStorage.removeItem(t)}catch{}}),o&&o())}};function d(){try{const e=new URL(window.location.href);return["utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid"].forEach(r=>e.searchParams.delete(r)),`fr_draft_${e.origin&&e.origin!=="null"?e.origin:e.protocol+"//"+e.host}${e.pathname}${e.search?"?"+e.searchParams.toString():""}`}catch{return`fr_draft_${window.location.href.split("#")[0]}`}}function _(e){c.get(["fr_settings"],o=>{o&&o.fr_settings&&(l={...g,...o.fr_settings}),e&&e()})}function k(e){if(!e)return!0;const o=(e.type||"").toLowerCase();if(o==="password"||o==="hidden")return!0;const r=(e.getAttribute("autocomplete")||"").toLowerCase();if(["current-password","new-password","cc-number","cc-csc","cc-exp","cc-type","one-time-code"].includes(r))return!0;const i=[e.name||"",e.id||"",e.placeholder||"",e.getAttribute("aria-label")||"",e.className||""].join(" ").toLowerCase(),n=l.blacklistWords||g.blacklistWords;for(const a of n)if(a&&i.includes(a.toLowerCase()))return!0;return!1}function y(e){if(e.id)return`#${CSS.escape(e.id)}`;if(e.name){const t=e.closest("form");return`${t&&t.id?`#${CSS.escape(t.id)} `:""}[name="${CSS.escape(e.name)}"]`}if(e.getAttribute("aria-label"))return`[aria-label="${CSS.escape(e.getAttribute("aria-label"))}"]`;if(e.getAttribute("placeholder"))return`[placeholder="${CSS.escape(e.getAttribute("placeholder"))}"]`;const o=[];let r=e;for(;r&&r!==document.body&&r!==document.documentElement;){let t=r.nodeName.toLowerCase();if(r.id){t+=`#${CSS.escape(r.id)}`,o.unshift(t);break}else{let i=r,n=1;for(;i=i.previousElementSibling;)i.nodeName.toLowerCase()===t&&n++;n>1&&(t+=`:nth-of-type(${n})`)}o.unshift(t),r=r.parentElement}return o.join(" > ")}function v(e){if(e.id){const t=document.querySelector(`label[for="${CSS.escape(e.id)}"]`);if(t&&t.textContent.trim())return t.textContent.trim()}const o=e.closest("label");if(o&&o.textContent.trim())return o.textContent.trim().replace(e.value||"","").trim();if(e.getAttribute("aria-label"))return e.getAttribute("aria-label").trim();if(e.placeholder)return e.placeholder.trim();const r=e.closest('div[role="listitem"]')||e.closest(".freebirdFormviewerViewNumberedItemContainer");if(r){const t=r.querySelector('div[role="heading"], .M7eMe, .freebirdFormviewerViewItemsItemItemTitle');if(t&&t.textContent.trim())return t.textContent.trim()}return e.name||e.id||"Kolom Isian"}function A(){const e={};return document.querySelectorAll('input, textarea, select, [contenteditable="true"]').forEach(t=>{if(k(t))return;const i=t.tagName.toLowerCase(),n=(t.type||"").toLowerCase(),a=y(t),s=v(t);if(i==="input"){if(n==="button"||n==="submit"||n==="reset"||n==="image"||n==="file")return;if(n==="radio"){if(t.checked){const h=t.name?`radio_group_${t.name}`:a;e[h]={type:"radio",name:t.name||"",selector:a,label:s,value:t.value,checked:!0}}}else n==="checkbox"?e[a]={type:"checkbox",name:t.name||"",selector:a,label:s,value:t.value,checked:t.checked}:t.value!==void 0&&t.value.trim()!==""&&(e[a]={type:"text",name:t.name||"",selector:a,label:s,value:t.value})}else if(i==="textarea")t.value!==void 0&&t.value.trim()!==""&&(e[a]={type:"textarea",name:t.name||"",selector:a,label:s,value:t.value});else if(i==="select")if(t.multiple){const h=Array.from(t.selectedOptions).map(L=>L.value);h.length>0&&(e[a]={type:"select-multiple",name:t.name||"",selector:a,label:s,values:h})}else t.value&&(e[a]={type:"select",name:t.name||"",selector:a,label:s,value:t.value})}),document.querySelectorAll('div[role="radio"][aria-checked="true"], div[role="checkbox"][aria-checked="true"]').forEach(t=>{const i=t.getAttribute("role"),n=t.getAttribute("data-value")||t.textContent.trim(),a=v(t),s=y(t);e[`gf_${i}_${s}`]={type:`gf-${i}`,selector:s,label:a,value:n,checked:!0}}),e}function f(){if(m)return;const e=A(),o=Object.keys(e).length,r=d();if(o===0)return;const t={key:r,url:window.location.href,title:document.title||"Formulir Web",domain:window.location.hostname||"Lokal",updatedAt:Date.now(),fieldsCount:o,fields:e};c.get(["fr_draft_index"],i=>{const a=(i&&i.fr_draft_index?i.fr_draft_index:[]).filter(s=>s.key!==r);a.unshift({key:r,url:window.location.href,title:t.title,domain:t.domain,updatedAt:t.updatedAt,fieldsCount:o}),c.set({[r]:t,fr_draft_index:a},()=>{try{typeof chrome<"u"&&chrome.runtime&&chrome.runtime.sendMessage&&chrome.runtime.sendMessage({action:"UPDATE_BADGE",count:o})}catch{}window.dispatchEvent(new CustomEvent("formrescuer:saved",{detail:{count:o,time:t.updatedAt}}))})})}function x(){m||(clearTimeout(b),b=setTimeout(f,l.debounceMs||300))}function u(e){if(!e)return;const o=e.style.borderColor,r=e.style.boxShadow,t=e.style.transition;e.style.transition="all 0.3s ease",e.style.borderColor="#10b981",e.style.boxShadow="0 0 0 3px rgba(16, 185, 129, 0.35)",setTimeout(()=>{e.style.borderColor=o,e.style.boxShadow=r,e.style.transition=t},2e3)}function w(e,o){if(!e||!e.fields){o&&o(0);return}m=!0;let r=0;Object.keys(e.fields).forEach(t=>{const i=e.fields[t];let n=null;if(i.selector)try{n=document.querySelector(i.selector)}catch{}if(!n&&i.name)try{i.type==="radio"?n=document.querySelector(`input[type="radio"][name="${CSS.escape(i.name)}"][value="${CSS.escape(i.value)}"]`):n=document.querySelector(`[name="${CSS.escape(i.name)}"]`)}catch{}if(!n&&i.label)try{n=document.querySelector(`[aria-label="${CSS.escape(i.label)}"]`)||document.querySelector(`[placeholder="${CSS.escape(i.label)}"]`)}catch{}if(n)try{i.type==="text"||i.type==="textarea"?(n.value=i.value,n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0})),r++,u(n)):i.type==="checkbox"?(n.checked=!!i.checked,n.dispatchEvent(new Event("change",{bubbles:!0})),r++,u(n)):i.type==="radio"?n.value===i.value&&(n.checked=!0,n.dispatchEvent(new Event("change",{bubbles:!0})),r++,u(n)):i.type==="select"?(n.value=i.value,n.dispatchEvent(new Event("change",{bubbles:!0})),r++,u(n)):i.type==="select-multiple"&&Array.isArray(i.values)?(Array.from(n.options).forEach(a=>{a.selected=i.values.includes(a.value)}),n.dispatchEvent(new Event("change",{bubbles:!0})),r++,u(n)):i.type.startsWith("gf-")&&n.getAttribute("aria-checked")!=="true"&&(n.click(),r++,u(n))}catch(a){console.warn("[FormRescuer] Error restoring field:",t,a)}}),setTimeout(()=>{m=!1,r>0&&l.showToast&&T(r),window.dispatchEvent(new CustomEvent("formrescuer:restored",{detail:{count:r}})),o&&o(r)},150)}function p(e="submit"){const o=d();c.get(["fr_draft_index"],r=>{const i=(r&&r.fr_draft_index?r.fr_draft_index:[]).filter(n=>n.key!==o);c.remove([o],()=>{c.set({fr_draft_index:i},()=>{try{typeof chrome<"u"&&chrome.runtime&&chrome.runtime.sendMessage&&chrome.runtime.sendMessage({action:"UPDATE_BADGE",count:0})}catch{}window.dispatchEvent(new CustomEvent("formrescuer:cleared",{detail:{reason:e}})),e==="submit"?E("✓ Form terkirim. Draf otomatis dibersihkan."):e==="manual"&&E("Draf formulir berhasil dihapus.")})})})}function T(e){const o=document.getElementById("formrescuer-toast");o&&o.remove();const r=document.createElement("div");r.id="formrescuer-toast",r.style.cssText=`
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
    `,r.innerHTML=`
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
          ${e} data kolom berhasil dipulihkan otomatis dari sesi sebelumnya!
        </div>
      </div>
      <button id="fr-toast-close" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px; display: flex; align-items: center; margin-left: 8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `,document.body.appendChild(r);const t=document.getElementById("fr-toast-close");t&&t.addEventListener("click",()=>{r.remove()}),setTimeout(()=>{r.parentElement&&(r.style.animation="frFadeOut 0.3s forwards",setTimeout(()=>r.remove(),300))},4500)}function E(e){const o=document.getElementById("formrescuer-toast");o&&o.remove();const r=document.createElement("div");r.id="formrescuer-toast",r.style.cssText=`
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
    `,r.textContent=e,document.body.appendChild(r),setTimeout(()=>{r.parentElement&&r.remove()},3e3)}function S(){const e=d();c.get([e],o=>{const r=o?o[e]:null;if(r&&r.fields){l.autoRestore&&w(r);try{typeof chrome<"u"&&chrome.runtime&&chrome.runtime.sendMessage&&chrome.runtime.sendMessage({action:"UPDATE_BADGE",count:r.fieldsCount||Object.keys(r.fields).length})}catch{}}})}function C(){_(()=>{setTimeout(S,150)}),document.addEventListener("input",x,{capture:!0,passive:!0}),document.addEventListener("change",x,{capture:!0,passive:!0}),document.addEventListener("blur",()=>{f()},{capture:!0,passive:!0}),window.addEventListener("beforeunload",()=>{f()}),window.addEventListener("pagehide",()=>{f()}),document.addEventListener("submit",e=>{p("submit")},{capture:!0}),document.addEventListener("click",e=>{const o=e.target;if(!o)return;const r=o.closest('button, input[type="submit"], div[role="button"]');if(r){const t=(r.textContent||r.value||"").trim().toLowerCase();(r.type==="submit"||t.includes("kirim")||t.includes("submit")||t.includes("send")||t.includes("daftar")||r.getAttribute("jsname")==="M2HAEc")&&setTimeout(()=>{p("submit")},600)}},{capture:!0})}typeof chrome<"u"&&chrome.runtime&&chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener((e,o,r)=>{if(e.action==="GET_CURRENT_STATUS"){const t=d();return c.get([t],i=>{r({pageKey:t,url:window.location.href,title:document.title,draft:i?i[t]:null})}),!0}if(e.action==="RESTORE_NOW"){const t=d();return c.get([t],i=>{i&&i[t]?w(i[t],n=>{r({success:!0,count:n})}):r({success:!1,message:"Tidak ada draf ditemukan."})}),!0}if(e.action==="CLEAR_CURRENT")return p("manual"),r({success:!0}),!0}),window.__FormRescuer={saveNow:f,restoreNow:S,clearNow:p,getPageKey:d},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",C):C()})();
