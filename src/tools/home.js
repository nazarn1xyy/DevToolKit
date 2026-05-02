// Home — Tool grid with search, recents, favorites
import { icon } from '../icons.js';
import { navigate, haptic } from '../main.js';

const allTools = [
  // Dev Tools
  { id: 'color-picker', name: 'Colors', desc: 'Pick & generate palettes', icon: 'palette', section: 'dev' },
  { id: 'css-generator', name: 'CSS Gen', desc: 'Shadows, glass, radius', icon: 'layers', section: 'dev' },
  { id: 'url-shortener', name: 'URL Short', desc: 'Shorten any link', icon: 'link', section: 'dev' },
  { id: 'json-formatter', name: 'JSON', desc: 'Format & validate', icon: 'braces', section: 'dev' },
  { id: 'image-compressor', name: 'Compress', desc: 'Shrink images fast', icon: 'image', section: 'dev' },
  { id: 'pomodoro', name: 'Pomodoro', desc: 'Focus timer', icon: 'timer', section: 'dev' },
  { id: 'snippets', name: 'Snippets', desc: 'Save code blocks', icon: 'code', section: 'dev' },
  // Python Tools
  { id: 'py-dict-json', name: 'Dict ↔ JSON', desc: 'Python dict to valid JSON', icon: 'braces', section: 'python' },
  { id: 'py-model-gen', name: 'Model Gen', desc: 'Dataclass, Pydantic, SA', icon: 'layers', section: 'python' },
  { id: 'py-imports', name: 'Pip Extract', desc: 'Code → requirements.txt', icon: 'download', section: 'python' },
  { id: 'py-docstring', name: 'Docstring', desc: 'Generate from signature', icon: 'code', section: 'python' },
  { id: 'py-templates', name: 'Templates', desc: 'aiogram, FastAPI, decorators', icon: 'copy', section: 'python' },
  { id: 'py-comprehension', name: 'List Comp', desc: 'Comprehension builder', icon: 'braces', section: 'python' },
  { id: 'py-fstring', name: 'f-string', desc: 'Format string builder', icon: 'code', section: 'python' },
  { id: 'py-reference', name: 'Reference', desc: 'Types, exceptions, venv', icon: 'search', section: 'python' },
  // New Tools (v1.2)
  { id: 'regex-tester', name: 'Regex', desc: 'Test & debug patterns', icon: 'regex', section: 'new' },
  { id: 'base64-jwt', name: 'Base64 / JWT', desc: 'Encode, decode, inspect', icon: 'lock', section: 'new' },
  { id: 'hash-gen', name: 'Hash Gen', desc: 'MD5, SHA-1, SHA-256', icon: 'hash', section: 'new' },
  { id: 'diff-viewer', name: 'Diff', desc: 'Compare two texts', icon: 'diff', section: 'new' },
  { id: 'timestamp', name: 'Timestamp', desc: 'Unix ↔ human date', icon: 'clock', section: 'new' },
  { id: 'curl-converter', name: 'cURL → Fetch', desc: 'Convert HTTP requests', icon: 'terminal', section: 'new' },
  { id: 'markdown-preview', name: 'Markdown', desc: 'Live preview renderer', icon: 'fileText', section: 'new' },
  { id: 'contrast-checker', name: 'Contrast', desc: 'WCAG color checker', icon: 'contrast', section: 'new' },
];

// ── Persistence helpers ──
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('dt_favorites') || '[]'); } catch { return []; }
}
function setFavorites(list) { localStorage.setItem('dt_favorites', JSON.stringify(list)); }

function getRecents() {
  try { return JSON.parse(localStorage.getItem('dt_recents') || '[]'); } catch { return []; }
}

export function trackRecent(toolId) {
  const list = getRecents().filter(id => id !== toolId);
  list.unshift(toolId);
  localStorage.setItem('dt_recents', JSON.stringify(list.slice(0, 5)));
}

function toggleFavorite(toolId) {
  const favs = getFavorites();
  const idx = favs.indexOf(toolId);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(toolId);
  setFavorites(favs);
}

// ── Rendering ──
function renderCard(t, isFav) {
  return `
    <div class="tool-card" data-tool="${t.id}">
      <button class="fav-btn ${isFav ? 'active' : ''}" data-fav="${t.id}" aria-label="Toggle favorite">
        ${isFav ? icon('starFilled', 16) : icon('star', 16)}
      </button>
      <div class="tool-card-icon">${icon(t.icon)}</div>
      <div class="tool-card-name">${t.name}</div>
      <div class="tool-card-desc">${t.desc}</div>
    </div>`;
}

function renderGrid(tools, favs) {
  return `<div class="tool-grid">${tools.map(t => renderCard(t, favs.includes(t.id))).join('')}</div>`;
}

export function renderHome(container) {
  let query = '';

  function render() {
    const favs = getFavorites();
    const recents = getRecents();
    const favTools = allTools.filter(t => favs.includes(t.id));
    const recentTools = recents.map(id => allTools.find(t => t.id === id)).filter(Boolean).slice(0, 5);

    // Search filter
    const q = query.toLowerCase();
    const filtered = q ? allTools.filter(t =>
      t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.id.includes(q)
    ) : null;

    let html = `
      <div class="home-search">
        <div class="search-bar">
          ${icon('search', 18)}
          <input type="text" id="home-search" placeholder="Search tools..." value="${esc(query)}" spellcheck="false">
        </div>
      </div>`;

    if (filtered) {
      // Search results
      html += filtered.length
        ? renderGrid(filtered, favs)
        : `<div class="empty-state">${icon('search', 48)}<p>No tools found</p></div>`;
    } else {
      // Normal layout
      if (recentTools.length) {
        html += `<div class="recent-strip">
          <div class="section-title" style="padding:0 16px">RECENT</div>
          <div class="recent-scroll">
            ${recentTools.map(t => `
              <button class="recent-chip" data-tool="${t.id}">
                ${icon(t.icon, 16)}
                <span>${t.name}</span>
              </button>
            `).join('')}
          </div>
        </div>`;
      }
      if (favTools.length) {
        html += `<div class="section-title" style="padding:0 16px;margin-top:8px">FAVORITES</div>`;
        html += renderGrid(favTools, favs);
      }
      const devTools = allTools.filter(t => t.section === 'dev');
      const pyTools = allTools.filter(t => t.section === 'python');
      const newTools = allTools.filter(t => t.section === 'new');
      html += `<div class="section-title" style="padding:0 16px;margin-top:8px">DEV TOOLS</div>`;
      html += renderGrid(devTools, favs);
      html += `<div class="section-title" style="padding:0 16px;margin-top:8px">PYTHON</div>`;
      html += renderGrid(pyTools, favs);
      html += `<div class="section-title" style="padding:0 16px;margin-top:8px">NEW</div>`;
      html += renderGrid(newTools, favs);
    }

    container.innerHTML = html;

    // Search
    const searchInput = container.querySelector('#home-search');
    searchInput.addEventListener('input', e => { query = e.target.value; render(); });

    // Navigate
    container.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.fav-btn')) return;
        const toolId = card.dataset.tool;
        trackRecent(toolId);
        navigate(toolId);
      });
    });

    // Recent chips
    container.querySelectorAll('.recent-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        trackRecent(chip.dataset.tool);
        navigate(chip.dataset.tool);
      });
    });

    // Favorites
    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.fav);
        haptic('light');
        render();
      });
    });
  }
  render();
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
