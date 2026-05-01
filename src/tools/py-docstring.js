import { icon } from '../icons.js';
import { copyText, haptic, showToast } from '../main.js';

function parseSignature(sig) {
  const m = sig.match(/def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*(.+))?:/);
  if (!m) return null;
  const name = m[1];
  const retType = m[3]?.trim() || 'None';
  const params = [];
  if (m[2].trim()) {
    for (const p of m[2].split(',')) {
      const pt = p.trim();
      if (pt === 'self' || pt === 'cls') continue;
      const [pname, ptype] = pt.split(':').map(s => s.split('=')[0].trim());
      params.push({ name: pname, type: ptype || 'Any' });
    }
  }
  return { name, params, retType };
}

function genGoogle(parsed) {
  const lines = [`    """[Description]`, ''];
  if (parsed.params.length) {
    lines.push('    Args:');
    for (const p of parsed.params) lines.push(`        ${p.name} (${p.type}): [Description]`);
    lines.push('');
  }
  if (parsed.retType !== 'None') {
    lines.push('    Returns:');
    lines.push(`        ${parsed.retType}: [Description]`);
    lines.push('');
  }
  lines.push('    """');
  return lines.join('\n');
}

function genNumpy(parsed) {
  const lines = [`    """`, '    [Description]', ''];
  if (parsed.params.length) {
    lines.push('    Parameters');
    lines.push('    ----------');
    for (const p of parsed.params) {
      lines.push(`    ${p.name} : ${p.type}`);
      lines.push('        [Description]');
    }
    lines.push('');
  }
  if (parsed.retType !== 'None') {
    lines.push('    Returns');
    lines.push('    -------');
    lines.push(`    ${parsed.retType}`);
    lines.push('        [Description]');
    lines.push('');
  }
  lines.push('    """');
  return lines.join('\n');
}

function genSphinx(parsed) {
  const lines = [`    """[Description]`, ''];
  for (const p of parsed.params) lines.push(`    :param ${p.name}: [Description]`);
  for (const p of parsed.params) lines.push(`    :type ${p.name}: ${p.type}`);
  if (parsed.retType !== 'None') {
    lines.push(`    :return: [Description]`);
    lines.push(`    :rtype: ${parsed.retType}`);
  }
  lines.push('    """');
  return lines.join('\n');
}

export function renderDocstring(container) {
  let tab = 'google';
  let result = '';

  function render() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="section-title">Function Signature</div>
          <textarea class="input" id="ds-input" placeholder="def fetch_data(url: str, timeout: int = 10) -> dict:" rows="3" spellcheck="false" style="font-family:'SF Mono',monospace;font-size:13px"></textarea>
          <div class="tabs">
            <button class="tab${tab==='google'?' active':''}" data-t="google">Google</button>
            <button class="tab${tab==='numpy'?' active':''}" data-t="numpy">NumPy</button>
            <button class="tab${tab==='sphinx'?' active':''}" data-t="sphinx">Sphinx</button>
          </div>
          <button class="btn" id="ds-gen">${icon('code',18)} Generate</button>
        </div>
        <div id="ds-out" class="hidden">
          <div class="section flex-col gap-md">
            <div class="code-block-header">
              <span>DOCSTRING</span>
              <button class="btn btn-sm btn-secondary" id="ds-copy">${icon('copy',14)} Copy</button>
            </div>
            <div class="code-block" id="ds-code"></div>
          </div>
        </div>
      </div>`;

    container.querySelector('.tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (t) { tab = t.dataset.t; haptic('light'); render(); }
    });

    container.querySelector('#ds-gen').addEventListener('click', () => {
      const sig = container.querySelector('#ds-input').value.trim();
      const parsed = parseSignature(sig);
      if (!parsed) { showToast('Invalid signature'); haptic('error'); return; }
      if (tab === 'google') result = genGoogle(parsed);
      else if (tab === 'numpy') result = genNumpy(parsed);
      else result = genSphinx(parsed);
      container.querySelector('#ds-code').textContent = result;
      container.querySelector('#ds-out').classList.remove('hidden');
      haptic('success');
    });

    container.querySelector('#ds-copy')?.addEventListener('click', () => { if (result) copyText(result); });
  }
  render();
}
