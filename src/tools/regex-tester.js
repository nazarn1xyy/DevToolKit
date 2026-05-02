import { icon } from '../icons.js';
import { copyText, haptic, showToast } from '../main.js';

export function renderRegex(container) {
  let flags = 'g';

  function render() {
    const patVal = container.querySelector('#rx-pat')?.value || '';
    const testVal = container.querySelector('#rx-test')?.value || '';

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="section-title">Pattern</div>
          <div class="color-input-row">
            <input class="input" id="rx-pat" placeholder="[a-z]+@[a-z]+\\.com" value="${esc(patVal)}" spellcheck="false" style="font-family:'SF Mono',monospace;font-size:13px">
          </div>
          <div class="flex-row gap-sm" style="flex-wrap:wrap">
            ${['g','i','m','s'].map(f => `
              <button class="btn btn-sm ${flags.includes(f)?'':'btn-secondary'}" data-flag="${f}" style="min-width:40px">${f}</button>
            `).join('')}
          </div>
        </div>
        <div class="section flex-col gap-md">
          <div class="section-title">Test String</div>
          <textarea class="input" id="rx-test" placeholder="Enter text to test against..." rows="4" spellcheck="false">${esc(testVal)}</textarea>
        </div>
        <div id="rx-results"></div>
      </div>`;

    // Flag buttons
    container.querySelectorAll('[data-flag]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.flag;
        flags = flags.includes(f) ? flags.replace(f, '') : flags + f;
        haptic('light');
        render();
        runMatch();
      });
    });

    container.querySelector('#rx-pat').addEventListener('input', runMatch);
    container.querySelector('#rx-test').addEventListener('input', runMatch);

    runMatch();
  }

  function runMatch() {
    const patEl = container.querySelector('#rx-pat');
    const testEl = container.querySelector('#rx-test');
    const results = container.querySelector('#rx-results');
    if (!patEl || !testEl || !results) return;

    const pattern = patEl.value;
    const test = testEl.value;
    if (!pattern || !test) { results.innerHTML = ''; return; }

    try {
      const re = new RegExp(pattern, flags);
      const matches = [];
      let m;

      if (flags.includes('g')) {
        while ((m = re.exec(test)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0] === '') re.lastIndex++;
        }
      } else {
        m = re.exec(test);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }

      // Highlighted text
      let highlighted = '';
      let lastIdx = 0;
      for (const mt of matches) {
        highlighted += esc(test.slice(lastIdx, mt.index));
        highlighted += `<span class="regex-match">${esc(mt.match)}</span>`;
        lastIdx = mt.index + mt.match.length;
      }
      highlighted += esc(test.slice(lastIdx));

      results.innerHTML = `
        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span>${matches.length} match${matches.length !== 1 ? 'es' : ''}</span>
            <button class="btn btn-sm btn-secondary" id="rx-copy">${icon('copy',14)} Copy regex</button>
          </div>
          <div class="code-block" style="white-space:pre-wrap;line-height:1.8">${highlighted}</div>
          ${matches.length && matches[0].groups.length ? `
          <div class="section-title" style="margin-top:8px">Groups</div>
          <div class="flex-col gap-sm">
            ${matches.map((mt, mi) => mt.groups.map((g, gi) =>
              `<div class="flex-row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
                <code style="font-size:12px">Match ${mi+1}, Group ${gi+1}</code>
                <code style="font-size:12px;color:var(--text-secondary)">${esc(g || '(empty)')}</code>
              </div>`
            ).join('')).join('')}
          </div>` : ''}
        </div>`;

      results.querySelector('#rx-copy')?.addEventListener('click', () => copyText(`/${pattern}/${flags}`));
    } catch (e) {
      results.innerHTML = `<div class="section"><span style="color:#f87171;font-size:13px">${e.message}</span></div>`;
    }
  }

  render();
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
