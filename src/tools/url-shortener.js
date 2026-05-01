import { icon } from '../icons.js';
import { copyText, showToast, haptic } from '../main.js';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('dt_urls') || '[]'); } catch { return []; }
}

function saveHistory(item) {
  const list = loadHistory();
  list.unshift(item);
  localStorage.setItem('dt_urls', JSON.stringify(list.slice(0, 20)));
}

export function renderUrlShortener(container) {
  function render() {
    const history = loadHistory();
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <input type="url" class="input" id="url-input" placeholder="Paste URL here..." spellcheck="false" autocomplete="off">
          <button class="btn" id="url-shorten">${icon('link', 18)} Shorten</button>
        </div>
        <div id="url-result-area" class="hidden">
          <div class="section flex-col gap-md">
            <div class="section-title">Shortened</div>
            <div class="url-result">
              <span class="url-result-text" id="url-short"></span>
              <button class="btn btn-sm btn-secondary" id="url-copy-res">${icon('copy', 14)}</button>
            </div>
          </div>
        </div>
        ${history.length ? `
        <div class="section flex-col gap-md">
          <div class="section-title">History</div>
          <div class="flex-col gap-sm">${history.map(h => `
            <div class="url-result">
              <div class="flex-col flex-1" style="gap:2px;overflow:hidden">
                <span class="url-result-text" style="font-size:13px">${h.short}</span>
                <span style="font-size:11px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.original}</span>
              </div>
              <button class="btn btn-sm btn-secondary hist-cp" data-u="${h.short}">${icon('copy', 14)}</button>
            </div>`).join('')}
          </div>
          <button class="btn btn-sm btn-secondary" id="url-clear">${icon('trash', 14)} Clear</button>
        </div>` : ''}
      </div>`;

    const inp = container.querySelector('#url-input');
    const btn = container.querySelector('#url-shorten');

    async function shorten() {
      const url = inp.value.trim();
      if (!url || !/^https?:\/\/.+/i.test(url)) { showToast('Enter valid URL'); haptic('error'); return; }
      btn.disabled = true; btn.textContent = '...';
      try {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        const short = await res.text();
        container.querySelector('#url-result-area').classList.remove('hidden');
        container.querySelector('#url-short').textContent = short;
        saveHistory({ short, original: url }); haptic('success');
        container.querySelector('#url-copy-res').onclick = () => copyText(short);
      } catch { showToast('Failed'); haptic('error'); }
      btn.disabled = false; btn.innerHTML = `${icon('link', 18)} Shorten`;
    }

    btn.addEventListener('click', shorten);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') shorten(); });
    container.querySelectorAll('.hist-cp').forEach(b => b.addEventListener('click', () => copyText(b.dataset.u)));
    container.querySelector('#url-clear')?.addEventListener('click', () => { localStorage.removeItem('dt_urls'); haptic('medium'); render(); });
  }
  render();
}
