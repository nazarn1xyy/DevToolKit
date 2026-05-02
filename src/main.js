// DevToolkit — Main entry point
// SPA Router + Telegram Web App init + PWA registration
import './style.css';
import { icon } from './icons.js';
import { renderHome, trackRecent } from './tools/home.js';
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
// v1.2 — New tools
import { renderRegex } from './tools/regex-tester.js';
import { renderBase64Jwt } from './tools/base64-jwt.js';
import { renderHashGen } from './tools/hash-gen.js';
import { renderDiff } from './tools/diff-viewer.js';
import { renderTimestamp } from './tools/timestamp.js';
import { renderCurlConverter } from './tools/curl-converter.js';
import { renderMarkdown } from './tools/markdown-preview.js';
import { renderContrastChecker } from './tools/contrast-checker.js';

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
    // fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
    showToast('Copied');
  });
}

export function shareToTelegram(text) {
  const tg = window.Telegram?.WebApp;
  if (tg?.switchInlineQuery) {
    // Opens inline mode with the text pre-filled
    try { tg.switchInlineQuery(text, ['users', 'groups', 'channels']); return; } catch (_) {}
  }
  // Fallback: copy to clipboard
  copyText(text);
  showToast('Copied — paste in chat');
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
  // v1.2
  'regex-tester': renderRegex,
  'base64-jwt': renderBase64Jwt,
  'hash-gen': renderHashGen,
  'diff-viewer': renderDiff,
  'timestamp': renderTimestamp,
  'curl-converter': renderCurlConverter,
  'markdown-preview': renderMarkdown,
  'contrast-checker': renderContrastChecker,
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
  // v1.2
  'regex-tester': 'Regex Tester',
  'base64-jwt': 'Base64 / JWT',
  'hash-gen': 'Hash Generator',
  'diff-viewer': 'Diff Viewer',
  'timestamp': 'Timestamp',
  'curl-converter': 'cURL → Fetch',
  'markdown-preview': 'Markdown',
  'contrast-checker': 'Contrast',
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

  // Track recent tool usage
  if (!isHome && routes[route]) {
    trackRecent(route);
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
    // Request true fullscreen (hides native Telegram header)
    try { if (tg.requestFullscreen) tg.requestFullscreen(); } catch (_) {}
    tg.setHeaderColor('#000000');
    tg.setBackgroundColor('#000000');
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();

    // Deep link support: ?startapp=tool-id
    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam && routes[startParam]) {
      window.location.hash = `#/${startParam}`;
    }
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
