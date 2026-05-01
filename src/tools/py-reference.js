import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

const VENV_COMMANDS = [
  { label: 'Create venv', cmd: 'python3 -m venv .venv' },
  { label: 'Activate (macOS/Linux)', cmd: 'source .venv/bin/activate' },
  { label: 'Activate (Windows)', cmd: '.venv\\Scripts\\activate' },
  { label: 'Deactivate', cmd: 'deactivate' },
  { label: 'Freeze requirements', cmd: 'pip freeze > requirements.txt' },
  { label: 'Install from file', cmd: 'pip install -r requirements.txt' },
  { label: 'Upgrade pip', cmd: 'pip install --upgrade pip' },
  { label: 'List packages', cmd: 'pip list' },
  { label: 'Show package info', cmd: 'pip show <package>' },
  { label: 'Uninstall', cmd: 'pip uninstall <package>' },
];

const TYPE_HINTS = [
  { type: 'int, str, float, bool', desc: 'Basic types' },
  { type: 'list[int]', desc: 'List of ints' },
  { type: 'dict[str, Any]', desc: 'Dict with string keys' },
  { type: 'tuple[int, str]', desc: 'Fixed tuple' },
  { type: 'set[str]', desc: 'Set of strings' },
  { type: 'str | None', desc: 'Optional (3.10+)' },
  { type: 'Optional[str]', desc: 'Optional (older)' },
  { type: 'Union[int, str]', desc: 'Multiple types' },
  { type: 'Callable[[int], str]', desc: 'Function type' },
  { type: 'Awaitable[T]', desc: 'Async return' },
  { type: 'AsyncGenerator[T, None]', desc: 'Async generator' },
  { type: 'Iterable[T]', desc: 'Any iterable' },
  { type: 'Sequence[T]', desc: 'Ordered collection' },
  { type: 'Mapping[K, V]', desc: 'Dict-like' },
  { type: 'TypeVar("T")', desc: 'Generic type' },
  { type: 'Literal["a", "b"]', desc: 'Enum-like' },
  { type: 'Final[int]', desc: 'Constant' },
  { type: 'ClassVar[int]', desc: 'Class variable' },
  { type: 'Self', desc: 'Return self (3.11+)' },
  { type: 'Never', desc: 'No return (3.11+)' },
];

const EXCEPTIONS = [
  { name: 'BaseException', indent: 0 },
  { name: 'KeyboardInterrupt', indent: 1 },
  { name: 'SystemExit', indent: 1 },
  { name: 'Exception', indent: 1 },
  { name: 'ArithmeticError', indent: 2 },
  { name: 'ZeroDivisionError', indent: 3 },
  { name: 'OverflowError', indent: 3 },
  { name: 'AttributeError', indent: 2 },
  { name: 'EOFError', indent: 2 },
  { name: 'ImportError', indent: 2 },
  { name: 'ModuleNotFoundError', indent: 3 },
  { name: 'IndexError', indent: 2 },
  { name: 'KeyError', indent: 2 },
  { name: 'MemoryError', indent: 2 },
  { name: 'NameError', indent: 2 },
  { name: 'OSError', indent: 2 },
  { name: 'FileNotFoundError', indent: 3 },
  { name: 'PermissionError', indent: 3 },
  { name: 'TimeoutError', indent: 3 },
  { name: 'ConnectionError', indent: 3 },
  { name: 'RuntimeError', indent: 2 },
  { name: 'RecursionError', indent: 3 },
  { name: 'NotImplementedError', indent: 3 },
  { name: 'StopIteration', indent: 2 },
  { name: 'TypeError', indent: 2 },
  { name: 'ValueError', indent: 2 },
  { name: 'UnicodeError', indent: 3 },
  { name: 'UnicodeDecodeError', indent: 4 },
  { name: 'UnicodeEncodeError', indent: 4 },
];

export function renderReference(container) {
  let tab = 'venv';

  function render() {
    let content = '';

    if (tab === 'venv') {
      content = `<div class="flex-col gap-sm">
        ${VENV_COMMANDS.map(c => `
          <div class="flex-row" style="justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:12px;color:var(--text-secondary);white-space:nowrap">${c.label}</span>
            <div class="flex-row gap-sm" style="overflow:hidden">
              <code style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.cmd}</code>
              <button class="btn btn-sm btn-secondary ref-copy" data-c="${esc(c.cmd)}" style="padding:4px 8px;flex-shrink:0">${icon('copy',12)}</button>
            </div>
          </div>
        `).join('')}
      </div>`;
    } else if (tab === 'types') {
      content = `<div class="flex-col gap-sm">
        ${TYPE_HINTS.map(t => `
          <div class="flex-row" style="justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
            <code style="font-size:12px;color:var(--text);cursor:pointer" class="ref-copy" data-c="${esc(t.type)}">${t.type}</code>
            <span style="font-size:11px;color:var(--text-tertiary);white-space:nowrap">${t.desc}</span>
          </div>
        `).join('')}
      </div>`;
    } else {
      content = `<div class="code-block" style="font-size:12px;line-height:1.8">
        ${EXCEPTIONS.map(e => {
          const pad = '  '.repeat(e.indent);
          const color = e.indent === 0 ? 'var(--text)' : e.indent === 1 ? '#ccc' : e.indent === 2 ? '#aaa' : '#888';
          return `<span style="color:${color}">${pad}${e.indent > 0 ? '├── ' : ''}${e.name}</span>`;
        }).join('\n')}
      </div>`;
    }

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="tabs">
            <button class="tab${tab==='venv'?' active':''}" data-t="venv">venv</button>
            <button class="tab${tab==='types'?' active':''}" data-t="types">Types</button>
            <button class="tab${tab==='exceptions'?' active':''}" data-t="exceptions">Errors</button>
          </div>
        </div>
        <div class="section flex-col gap-md">${content}</div>
      </div>`;

    container.querySelector('.tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (t) { tab = t.dataset.t; haptic('light'); render(); }
    });

    container.querySelectorAll('.ref-copy').forEach(el => {
      el.addEventListener('click', () => copyText(el.dataset.c));
    });
  }
  render();
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
