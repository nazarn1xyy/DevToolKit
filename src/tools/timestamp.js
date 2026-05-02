import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

export function renderTimestamp(container) {
  function now() { return Math.floor(Date.now() / 1000); }

  function render() {
    const current = now();
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="section-title">Current Time</div>
          <div class="code-block" style="text-align:center;font-size:20px;font-weight:600;padding:16px" id="ts-live">${current}</div>
          <div style="text-align:center;font-size:13px;color:var(--text-secondary)" id="ts-live-human">${new Date(current * 1000).toLocaleString()}</div>
          <button class="btn btn-secondary" id="ts-copy-now">${icon('copy',18)} Copy timestamp</button>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Unix → Human</div>
          <input class="input" id="ts-unix" placeholder="1714608000" spellcheck="false" type="number" style="font-family:'SF Mono',monospace">
          <div id="ts-human-out" class="hidden">
            <div class="code-block" id="ts-human" style="font-size:14px;text-align:center;padding:12px"></div>
          </div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Human → Unix</div>
          <input class="input" id="ts-date" type="datetime-local">
          <div id="ts-unix-out" class="hidden">
            <div class="flex-row" style="gap:8px">
              <div class="code-block flex-1" id="ts-unix-result" style="text-align:center;font-size:16px;font-weight:600;padding:12px"></div>
              <button class="btn btn-secondary" id="ts-copy-result">${icon('copy',18)}</button>
            </div>
          </div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Quick Timestamps</div>
          <div class="flex-col gap-sm">
            ${[
              { label: 'Now', val: current },
              { label: '1 hour ago', val: current - 3600 },
              { label: '24 hours ago', val: current - 86400 },
              { label: '7 days ago', val: current - 604800 },
              { label: 'Start of today', val: Math.floor(new Date().setHours(0,0,0,0) / 1000) },
              { label: 'Start of year', val: Math.floor(new Date(new Date().getFullYear(),0,1).getTime() / 1000) },
            ].map(t => `
              <div class="flex-row ts-quick" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer" data-v="${t.val}">
                <span style="font-size:13px;color:var(--text-secondary)">${t.label}</span>
                <code style="font-size:13px">${t.val}</code>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;

    // Live ticker
    const liveEl = container.querySelector('#ts-live');
    const liveHuman = container.querySelector('#ts-live-human');
    const ticker = setInterval(() => {
      const n = now();
      if (liveEl) liveEl.textContent = n;
      if (liveHuman) liveHuman.textContent = new Date(n * 1000).toLocaleString();
    }, 1000);

    container.querySelector('#ts-copy-now').addEventListener('click', () => copyText(String(now())));

    // Unix → Human
    container.querySelector('#ts-unix').addEventListener('input', e => {
      const v = parseInt(e.target.value);
      const out = container.querySelector('#ts-human-out');
      const el = container.querySelector('#ts-human');
      if (!isNaN(v) && v > 0) {
        const d = new Date(v * (v > 1e12 ? 1 : 1000)); // auto-detect ms vs s
        el.innerHTML = `${d.toLocaleString()}<br><span style="font-size:12px;color:var(--text-secondary)">${d.toISOString()}</span>`;
        out.classList.remove('hidden');
      } else {
        out.classList.add('hidden');
      }
    });

    // Human → Unix
    container.querySelector('#ts-date').addEventListener('input', e => {
      const d = new Date(e.target.value);
      const out = container.querySelector('#ts-unix-out');
      const el = container.querySelector('#ts-unix-result');
      if (!isNaN(d.getTime())) {
        const ts = Math.floor(d.getTime() / 1000);
        el.textContent = ts;
        out.classList.remove('hidden');
        container.querySelector('#ts-copy-result').addEventListener('click', () => copyText(String(ts)));
      }
    });

    // Quick timestamps
    container.querySelectorAll('.ts-quick').forEach(el => {
      el.addEventListener('click', () => copyText(el.dataset.v));
    });

    return () => clearInterval(ticker);
  }

  return render();
}
