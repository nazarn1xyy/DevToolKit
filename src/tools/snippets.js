import { icon } from '../icons.js';
import { copyText, showToast, haptic } from '../main.js';

function load() {
  try { return JSON.parse(localStorage.getItem('dt_snippets') || '[]'); } catch { return []; }
}
function save(list) { localStorage.setItem('dt_snippets', JSON.stringify(list)); }

export function renderSnippets(container) {
  let searchQuery = '';
  let modalMode = null; // null | 'new' | 'edit'
  let editIdx = -1;

  function render() {
    const all = load();
    const filtered = searchQuery
      ? all.filter(s => s.title.toLowerCase().includes(searchQuery) || s.lang.toLowerCase().includes(searchQuery) || s.code.toLowerCase().includes(searchQuery))
      : all;

    const editItem = modalMode === 'edit' && editIdx >= 0 ? all[editIdx] : null;

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="color-input-row">
            <input type="text" class="input" id="sn-search" placeholder="Search snippets..." value="${esc(searchQuery)}" spellcheck="false">
            <button class="btn" id="sn-add">${icon('plus', 18)}</button>
          </div>
        </div>

        ${filtered.length === 0 ? `
        <div class="empty-state">
          ${icon('code', 48)}
          <p>${searchQuery ? 'No matches' : 'No snippets yet'}</p>
        </div>` : `
        <div class="snippet-list">
          ${filtered.map((s, i) => `
            <div class="snippet-item" data-idx="${i}">
              <div class="snippet-header">
                <span class="snippet-title">${esc(s.title)}</span>
                <span class="snippet-lang">${esc(s.lang)}</span>
              </div>
              <div class="snippet-code">${esc(s.code)}</div>
              <div class="snippet-actions">
                <button class="btn btn-sm btn-secondary sn-copy" data-i="${i}">${icon('copy', 14)} Copy</button>
                <button class="btn btn-sm btn-secondary sn-edit" data-i="${i}">${icon('edit', 14)} Edit</button>
                <button class="btn btn-sm btn-secondary sn-del" data-i="${i}">${icon('trash', 14)}</button>
              </div>
            </div>`).join('')}
        </div>`}
      </div>

      ${modalMode ? `
      <div class="modal-overlay" id="sn-overlay">
        <div class="modal-sheet">
          <h3>${modalMode === 'edit' ? 'Edit Snippet' : 'New Snippet'}</h3>
          <input type="text" class="input" id="sn-title" placeholder="Title" spellcheck="false" value="${editItem ? esc(editItem.title) : ''}">
          <input type="text" class="input" id="sn-lang" placeholder="Language (js, py, css...)" spellcheck="false" value="${editItem ? esc(editItem.lang) : ''}">
          <textarea class="input" id="sn-code" placeholder="Paste code here..." rows="6" spellcheck="false">${editItem ? esc(editItem.code) : ''}</textarea>
          <div class="btn-row">
            <button class="btn" id="sn-save">${icon('check', 18)} ${modalMode === 'edit' ? 'Update' : 'Save'}</button>
            <button class="btn btn-secondary" id="sn-cancel">Cancel</button>
          </div>
        </div>
      </div>` : ''}`;

    // Events
    container.querySelector('#sn-search').addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase();
      render();
    });

    container.querySelector('#sn-add').addEventListener('click', () => {
      modalMode = 'new'; editIdx = -1;
      haptic('light');
      render();
      container.querySelector('#sn-title')?.focus();
    });

    container.querySelectorAll('.sn-copy').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const s = load()[parseInt(btn.dataset.i)];
        if (s) copyText(s.code);
      });
    });

    container.querySelectorAll('.sn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        editIdx = parseInt(btn.dataset.i);
        modalMode = 'edit';
        haptic('light');
        render();
        container.querySelector('#sn-title')?.focus();
      });
    });

    container.querySelectorAll('.sn-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const list = load();
        list.splice(parseInt(btn.dataset.i), 1);
        save(list);
        haptic('medium');
        render();
      });
    });

    // Modal events
    container.querySelector('#sn-overlay')?.addEventListener('click', e => {
      if (e.target.id === 'sn-overlay') { modalMode = null; render(); }
    });

    container.querySelector('#sn-save')?.addEventListener('click', () => {
      const title = container.querySelector('#sn-title').value.trim();
      const lang = container.querySelector('#sn-lang').value.trim() || 'text';
      const code = container.querySelector('#sn-code').value;
      if (!title || !code) { showToast('Fill title & code'); haptic('error'); return; }

      const list = load();
      if (modalMode === 'edit' && editIdx >= 0) {
        list[editIdx] = { ...list[editIdx], title, lang, code };
        showToast('Snippet updated');
      } else {
        list.unshift({ title, lang, code, ts: Date.now() });
        showToast('Snippet saved');
      }
      save(list);
      modalMode = null;
      editIdx = -1;
      haptic('success');
      render();
    });

    container.querySelector('#sn-cancel')?.addEventListener('click', () => {
      modalMode = null;
      render();
    });
  }

  render();
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
