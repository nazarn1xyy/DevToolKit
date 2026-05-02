import { icon } from '../icons.js';
import { copyText, haptic, shareToTelegram } from '../main.js';

function computeDiff(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const result = [];
  const maxLen = Math.max(linesA.length, linesB.length);

  // Simple LCS-based diff
  const lcs = [];
  for (let i = 0; i <= linesA.length; i++) {
    lcs[i] = [];
    for (let j = 0; j <= linesB.length; j++) {
      if (i === 0 || j === 0) lcs[i][j] = 0;
      else if (linesA[i-1] === linesB[j-1]) lcs[i][j] = lcs[i-1][j-1] + 1;
      else lcs[i][j] = Math.max(lcs[i-1][j], lcs[i][j-1]);
    }
  }

  // Backtrack
  let i = linesA.length, j = linesB.length;
  const ops = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i-1] === linesB[j-1]) {
      ops.unshift({ type: 'ctx', text: linesA[i-1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || lcs[i][j-1] >= lcs[i-1][j])) {
      ops.unshift({ type: 'add', text: linesB[j-1] });
      j--;
    } else {
      ops.unshift({ type: 'del', text: linesA[i-1] });
      i--;
    }
  }
  return ops;
}

export function renderDiff(container) {
  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      <div class="section flex-col gap-md">
        <div class="section-title">Original</div>
        <textarea class="input" id="df-a" placeholder="Paste original text..." rows="5" spellcheck="false"></textarea>
      </div>
      <div class="section flex-col gap-md">
        <div class="section-title">Modified</div>
        <textarea class="input" id="df-b" placeholder="Paste modified text..." rows="5" spellcheck="false"></textarea>
      </div>
      <button class="btn" id="df-compare">${icon('diff',18)} Compare</button>
      <div id="df-out" class="hidden"></div>
    </div>`;

  container.querySelector('#df-compare').addEventListener('click', () => {
    const a = container.querySelector('#df-a').value;
    const b = container.querySelector('#df-b').value;
    const ops = computeDiff(a, b);

    const adds = ops.filter(o => o.type === 'add').length;
    const dels = ops.filter(o => o.type === 'del').length;

    const out = container.querySelector('#df-out');
    out.classList.remove('hidden');
    out.innerHTML = `
      <div class="section flex-col gap-md">
        <div class="code-block-header">
          <span style="color:#4ade80">+${adds}</span>&nbsp;&nbsp;<span style="color:#f87171">-${dels}</span>
          <div class="flex-row gap-sm">
            <button class="btn btn-sm btn-secondary" id="df-copy">${icon('copy',14)} Copy</button>
            <button class="btn-share btn-sm" id="df-share">${icon('send',14)} Share</button>
          </div>
        </div>
        <div class="code-block" style="max-height:400px;overflow-y:auto;padding:0">
          ${ops.map(o => {
            const cls = o.type === 'add' ? 'diff-add' : o.type === 'del' ? 'diff-del' : 'diff-ctx';
            const prefix = o.type === 'add' ? '+' : o.type === 'del' ? '-' : ' ';
            return `<div class="diff-line ${cls}" style="padding:2px 14px">${prefix} ${esc(o.text)}</div>`;
          }).join('')}
        </div>
      </div>`;

    const diffText = ops.map(o => {
      const prefix = o.type === 'add' ? '+' : o.type === 'del' ? '-' : ' ';
      return `${prefix} ${o.text}`;
    }).join('\n');

    out.querySelector('#df-copy')?.addEventListener('click', () => copyText(diffText));
    out.querySelector('#df-share')?.addEventListener('click', () => shareToTelegram(diffText));
    haptic('success');
  });
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
