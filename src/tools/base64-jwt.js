import { icon } from '../icons.js';
import { copyText, haptic, showToast } from '../main.js';

export function renderBase64Jwt(container) {
  let tab = 'base64';

  function render() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="tabs">
            <button class="tab${tab==='base64'?' active':''}" data-t="base64">Base64</button>
            <button class="tab${tab==='jwt'?' active':''}" data-t="jwt">JWT</button>
          </div>
        </div>
        ${tab === 'base64' ? renderBase64() : renderJwt()}
      </div>`;

    container.querySelector('.tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (t) { tab = t.dataset.t; haptic('light'); render(); }
    });

    if (tab === 'base64') bindBase64();
    else bindJwt();
  }

  function renderBase64() {
    return `
      <div class="section flex-col gap-md">
        <div class="section-title">Input</div>
        <textarea class="input" id="b64-input" placeholder="Enter text or Base64 string..." rows="4" spellcheck="false"></textarea>
        <div class="btn-row">
          <button class="btn" id="b64-encode">${icon('lock',18)} Encode</button>
          <button class="btn btn-secondary" id="b64-decode">${icon('key',18)} Decode</button>
        </div>
      </div>
      <div id="b64-out" class="hidden">
        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span>RESULT</span>
            <button class="btn btn-sm btn-secondary" id="b64-copy">${icon('copy',14)} Copy</button>
          </div>
          <div class="code-block" id="b64-result" style="max-height:250px;overflow-y:auto"></div>
        </div>
      </div>`;
  }

  function bindBase64() {
    let result = '';
    container.querySelector('#b64-encode')?.addEventListener('click', () => {
      try {
        result = btoa(unescape(encodeURIComponent(container.querySelector('#b64-input').value)));
        container.querySelector('#b64-result').textContent = result;
        container.querySelector('#b64-out').classList.remove('hidden');
        haptic('success');
      } catch (e) { showToast('Encode error'); haptic('error'); }
    });
    container.querySelector('#b64-decode')?.addEventListener('click', () => {
      try {
        result = decodeURIComponent(escape(atob(container.querySelector('#b64-input').value.trim())));
        container.querySelector('#b64-result').textContent = result;
        container.querySelector('#b64-out').classList.remove('hidden');
        haptic('success');
      } catch (e) { showToast('Invalid Base64'); haptic('error'); }
    });
    container.querySelector('#b64-copy')?.addEventListener('click', () => { if (result) copyText(result); });
  }

  function renderJwt() {
    return `
      <div class="section flex-col gap-md">
        <div class="section-title">JWT Token</div>
        <textarea class="input" id="jwt-input" placeholder="eyJhbGciOiJIUzI1NiIs..." rows="4" spellcheck="false" style="font-size:12px;word-break:break-all"></textarea>
        <button class="btn" id="jwt-decode">${icon('key',18)} Decode</button>
      </div>
      <div id="jwt-out" class="hidden flex-col gap-md"></div>`;
  }

  function bindJwt() {
    container.querySelector('#jwt-decode')?.addEventListener('click', () => {
      const token = container.querySelector('#jwt-input').value.trim();
      const parts = token.split('.');
      if (parts.length !== 3) { showToast('Invalid JWT (need 3 parts)'); haptic('error'); return; }

      try {
        const header = JSON.parse(atob(parts[0].replace(/-/g,'+').replace(/_/g,'/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));

        // Check expiration
        let expInfo = '';
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          const expired = expDate < now;
          expInfo = `<div style="padding:8px 12px;border-radius:var(--radius-xs);background:${expired?'rgba(248,113,113,0.1)':'rgba(74,222,128,0.1)'};font-size:13px;color:${expired?'#f87171':'#4ade80'}">
            ${expired ? 'EXPIRED' : 'Valid'} — ${expDate.toLocaleString()}
          </div>`;
        }

        const out = container.querySelector('#jwt-out');
        out.classList.remove('hidden');
        out.innerHTML = `
          ${expInfo}
          <div class="section flex-col gap-md">
            <div class="code-block-header">
              <span>HEADER</span>
              <button class="btn btn-sm btn-secondary jwt-copy" data-v='${esc(JSON.stringify(header,null,2))}'>${icon('copy',14)}</button>
            </div>
            <div class="code-block" style="font-size:12px">${esc(JSON.stringify(header, null, 2))}</div>
          </div>
          <div class="section flex-col gap-md">
            <div class="code-block-header">
              <span>PAYLOAD</span>
              <button class="btn btn-sm btn-secondary jwt-copy" data-v='${esc(JSON.stringify(payload,null,2))}'>${icon('copy',14)}</button>
            </div>
            <div class="code-block" style="font-size:12px">${esc(JSON.stringify(payload, null, 2))}</div>
          </div>
          <div class="section flex-col gap-md">
            <div class="code-block-header"><span>SIGNATURE</span></div>
            <div class="code-block" style="font-size:11px;word-break:break-all;color:var(--text-secondary)">${esc(parts[2])}</div>
          </div>`;

        out.querySelectorAll('.jwt-copy').forEach(btn => {
          btn.addEventListener('click', () => copyText(btn.dataset.v));
        });
        haptic('success');
      } catch (e) {
        showToast('Failed to decode JWT');
        haptic('error');
      }
    });
  }

  render();
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
