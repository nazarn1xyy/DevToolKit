import { icon } from '../icons.js';
import { copyText, haptic, showToast, shareToTelegram } from '../main.js';

const ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'];

async function hash(algo, text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function renderHashGen(container) {
  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      <div class="section flex-col gap-md">
        <div class="section-title">Input</div>
        <textarea class="input" id="hg-input" placeholder="Enter text to hash..." rows="3" spellcheck="false"></textarea>
        <button class="btn" id="hg-hash">${icon('hash',18)} Generate Hashes</button>
      </div>
      <div id="hg-results" class="flex-col gap-md"></div>
      <div class="section flex-col gap-md">
        <div class="section-title">Compare Hashes</div>
        <input class="input" id="hg-a" placeholder="Hash A" spellcheck="false" style="font-family:'SF Mono',monospace;font-size:12px">
        <input class="input" id="hg-b" placeholder="Hash B" spellcheck="false" style="font-family:'SF Mono',monospace;font-size:12px">
        <div id="hg-compare"></div>
      </div>
    </div>`;

  container.querySelector('#hg-hash').addEventListener('click', async () => {
    const text = container.querySelector('#hg-input').value;
    if (!text) { showToast('Enter text'); haptic('error'); return; }

    const results = container.querySelector('#hg-results');
    results.innerHTML = '';

    for (const algo of ALGORITHMS) {
      const h = await hash(algo, text);
      results.innerHTML += `
        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span>${algo}</span>
            <div class="flex-row gap-sm">
              <button class="btn btn-sm btn-secondary hg-copy" data-h="${h}">${icon('copy',14)} Copy</button>
              <button class="btn-share btn-sm hg-share" data-h="${algo}: ${h}">${icon('send',14)} Share</button>
            </div>
          </div>
          <div class="code-block" style="font-size:11px;word-break:break-all">${h}</div>
        </div>`;
    }

    results.querySelectorAll('.hg-copy').forEach(btn => {
      btn.addEventListener('click', () => copyText(btn.dataset.h));
    });
    results.querySelectorAll('.hg-share').forEach(btn => {
      btn.addEventListener('click', () => shareToTelegram(btn.dataset.h));
    });
    haptic('success');
  });

  // Compare
  const checkCompare = () => {
    const a = container.querySelector('#hg-a').value.trim().toLowerCase();
    const b = container.querySelector('#hg-b').value.trim().toLowerCase();
    const el = container.querySelector('#hg-compare');
    if (!a || !b) { el.innerHTML = ''; return; }
    const match = a === b;
    el.innerHTML = `<div style="padding:8px 12px;border-radius:var(--radius-xs);background:${match?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)'};font-size:13px;font-weight:600;color:${match?'#4ade80':'#f87171'};text-align:center">${match ? 'MATCH' : 'NO MATCH'}</div>`;
  };
  container.querySelector('#hg-a').addEventListener('input', checkCompare);
  container.querySelector('#hg-b').addEventListener('input', checkCompare);
}
