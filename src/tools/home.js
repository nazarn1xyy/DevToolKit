// Home — Tool grid with sections
import { icon } from '../icons.js';
import { navigate } from '../main.js';

const devTools = [
  { id: 'color-picker', name: 'Colors', desc: 'Pick & generate palettes', icon: 'palette' },
  { id: 'css-generator', name: 'CSS Gen', desc: 'Shadows, glass, radius', icon: 'layers' },
  { id: 'url-shortener', name: 'URL Short', desc: 'Shorten any link', icon: 'link' },
  { id: 'json-formatter', name: 'JSON', desc: 'Format & validate', icon: 'braces' },
  { id: 'image-compressor', name: 'Compress', desc: 'Shrink images fast', icon: 'image' },
  { id: 'pomodoro', name: 'Pomodoro', desc: 'Focus timer', icon: 'timer' },
  { id: 'snippets', name: 'Snippets', desc: 'Save code blocks', icon: 'code' },
];

const pyTools = [
  { id: 'py-dict-json', name: 'Dict ↔ JSON', desc: 'Python dict to valid JSON', icon: 'braces' },
  { id: 'py-model-gen', name: 'Model Gen', desc: 'Dataclass, Pydantic, SA', icon: 'layers' },
  { id: 'py-imports', name: 'Pip Extract', desc: 'Code → requirements.txt', icon: 'download' },
  { id: 'py-docstring', name: 'Docstring', desc: 'Generate from signature', icon: 'code' },
  { id: 'py-templates', name: 'Templates', desc: 'aiogram, FastAPI, decorators', icon: 'copy' },
  { id: 'py-comprehension', name: 'List Comp', desc: 'Comprehension builder', icon: 'braces' },
  { id: 'py-fstring', name: 'f-string', desc: 'Format string builder', icon: 'code' },
  { id: 'py-reference', name: 'Reference', desc: 'Types, exceptions, venv', icon: 'search' },
];

function renderSection(title, tools) {
  return `
    <div class="section-title" style="padding:0 16px;margin-top:8px">${title}</div>
    <div class="tool-grid">
      ${tools.map(t => `
        <div class="tool-card" data-tool="${t.id}">
          <div class="tool-card-icon">${icon(t.icon)}</div>
          <div class="tool-card-name">${t.name}</div>
          <div class="tool-card-desc">${t.desc}</div>
        </div>
      `).join('')}
    </div>`;
}

export function renderHome(container) {
  container.innerHTML = renderSection('DEV TOOLS', devTools) + renderSection('PYTHON', pyTools);

  container.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => navigate(card.dataset.tool));
  });
}
