import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

export function renderDictJson(container) {
  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      <div class="section flex-col gap-md">
        <div class="section-title">Python Dict</div>
        <textarea class="input" id="dj-input" placeholder="{'name': 'Nazar', 'active': True, 'data': None}" rows="5" spellcheck="false"></textarea>
        <div class="btn-row">
          <button class="btn" id="dj-to-json">${icon('braces',18)} → JSON</button>
          <button class="btn btn-secondary" id="dj-to-dict">${icon('code',18)} → Dict</button>
        </div>
      </div>
      <div id="dj-out-section" class="hidden">
        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span id="dj-label">OUTPUT</span>
            <button class="btn btn-sm btn-secondary" id="dj-copy">${icon('copy',14)} Copy</button>
          </div>
          <div class="code-block" id="dj-output" style="max-height:300px;overflow-y:auto"></div>
        </div>
      </div>
    </div>`;

  let result = '';
  const inp = container.querySelector('#dj-input');
  const out = container.querySelector('#dj-output');
  const sec = container.querySelector('#dj-out-section');
  const lbl = container.querySelector('#dj-label');

  function dictToJson(s) {
    return s
      .replace(/'/g, '"')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/,\s*([}\]])/g, '$1') // trailing commas
      .replace(/\(\s*/g, '[').replace(/\s*\)/g, ']'); // tuples → arrays
  }

  function jsonToDict(s) {
    return s
      .replace(/"/g, "'")
      .replace(/\btrue\b/g, 'True')
      .replace(/\bfalse\b/g, 'False')
      .replace(/\bnull\b/g, 'None');
  }

  container.querySelector('#dj-to-json').addEventListener('click', () => {
    try {
      const converted = dictToJson(inp.value);
      const parsed = JSON.parse(converted);
      result = JSON.stringify(parsed, null, 2);
      out.textContent = result;
      lbl.textContent = 'JSON';
      sec.classList.remove('hidden');
      haptic('success');
    } catch (e) {
      out.innerHTML = `<span style="color:#ff6b6b">${e.message}</span>`;
      sec.classList.remove('hidden');
      haptic('error');
    }
  });

  container.querySelector('#dj-to-dict').addEventListener('click', () => {
    try {
      JSON.parse(inp.value); // validate
      result = jsonToDict(JSON.stringify(JSON.parse(inp.value), null, 4));
      out.textContent = result;
      lbl.textContent = 'PYTHON DICT';
      sec.classList.remove('hidden');
      haptic('success');
    } catch (e) {
      out.innerHTML = `<span style="color:#ff6b6b">${e.message}</span>`;
      sec.classList.remove('hidden');
      haptic('error');
    }
  });

  container.querySelector('#dj-copy').addEventListener('click', () => { if (result) copyText(result); });
}
