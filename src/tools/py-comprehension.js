import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

export function renderComprehension(container) {
  const state = { iterable: 'items', var: 'x', expr: 'x', cond: '', type: 'list' };

  function generate() {
    const v = state.var, it = state.iterable, ex = state.expr, c = state.cond;
    const condPart = c ? ` if ${c}` : '';
    if (state.type === 'list') return `[${ex} for ${v} in ${it}${condPart}]`;
    if (state.type === 'set') return `{${ex} for ${v} in ${it}${condPart}}`;
    if (state.type === 'dict') return `{${ex} for ${v} in ${it}${condPart}}`;
    return `(${ex} for ${v} in ${it}${condPart})`;
  }

  function render() {
    const result = generate();
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="code-block" style="text-align:center;font-size:15px;padding:20px" id="lc-preview">${esc(result)}</div>
          <button class="btn btn-secondary" id="lc-copy">${icon('copy',18)} Copy</button>
        </div>
        <div class="section flex-col gap-md">
          <div class="tabs">
            <button class="tab${state.type==='list'?' active':''}" data-t="list">List</button>
            <button class="tab${state.type==='dict'?' active':''}" data-t="dict">Dict</button>
            <button class="tab${state.type==='set'?' active':''}" data-t="set">Set</button>
            <button class="tab${state.type==='gen'?' active':''}" data-t="gen">Gen</button>
          </div>
        </div>
        <div class="section flex-col gap-md">
          <div class="css-gen-row">
            <label>Expression</label>
            <input class="input" id="lc-expr" value="${esc(state.expr)}" placeholder="x.upper()" spellcheck="false">
          </div>
          <div class="css-gen-row">
            <label>Variable</label>
            <input class="input" id="lc-var" value="${esc(state.var)}" placeholder="x" spellcheck="false">
          </div>
          <div class="css-gen-row">
            <label>Iterable</label>
            <input class="input" id="lc-iter" value="${esc(state.iterable)}" placeholder="range(10)" spellcheck="false">
          </div>
          <div class="css-gen-row">
            <label>Condition (optional)</label>
            <input class="input" id="lc-cond" value="${esc(state.cond)}" placeholder="x > 5" spellcheck="false">
          </div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Examples</div>
          <div class="flex-col gap-sm">
            ${[
              { expr: 'x ** 2', var: 'x', iter: 'range(10)', cond: 'x % 2 == 0', label: 'Even squares' },
              { expr: 'word.upper()', var: 'word', iter: 'words', cond: 'len(word) > 3', label: 'Uppercase long words' },
              { expr: 'k: v', var: 'k, v', iter: 'data.items()', cond: 'v is not None', label: 'Filter None values' },
            ].map(ex => `
              <div class="snippet-item lc-example" data-expr="${ex.expr}" data-var="${ex.var}" data-iter="${ex.iter}" data-cond="${ex.cond}" style="cursor:pointer;padding:10px 14px">
                <span style="font-size:13px;font-weight:500">${ex.label}</span>
                <span class="snippet-code" style="max-height:20px;font-size:11px">${esc(`[${ex.expr} for ${ex.var} in ${ex.iter} if ${ex.cond}]`)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;

    // Tabs
    container.querySelector('.tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (t) { state.type = t.dataset.t; haptic('light'); render(); }
    });

    // Inputs
    ['expr','var','iter','cond'].forEach(key => {
      const el = container.querySelector(`#lc-${key === 'iter' ? 'iter' : key}`);
      if (!el) return;
      el.addEventListener('input', e => {
        const mapKey = key === 'iter' ? 'iterable' : key;
        state[mapKey] = e.target.value;
        container.querySelector('#lc-preview').textContent = generate();
      });
    });

    container.querySelector('#lc-copy').addEventListener('click', () => copyText(generate()));

    // Examples
    container.querySelectorAll('.lc-example').forEach(ex => {
      ex.addEventListener('click', () => {
        state.expr = ex.dataset.expr;
        state.var = ex.dataset.var;
        state.iterable = ex.dataset.iter;
        state.cond = ex.dataset.cond;
        haptic('light');
        render();
      });
    });
  }
  render();
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
