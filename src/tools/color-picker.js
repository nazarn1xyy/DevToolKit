// Color Picker — HEX/RGB/HSL picker with palette generation
import { icon } from '../icons.js';
import { copyText, showToast, haptic } from '../main.js';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s } = rgbToHsl(r, g, b);
  const palettes = {};

  // Shades (light to dark)
  palettes.shades = Array.from({ length: 10 }, (_, i) => {
    const l = 95 - i * 9;
    return hslToHex(h, s, Math.max(5, Math.min(95, l)));
  });

  // Complementary
  palettes.complementary = [hex, hslToHex((h + 180) % 360, s, 50)];

  // Analogous
  palettes.analogous = [
    hslToHex((h - 30 + 360) % 360, s, 50),
    hex,
    hslToHex((h + 30) % 360, s, 50),
  ];

  // Triadic
  palettes.triadic = [
    hex,
    hslToHex((h + 120) % 360, s, 50),
    hslToHex((h + 240) % 360, s, 50),
  ];

  return palettes;
}

function loadRecent() {
  try { return JSON.parse(localStorage.getItem('dt_colors') || '[]'); } catch { return []; }
}

function saveRecent(hex) {
  const colors = loadRecent().filter(c => c !== hex);
  colors.unshift(hex);
  localStorage.setItem('dt_colors', JSON.stringify(colors.slice(0, 15)));
}

export function renderColorPicker(container) {
  let currentHex = '#5B8DEF';

  function render() {
    const { r, g, b } = hexToRgb(currentHex);
    const hsl = rgbToHsl(r, g, b);
    const palettes = generatePalette(currentHex);
    const recent = loadRecent();

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="color-swatch" id="cp-swatch" style="background:${currentHex}"></div>
          <div class="color-input-row">
            <input type="color" id="cp-native" value="${currentHex}">
            <input type="text" class="input" id="cp-hex" value="${currentHex}" maxlength="7" spellcheck="false" autocomplete="off">
            <button class="btn btn-sm btn-secondary" id="cp-copy">${icon('copy', 16)}</button>
          </div>
          <div class="tabs" id="cp-format-tabs">
            <button class="tab active" data-fmt="hex">HEX</button>
            <button class="tab" data-fmt="rgb">RGB</button>
            <button class="tab" data-fmt="hsl">HSL</button>
          </div>
          <div class="code-block" id="cp-value" style="text-align:center;font-size:15px;">${currentHex}</div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Shades</div>
          <div class="palette-grid" id="cp-shades">
            ${palettes.shades.map(c => `<div class="palette-swatch" data-color="${c}" style="background:${c}" title="${c}"></div>`).join('')}
          </div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Harmonies</div>
          <div class="tabs" id="cp-harmony-tabs">
            <button class="tab active" data-h="analogous">Analogous</button>
            <button class="tab" data-h="complementary">Compl.</button>
            <button class="tab" data-h="triadic">Triadic</button>
          </div>
          <div class="palette-grid" id="cp-harmonies">
            ${palettes.analogous.map(c => `<div class="palette-swatch" data-color="${c}" style="background:${c}" title="${c}"></div>`).join('')}
          </div>
        </div>

        ${recent.length > 0 ? `
        <div class="section flex-col gap-md">
          <div class="section-title">Recent</div>
          <div class="palette-grid" id="cp-recent">
            ${recent.map(c => `<div class="palette-swatch" data-color="${c}" style="background:${c}" title="${c}"></div>`).join('')}
          </div>
        </div>` : ''}
      </div>`;

    // Events
    let currentFormat = 'hex';

    const nativeInput = container.querySelector('#cp-native');
    const hexInput = container.querySelector('#cp-hex');
    const valueDisplay = container.querySelector('#cp-value');

    function updateFormat() {
      const { r, g, b } = hexToRgb(currentHex);
      const hsl = rgbToHsl(r, g, b);
      if (currentFormat === 'hex') valueDisplay.textContent = currentHex;
      else if (currentFormat === 'rgb') valueDisplay.textContent = `rgb(${r}, ${g}, ${b})`;
      else valueDisplay.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    nativeInput.addEventListener('input', e => {
      currentHex = e.target.value;
      saveRecent(currentHex);
      render();
    });

    hexInput.addEventListener('change', e => {
      let v = e.target.value.trim();
      if (!v.startsWith('#')) v = '#' + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        currentHex = v.toLowerCase();
        saveRecent(currentHex);
        render();
      }
    });

    container.querySelector('#cp-copy').addEventListener('click', () => {
      copyText(valueDisplay.textContent);
    });

    container.querySelector('#cp-format-tabs').addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      currentFormat = tab.dataset.fmt;
      container.querySelectorAll('#cp-format-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateFormat();
      haptic('light');
    });

    container.querySelector('#cp-harmony-tabs')?.addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const type = tab.dataset.h;
      const palettes = generatePalette(currentHex);
      const colors = palettes[type] || [];
      const grid = container.querySelector('#cp-harmonies');
      grid.innerHTML = colors.map(c =>
        `<div class="palette-swatch" data-color="${c}" style="background:${c}" title="${c}"></div>`
      ).join('');
      container.querySelectorAll('#cp-harmony-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      haptic('light');

      grid.querySelectorAll('.palette-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
          copyText(sw.dataset.color);
          sw.innerHTML = `<div class="copied-tick">${icon('check', 16)}</div>`;
          setTimeout(() => sw.innerHTML = '', 800);
        });
      });
    });

    // Swatch click = copy
    container.querySelectorAll('.palette-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        copyText(sw.dataset.color);
        sw.innerHTML = `<div class="copied-tick">${icon('check', 16)}</div>`;
        setTimeout(() => sw.innerHTML = '', 800);
      });
    });
  }

  render();
}
