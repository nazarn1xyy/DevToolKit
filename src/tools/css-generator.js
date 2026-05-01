// CSS Generator — Glassmorphism, Box Shadows, Border Radius
import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

export function renderCssGenerator(container) {
  let activeTab = 'glass';

  const state = {
    // Glass
    glassBlur: 12,
    glassOpacity: 20,
    glassBorder: 1,
    glassBg: '#ffffff',
    // Shadow
    shadowX: 0,
    shadowY: 8,
    shadowBlur: 24,
    shadowSpread: 0,
    shadowColor: '#000000',
    shadowOpacity: 25,
    shadowInset: false,
    // Border Radius
    radiusAll: 16,
    radiusLinked: true,
    radiusTL: 16,
    radiusTR: 16,
    radiusBR: 16,
    radiusBL: 16,
  };

  function getGlassCss() {
    const r = parseInt(state.glassBg.slice(1, 3), 16);
    const g = parseInt(state.glassBg.slice(3, 5), 16);
    const b = parseInt(state.glassBg.slice(5, 7), 16);
    return `background: rgba(${r}, ${g}, ${b}, ${(state.glassOpacity / 100).toFixed(2)});
backdrop-filter: blur(${state.glassBlur}px);
-webkit-backdrop-filter: blur(${state.glassBlur}px);
border: ${state.glassBorder}px solid rgba(255, 255, 255, 0.18);
border-radius: 16px;`;
  }

  function getShadowCss() {
    const r = parseInt(state.shadowColor.slice(1, 3), 16);
    const g = parseInt(state.shadowColor.slice(3, 5), 16);
    const b = parseInt(state.shadowColor.slice(5, 7), 16);
    const inset = state.shadowInset ? 'inset ' : '';
    return `box-shadow: ${inset}${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowSpread}px rgba(${r}, ${g}, ${b}, ${(state.shadowOpacity / 100).toFixed(2)});`;
  }

  function getRadiusCss() {
    if (state.radiusLinked) return `border-radius: ${state.radiusAll}px;`;
    return `border-radius: ${state.radiusTL}px ${state.radiusTR}px ${state.radiusBR}px ${state.radiusBL}px;`;
  }

  function getGlassPreviewStyle() {
    const r = parseInt(state.glassBg.slice(1, 3), 16);
    const g = parseInt(state.glassBg.slice(3, 5), 16);
    const b = parseInt(state.glassBg.slice(5, 7), 16);
    return `background:rgba(${r},${g},${b},${state.glassOpacity / 100});backdrop-filter:blur(${state.glassBlur}px);-webkit-backdrop-filter:blur(${state.glassBlur}px);border:${state.glassBorder}px solid rgba(255,255,255,0.18);border-radius:16px;width:140px;height:100px;`;
  }

  function getShadowPreviewStyle() {
    const r = parseInt(state.shadowColor.slice(1, 3), 16);
    const g = parseInt(state.shadowColor.slice(3, 5), 16);
    const b = parseInt(state.shadowColor.slice(5, 7), 16);
    const inset = state.shadowInset ? 'inset ' : '';
    return `background:var(--bg-card);border-radius:16px;width:120px;height:80px;box-shadow:${inset}${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowSpread}px rgba(${r},${g},${b},${state.shadowOpacity / 100});`;
  }

  function getRadiusPreviewStyle() {
    const br = state.radiusLinked
      ? `${state.radiusAll}px`
      : `${state.radiusTL}px ${state.radiusTR}px ${state.radiusBR}px ${state.radiusBL}px`;
    return `background:var(--bg-card);border:1px solid var(--border-light);width:120px;height:80px;border-radius:${br};`;
  }

  function render() {
    let controlsHtml = '';
    let previewStyle = '';
    let cssOutput = '';

    if (activeTab === 'glass') {
      cssOutput = getGlassCss();
      previewStyle = getGlassPreviewStyle();
      controlsHtml = `
        <div class="range-group">
          <div class="range-label"><span>Blur</span><span>${state.glassBlur}px</span></div>
          <input type="range" min="0" max="40" value="${state.glassBlur}" data-key="glassBlur">
        </div>
        <div class="range-group">
          <div class="range-label"><span>Opacity</span><span>${state.glassOpacity}%</span></div>
          <input type="range" min="0" max="100" value="${state.glassOpacity}" data-key="glassOpacity">
        </div>
        <div class="range-group">
          <div class="range-label"><span>Border</span><span>${state.glassBorder}px</span></div>
          <input type="range" min="0" max="4" value="${state.glassBorder}" data-key="glassBorder">
        </div>`;
    } else if (activeTab === 'shadow') {
      cssOutput = getShadowCss();
      previewStyle = getShadowPreviewStyle();
      controlsHtml = `
        <div class="range-group">
          <div class="range-label"><span>X Offset</span><span>${state.shadowX}px</span></div>
          <input type="range" min="-50" max="50" value="${state.shadowX}" data-key="shadowX">
        </div>
        <div class="range-group">
          <div class="range-label"><span>Y Offset</span><span>${state.shadowY}px</span></div>
          <input type="range" min="-50" max="50" value="${state.shadowY}" data-key="shadowY">
        </div>
        <div class="range-group">
          <div class="range-label"><span>Blur</span><span>${state.shadowBlur}px</span></div>
          <input type="range" min="0" max="80" value="${state.shadowBlur}" data-key="shadowBlur">
        </div>
        <div class="range-group">
          <div class="range-label"><span>Spread</span><span>${state.shadowSpread}px</span></div>
          <input type="range" min="-20" max="40" value="${state.shadowSpread}" data-key="shadowSpread">
        </div>
        <div class="range-group">
          <div class="range-label"><span>Opacity</span><span>${state.shadowOpacity}%</span></div>
          <input type="range" min="0" max="100" value="${state.shadowOpacity}" data-key="shadowOpacity">
        </div>`;
    } else {
      cssOutput = getRadiusCss();
      previewStyle = getRadiusPreviewStyle();
      if (state.radiusLinked) {
        controlsHtml = `
          <div class="range-group">
            <div class="range-label"><span>All corners</span><span>${state.radiusAll}px</span></div>
            <input type="range" min="0" max="80" value="${state.radiusAll}" data-key="radiusAll">
          </div>
          <button class="btn btn-sm btn-secondary" id="css-unlink">${icon('settings', 14)} Individual corners</button>`;
      } else {
        controlsHtml = `
          <div class="range-group">
            <div class="range-label"><span>Top-Left</span><span>${state.radiusTL}px</span></div>
            <input type="range" min="0" max="80" value="${state.radiusTL}" data-key="radiusTL">
          </div>
          <div class="range-group">
            <div class="range-label"><span>Top-Right</span><span>${state.radiusTR}px</span></div>
            <input type="range" min="0" max="80" value="${state.radiusTR}" data-key="radiusTR">
          </div>
          <div class="range-group">
            <div class="range-label"><span>Bottom-Right</span><span>${state.radiusBR}px</span></div>
            <input type="range" min="0" max="80" value="${state.radiusBR}" data-key="radiusBR">
          </div>
          <div class="range-group">
            <div class="range-label"><span>Bottom-Left</span><span>${state.radiusBL}px</span></div>
            <input type="range" min="0" max="80" value="${state.radiusBL}" data-key="radiusBL">
          </div>
          <button class="btn btn-sm btn-secondary" id="css-link">${icon('link', 14)} Link corners</button>`;
      }
    }

    const previewBg = activeTab === 'glass'
      ? 'background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
      : '';

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="tabs" id="css-tabs">
            <button class="tab${activeTab === 'glass' ? ' active' : ''}" data-t="glass">Glass</button>
            <button class="tab${activeTab === 'shadow' ? ' active' : ''}" data-t="shadow">Shadow</button>
            <button class="tab${activeTab === 'radius' ? ' active' : ''}" data-t="radius">Radius</button>
          </div>
          <div class="preview-box" style="min-height:140px;${previewBg}">
            <div style="${previewStyle}"></div>
          </div>
        </div>

        <div class="section flex-col gap-md">
          ${controlsHtml}
        </div>

        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span>CSS</span>
            <button class="btn btn-sm btn-secondary" id="css-copy">${icon('copy', 14)} Copy</button>
          </div>
          <div class="code-block">${cssOutput}</div>
        </div>
      </div>`;

    // Events
    container.querySelector('#css-tabs').addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      activeTab = tab.dataset.t;
      haptic('light');
      render();
    });

    container.querySelector('#css-copy').addEventListener('click', () => copyText(cssOutput));

    container.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', e => {
        state[e.target.dataset.key] = parseInt(e.target.value);
        render();
      });
    });

    container.querySelector('#css-unlink')?.addEventListener('click', () => {
      state.radiusLinked = false;
      state.radiusTL = state.radiusTR = state.radiusBR = state.radiusBL = state.radiusAll;
      render();
    });

    container.querySelector('#css-link')?.addEventListener('click', () => {
      state.radiusLinked = true;
      render();
    });
  }

  render();
}
