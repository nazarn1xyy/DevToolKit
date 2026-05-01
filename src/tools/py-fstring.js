import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

export function renderFstring(container) {
  const state = { vars: [{ name: 'name', value: "'World'" }], template: 'Hello, {name}!' };

  function buildResult() {
    return `f"${state.template}"`;
  }

  function preview() {
    let s = state.template;
    for (const v of state.vars) {
      s = s.replace(new RegExp(`\\{${v.name}(:[^}]*)?\\}`, 'g'), v.value.replace(/^'|'$/g, ''));
    }
    return s;
  }

  function render() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="section-title">Result</div>
          <div class="code-block" style="text-align:center;font-size:15px;padding:16px">${esc(buildResult())}</div>
          <div style="text-align:center;font-size:13px;color:var(--text-secondary)">→ ${esc(preview())}</div>
          <button class="btn btn-secondary" id="fs-copy">${icon('copy',18)} Copy</button>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Template</div>
          <input class="input" id="fs-template" value="${esc(state.template)}" placeholder="Hello, {name}!" spellcheck="false" style="font-family:'SF Mono',monospace;font-size:14px">
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Variables</div>
          <div class="flex-col gap-sm" id="fs-vars">
            ${state.vars.map((v, i) => `
              <div class="flex-row gap-sm">
                <input class="input flex-1" data-i="${i}" data-f="name" value="${esc(v.name)}" placeholder="var name" spellcheck="false" style="font-size:13px">
                <input class="input flex-1" data-i="${i}" data-f="value" value="${esc(v.value)}" placeholder="value" spellcheck="false" style="font-size:13px">
                <button class="btn btn-sm btn-secondary fs-del" data-i="${i}" style="padding:8px">${icon('trash',14)}</button>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-sm btn-secondary" id="fs-add">${icon('plus',14)} Add variable</button>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Format Specs</div>
          <div class="flex-col gap-sm">
            ${[
              { spec: '{x:.2f}', desc: 'Float 2 decimals' },
              { spec: '{x:>10}', desc: 'Right-align 10 chars' },
              { spec: '{x:0>5}', desc: 'Zero-pad 5 digits' },
              { spec: '{x:,}', desc: 'Thousands separator' },
              { spec: '{x:%Y-%m-%d}', desc: 'Date format' },
              { spec: '{x!r}', desc: 'repr()' },
            ].map(s => `
              <div class="flex-row" style="justify-content:space-between;padding:4px 0">
                <code style="font-size:12px;color:var(--text)">${s.spec}</code>
                <span style="font-size:12px;color:var(--text-secondary)">${s.desc}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;

    container.querySelector('#fs-template').addEventListener('input', e => {
      state.template = e.target.value;
      render();
    });

    container.querySelector('#fs-copy').addEventListener('click', () => copyText(buildResult()));

    container.querySelector('#fs-add').addEventListener('click', () => {
      state.vars.push({ name: `var${state.vars.length + 1}`, value: "''" });
      haptic('light');
      render();
    });

    container.querySelectorAll('#fs-vars input').forEach(inp => {
      inp.addEventListener('input', e => {
        state.vars[parseInt(e.target.dataset.i)][e.target.dataset.f] = e.target.value;
        // Update live
        container.querySelector('.code-block').textContent = buildResult();
      });
    });

    container.querySelectorAll('.fs-del').forEach(btn => {
      btn.addEventListener('click', () => {
        state.vars.splice(parseInt(btn.dataset.i), 1);
        haptic('light');
        render();
      });
    });
  }
  render();
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
