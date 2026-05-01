import { icon } from '../icons.js';
import { copyText, showToast, haptic } from '../main.js';

function highlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, m => {
      if (m.endsWith(':')) return `<span class="json-key">${m}</span>`;
      return `<span class="json-string">${m}</span>`;
    })
    .replace(/\b(true|false)\b/g, '<span class="json-bool">$1</span>')
    .replace(/\bnull\b/g, '<span class="json-null">null</span>')
    .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="json-number">$1</span>');
}

export function renderJsonFormatter(container) {
  let formatted = '';

  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      <div class="section flex-col gap-md">
        <textarea class="input" id="jf-input" placeholder='Paste JSON here...' rows="6" spellcheck="false"></textarea>
        <div class="btn-row">
          <button class="btn" id="jf-format">${icon('braces', 18)} Format</button>
          <button class="btn btn-secondary" id="jf-minify">${icon('minimize', 18)} Min</button>
        </div>
      </div>
      <div id="jf-output-section" class="hidden">
        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span id="jf-status"></span>
            <button class="btn btn-sm btn-secondary" id="jf-copy">${icon('copy', 14)} Copy</button>
          </div>
          <div class="code-block json-output" id="jf-output"></div>
        </div>
      </div>
    </div>`;

  const input = container.querySelector('#jf-input');
  const output = container.querySelector('#jf-output');
  const outSection = container.querySelector('#jf-output-section');
  const status = container.querySelector('#jf-status');

  function doFormat(minify) {
    const raw = input.value.trim();
    if (!raw) { showToast('Paste JSON first'); haptic('error'); return; }
    try {
      const parsed = JSON.parse(raw);
      formatted = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      output.innerHTML = minify ? formatted : highlight(formatted);
      outSection.classList.remove('hidden');
      status.textContent = minify ? 'MINIFIED' : `FORMATTED · ${formatted.length} chars`;
      haptic('success');
    } catch (e) {
      output.innerHTML = `<span style="color:#ff6b6b">${e.message}</span>`;
      outSection.classList.remove('hidden');
      status.textContent = 'ERROR';
      haptic('error');
    }
  }

  container.querySelector('#jf-format').addEventListener('click', () => doFormat(false));
  container.querySelector('#jf-minify').addEventListener('click', () => doFormat(true));
  container.querySelector('#jf-copy').addEventListener('click', () => {
    if (formatted) copyText(formatted);
  });
}
