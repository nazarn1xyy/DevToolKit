// Color Contrast Checker — WCAG AA/AAA compliance
import { icon } from '../icons.js';
import { haptic } from '../main.js';

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function grade(ratio, level, size) {
  // WCAG 2.1 thresholds
  if (level === 'AAA') return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  return size === 'large' ? ratio >= 3 : ratio >= 4.5; // AA
}

export function renderContrastChecker(container) {
  let fg = '#ffffff';
  let bg = '#000000';

  function render() {
    const ratio = contrastRatio(fg, bg);
    const ratioStr = ratio.toFixed(2);

    const aaLarge = grade(ratio, 'AA', 'large');
    const aaNormal = grade(ratio, 'AA', 'normal');
    const aaaLarge = grade(ratio, 'AAA', 'large');
    const aaaNormal = grade(ratio, 'AAA', 'normal');

    const pass = (v) => v
      ? '<span style="color:#4ade80;font-weight:600">PASS</span>'
      : '<span style="color:#f87171;font-weight:600">FAIL</span>';

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="section-title">Colors</div>
          <div class="flex-row gap-md">
            <div class="flex-col flex-1 gap-sm">
              <label style="font-size:12px;color:var(--text-secondary)">Foreground</label>
              <div class="color-input-row">
                <input type="color" id="cc-fg" value="${fg}">
                <input class="input" id="cc-fg-hex" value="${fg}" spellcheck="false" style="font-family:monospace;font-size:13px">
              </div>
            </div>
            <div class="flex-col flex-1 gap-sm">
              <label style="font-size:12px;color:var(--text-secondary)">Background</label>
              <div class="color-input-row">
                <input type="color" id="cc-bg" value="${bg}">
                <input class="input" id="cc-bg-hex" value="${bg}" spellcheck="false" style="font-family:monospace;font-size:13px">
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" id="cc-swap" style="align-self:center">${icon('arrowLeftRight',16)} Swap</button>
        </div>

        <div class="section" style="padding:0;overflow:hidden">
          <div id="cc-preview" style="background:${bg};color:${fg};padding:24px;text-align:center;transition:all 0.2s">
            <div style="font-size:28px;font-weight:700;margin-bottom:4px">${ratioStr}:1</div>
            <div style="font-size:14px;opacity:0.8">Contrast Ratio</div>
            <div style="margin-top:16px;font-size:18px;font-weight:600">The quick brown fox</div>
            <div style="margin-top:4px;font-size:14px">jumps over the lazy dog</div>
            <div style="margin-top:4px;font-size:11px">Small text sample (11px)</div>
          </div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">WCAG 2.1 Compliance</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border-radius:var(--radius-xs);overflow:hidden">
            <div style="background:var(--bg-card);padding:12px;text-align:center">
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">AA Normal</div>
              ${pass(aaNormal)}
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">≥ 4.5:1</div>
            </div>
            <div style="background:var(--bg-card);padding:12px;text-align:center">
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">AA Large</div>
              ${pass(aaLarge)}
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">≥ 3:1</div>
            </div>
            <div style="background:var(--bg-card);padding:12px;text-align:center">
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">AAA Normal</div>
              ${pass(aaaNormal)}
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">≥ 7:1</div>
            </div>
            <div style="background:var(--bg-card);padding:12px;text-align:center">
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">AAA Large</div>
              ${pass(aaaLarge)}
              <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px">≥ 4.5:1</div>
            </div>
          </div>
        </div>
      </div>`;

    // Bindings
    const fgColor = container.querySelector('#cc-fg');
    const fgHex = container.querySelector('#cc-fg-hex');
    const bgColor = container.querySelector('#cc-bg');
    const bgHex = container.querySelector('#cc-bg-hex');

    fgColor.addEventListener('input', e => { fg = e.target.value; render(); });
    fgHex.addEventListener('input', e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { fg = e.target.value; render(); } });
    bgColor.addEventListener('input', e => { bg = e.target.value; render(); });
    bgHex.addEventListener('input', e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { bg = e.target.value; render(); } });

    container.querySelector('#cc-swap').addEventListener('click', () => {
      [fg, bg] = [bg, fg];
      haptic('light');
      render();
    });
  }

  render();
}
