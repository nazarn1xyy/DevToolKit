import { icon } from '../icons.js';
import { copyText, haptic, showToast, shareToTelegram } from '../main.js';

function parseCurl(cmd) {
  const result = { method: 'GET', url: '', headers: {}, body: null };

  // Clean up multiline
  let s = cmd.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Remove 'curl' prefix
  s = s.replace(/^curl\s+/i, '');

  const tokens = [];
  let current = '';
  let inQuote = null;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuote) {
      if (c === inQuote) { inQuote = null; }
      else current += c;
    } else if (c === '"' || c === "'") {
      inQuote = c;
    } else if (c === ' ') {
      if (current) tokens.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (current) tokens.push(current);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '-X' || t === '--request') {
      result.method = tokens[++i]?.toUpperCase() || 'GET';
    } else if (t === '-H' || t === '--header') {
      const h = tokens[++i] || '';
      const idx = h.indexOf(':');
      if (idx > 0) {
        result.headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
      }
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
      result.body = tokens[++i] || '';
      if (result.method === 'GET') result.method = 'POST';
    } else if (!t.startsWith('-') && !result.url) {
      result.url = t;
    }
  }

  return result;
}

function toFetch(parsed) {
  const opts = [];
  opts.push(`  method: '${parsed.method}'`);

  const headerKeys = Object.keys(parsed.headers);
  if (headerKeys.length) {
    opts.push(`  headers: {\n${headerKeys.map(k => `    '${k}': '${parsed.headers[k]}'`).join(',\n')}\n  }`);
  }

  if (parsed.body) {
    opts.push(`  body: ${isJson(parsed.body) ? `JSON.stringify(${parsed.body})` : `'${esc(parsed.body)}'`}`);
  }

  return `const response = await fetch('${parsed.url}', {\n${opts.join(',\n')}\n});\n\nconst data = await response.json();`;
}

function toAxios(parsed) {
  const config = [];
  if (parsed.method !== 'GET') config.push(`  method: '${parsed.method.toLowerCase()}'`);
  config.push(`  url: '${parsed.url}'`);

  const headerKeys = Object.keys(parsed.headers);
  if (headerKeys.length) {
    config.push(`  headers: {\n${headerKeys.map(k => `    '${k}': '${parsed.headers[k]}'`).join(',\n')}\n  }`);
  }

  if (parsed.body) {
    config.push(`  data: ${isJson(parsed.body) ? parsed.body : `'${esc(parsed.body)}'`}`);
  }

  return `const { data } = await axios({\n${config.join(',\n')}\n});`;
}

function isJson(s) {
  try { JSON.parse(s); return true; } catch { return false; }
}

export function renderCurlConverter(container) {
  let format = 'fetch';
  let result = '';

  function render() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="section-title">cURL Command</div>
          <textarea class="input" id="cc-input" placeholder="curl -X POST https://api.example.com -H 'Content-Type: application/json' -d '{\"key\":\"value\"}'" rows="5" spellcheck="false" style="font-size:12px"></textarea>
          <div class="tabs">
            <button class="tab${format==='fetch'?' active':''}" data-t="fetch">fetch()</button>
            <button class="tab${format==='axios'?' active':''}" data-t="axios">axios</button>
          </div>
          <button class="btn" id="cc-convert">${icon('arrowLeftRight',18)} Convert</button>
        </div>
        <div id="cc-out" class="hidden">
          <div class="section flex-col gap-md">
            <div class="code-block-header">
              <span>JAVASCRIPT</span>
              <div class="flex-row gap-sm">
                <button class="btn btn-sm btn-secondary" id="cc-copy">${icon('copy',14)} Copy</button>
                <button class="btn-share btn-sm" id="cc-share">${icon('send',14)} Share</button>
              </div>
            </div>
            <div class="code-block" id="cc-result" style="max-height:350px;overflow-y:auto"></div>
          </div>
        </div>
      </div>`;

    container.querySelector('.tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (t) { format = t.dataset.t; haptic('light'); render(); }
    });

    container.querySelector('#cc-convert').addEventListener('click', () => {
      const curl = container.querySelector('#cc-input').value.trim();
      if (!curl) { showToast('Paste a cURL command'); haptic('error'); return; }

      try {
        const parsed = parseCurl(curl);
        if (!parsed.url) { showToast('No URL found'); haptic('error'); return; }
        result = format === 'fetch' ? toFetch(parsed) : toAxios(parsed);
        container.querySelector('#cc-result').textContent = result;
        container.querySelector('#cc-out').classList.remove('hidden');
        haptic('success');
      } catch (e) {
        showToast('Parse error');
        haptic('error');
      }
    });

    container.querySelector('#cc-copy')?.addEventListener('click', () => { if (result) copyText(result); });
    container.querySelector('#cc-share')?.addEventListener('click', () => { if (result) shareToTelegram(result); });
  }
  render();
}

function esc(s) { return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
