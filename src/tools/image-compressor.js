import { icon } from '../icons.js';
import { showToast, haptic } from '../main.js';

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function renderImageCompressor(container) {
  let origFile = null;
  let origUrl = null;
  let quality = 75;

  function renderEmpty() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="drop-zone" id="ic-drop">
          ${icon('upload', 36)}
          <p>Tap to select or drop image</p>
          <span style="font-size:12px;color:var(--text-tertiary)">JPG, PNG, WebP</span>
          <input type="file" id="ic-file" accept="image/*" style="display:none">
        </div>
      </div>`;

    const drop = container.querySelector('#ic-drop');
    const fileInput = container.querySelector('#ic-file');

    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
    drop.addEventListener('drop', e => {
      e.preventDefault(); drop.classList.remove('dragover');
      if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
  }

  function loadFile(file) {
    origFile = file;
    if (origUrl) URL.revokeObjectURL(origUrl);
    origUrl = URL.createObjectURL(file);
    haptic('medium');
    renderCompressor();
  }

  function renderCompressor() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <img src="${origUrl}" class="img-preview" id="ic-preview" alt="Preview">
        </div>
        <div class="section flex-col gap-md">
          <div class="range-group">
            <div class="range-label"><span>Quality</span><span id="ic-q-val">${quality}%</span></div>
            <input type="range" min="5" max="100" value="${quality}" id="ic-quality">
          </div>
          <button class="btn" id="ic-compress">${icon('image', 18)} Compress</button>
        </div>
        <div id="ic-result" class="hidden">
          <div class="section flex-col gap-md">
            <div class="img-stats" id="ic-stats"></div>
            <button class="btn" id="ic-download">${icon('download', 18)} Download</button>
          </div>
        </div>
        <button class="btn btn-secondary" id="ic-reset">${icon('rotateCcw', 18)} New image</button>
      </div>`;

    const slider = container.querySelector('#ic-quality');
    const qVal = container.querySelector('#ic-q-val');
    let compressedBlob = null;

    slider.addEventListener('input', e => {
      quality = parseInt(e.target.value);
      qVal.textContent = quality + '%';
    });

    container.querySelector('#ic-compress').addEventListener('click', () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
          compressedBlob = blob;
          const origSize = origFile.size;
          const newSize = blob.size;
          const savings = Math.round((1 - newSize / origSize) * 100);

          const statsEl = container.querySelector('#ic-stats');
          statsEl.innerHTML = `
            <div class="img-stat">
              <span class="img-stat-value">${formatBytes(origSize)}</span>
              <span class="img-stat-label">Original</span>
            </div>
            <div class="img-stat">
              <span class="img-stat-value">${formatBytes(newSize)}</span>
              <span class="img-stat-label">Compressed</span>
            </div>
            <div class="img-stat">
              <span class="img-stat-value">${savings > 0 ? '-' : '+'}${Math.abs(savings)}%</span>
              <span class="img-stat-label">Savings</span>
            </div>`;

          container.querySelector('#ic-result').classList.remove('hidden');
          const compUrl = URL.createObjectURL(blob);
          container.querySelector('#ic-preview').src = compUrl;
          haptic('success');
          showToast(`Compressed: ${formatBytes(newSize)}`);
        }, 'image/webp', quality / 100);
      };
      img.src = origUrl;
    });

    container.querySelector('#ic-download')?.addEventListener('click', () => {
      if (!compressedBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(compressedBlob);
      a.download = `compressed_${Date.now()}.webp`;
      a.click();
      haptic('success');
    });

    container.querySelector('#ic-reset').addEventListener('click', () => {
      origFile = null;
      if (origUrl) URL.revokeObjectURL(origUrl);
      origUrl = null;
      renderEmpty();
    });
  }

  renderEmpty();

  return () => {
    if (origUrl) URL.revokeObjectURL(origUrl);
  };
}
