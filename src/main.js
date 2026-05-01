// DevToolkit — Main entry point
// SPA Router + Telegram Web App init + PWA registration
import './style.css';
import { icon } from './icons.js';
import { renderHome } from './tools/home.js';
import { renderColorPicker } from './tools/color-picker.js';
import { renderCssGenerator } from './tools/css-generator.js';
import { renderUrlShortener } from './tools/url-shortener.js';
import { renderJsonFormatter } from './tools/json-formatter.js';
import { renderImageCompressor } from './tools/image-compressor.js';
import { renderPomodoro } from './tools/pomodoro.js';
import { renderSnippets } from './tools/snippets.js';
import { renderDictJson } from './tools/py-dict-json.js';
import { renderModelGen } from './tools/py-model-gen.js';
import { renderImports } from './tools/py-imports.js';
import { renderDocstring } from './tools/py-docstring.js';
import { renderTemplates } from './tools/py-templates.js';
import { renderComprehension } from './tools/py-comprehension.js';
import { renderFstring } from './tools/py-fstring.js';
import { renderReference } from './tools/py-reference.js';

// ── Telegram Web App ──
const tg = window.Telegram?.WebApp;

export function haptic(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      if (type === 'light') tg.HapticFeedback.impactOccurred('light');
      else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
      else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
      else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
    }
  } catch (_) { /* ignore */ }
}

export function showToast(text, duration = 2000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon('check', 16)} ${text}`;
  container.appendChild(toast);
  haptic('light');
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

export function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied');
    haptic('success');
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Copied');
  });
}

// ── Router ──
const routes = {
  '': renderHome,
  'color-picker': renderColorPicker,
  'css-generator': renderCssGenerator,
  'url-shortener': renderUrlShortener,
  'json-formatter': renderJsonFormatter,
  'image-compressor': renderImageCompressor,
  'pomodoro': renderPomodoro,
  'snippets': renderSnippets,
  'py-dict-json': renderDictJson,
  'py-model-gen': renderModelGen,
  'py-imports': renderImports,
  'py-docstring': renderDocstring,
  'py-templates': renderTemplates,
  'py-comprehension': renderComprehension,
  'py-fstring': renderFstring,
  'py-reference': renderReference,
};

const routeTitles = {
  '': 'DevToolkit',
  'color-picker': 'Color Picker',
  'css-generator': 'CSS Generator',
  'url-shortener': 'URL Shortener',
  'json-formatter': 'JSON Formatter',
  'image-compressor': 'Image Compress',
  'pomodoro': 'Pomodoro',
  'snippets': 'Code Snippets',
  'py-dict-json': 'Dict ↔ JSON',
  'py-model-gen': 'Model Generator',
  'py-imports': 'Pip Extract',
  'py-docstring': 'Docstring Gen',
  'py-templates': 'Templates',
  'py-comprehension': 'List Comp',
  'py-fstring': 'f-string Builder',
  'py-reference': 'Python Reference',
};

let currentCleanup = null;

function getRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return hash || '';
}

export function navigate(route) {
  haptic('light');
  window.location.hash = `#/${route}`;
}

function renderRoute() {
  const route = getRoute();
  const app = document.getElementById('app');
  const renderFn = routes[route] || renderHome;
  const title = routeTitles[route] || 'DevToolkit';
  const isHome = route === '';

  // cleanup previous tool
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Build page shell
  let headerHtml;
  if (isHome) {
    headerHtml = `
      <header class="header">
        <span class="header-home-title">DevToolkit</span>
      </header>`;
  } else {
    headerHtml = `
      <header class="header">
        <button class="header-back" id="nav-back">${icon('chevronLeft', 20)}</button>
        <span class="header-title">${title}</span>
      </header>`;
  }

  app.innerHTML = `
    ${headerHtml}
    <div class="page-scroll">
      <div id="tool-content" class="page-enter"></div>
    </div>`;

  // Back button
  if (!isHome) {
    const backBtn = document.getElementById('nav-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        haptic('light');
        window.location.hash = '#/';
      });
    }

    // Telegram back button
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.location.hash = '#/';
      });
    }
  } else {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  }

  // Render tool content
  const content = document.getElementById('tool-content');
  const cleanup = renderFn(content);
  if (typeof cleanup === 'function') {
    currentCleanup = cleanup;
  }
}

// ── Init ──
function init() {
  // Telegram Web App setup
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#000000');
    tg.setBackgroundColor('#000000');
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  }

  // PWA registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Route handling
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

init();
