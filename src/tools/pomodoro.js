import { icon } from '../icons.js';
import { haptic, showToast } from '../main.js';

const CIRCUMFERENCE = 2 * Math.PI * 90;

export function renderPomodoro(container) {
  const saved = JSON.parse(localStorage.getItem('dt_pomo') || '{}');
  let workMin = saved.work || 25;
  let breakMin = saved.brk || 5;
  let sessions = saved.sessions || 0;
  let isWork = true;
  let totalSec = workMin * 60;
  let remaining = totalSec;
  let running = false;
  let timerId = null;

  function saveSettings() {
    localStorage.setItem('dt_pomo', JSON.stringify({ work: workMin, brk: breakMin, sessions }));
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function progress() {
    return 1 - remaining / totalSec;
  }

  function render() {
    const offset = CIRCUMFERENCE * (1 - progress());
    const label = isWork ? 'Focus' : 'Break';
    const dots = Array.from({ length: 4 }, (_, i) =>
      `<div class="timer-dot${i < sessions % 4 ? ' filled' : ''}"></div>`
    ).join('');

    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col" style="align-items:center">
          <div class="timer-ring">
            <svg viewBox="0 0 200 200">
              <circle class="timer-ring-bg" cx="100" cy="100" r="90"/>
              <circle class="timer-ring-progress" cx="100" cy="100" r="90"
                stroke-dasharray="${CIRCUMFERENCE}"
                stroke-dashoffset="${offset}"/>
            </svg>
          </div>
          <div class="timer-display">
            <div class="timer-time" id="pm-time">${fmt(remaining)}</div>
            <div class="timer-label" id="pm-label">${label}</div>
          </div>
          <div class="timer-controls">
            <button class="btn btn-icon btn-secondary" id="pm-reset">${icon('rotateCcw')}</button>
            <button class="btn btn-icon" id="pm-toggle">${running ? icon('pause') : icon('play')}</button>
          </div>
          <div class="timer-sessions">${dots}</div>
        </div>

        <div class="section flex-col gap-md">
          <div class="section-title">Settings</div>
          <div class="range-group">
            <div class="range-label"><span>Work</span><span>${workMin} min</span></div>
            <input type="range" min="1" max="60" value="${workMin}" id="pm-work" ${running ? 'disabled' : ''}>
          </div>
          <div class="range-group">
            <div class="range-label"><span>Break</span><span>${breakMin} min</span></div>
            <input type="range" min="1" max="30" value="${breakMin}" id="pm-break" ${running ? 'disabled' : ''}>
          </div>
        </div>

        <div class="section flex-col gap-sm" style="text-align:center">
          <span style="font-size:13px;color:var(--text-secondary)">Sessions completed: <b style="color:var(--text)">${sessions}</b></span>
        </div>
      </div>`;

    // Toggle play/pause
    container.querySelector('#pm-toggle').addEventListener('click', () => {
      if (running) { pause(); } else { start(); }
      haptic('medium');
      render();
    });

    // Reset
    container.querySelector('#pm-reset').addEventListener('click', () => {
      pause();
      remaining = totalSec;
      haptic('light');
      render();
    });

    // Settings
    container.querySelector('#pm-work')?.addEventListener('input', e => {
      workMin = parseInt(e.target.value);
      if (isWork && !running) { totalSec = workMin * 60; remaining = totalSec; }
      saveSettings();
      render();
    });

    container.querySelector('#pm-break')?.addEventListener('input', e => {
      breakMin = parseInt(e.target.value);
      if (!isWork && !running) { totalSec = breakMin * 60; remaining = totalSec; }
      saveSettings();
      render();
    });
  }

  function tick() {
    remaining--;
    const timeEl = document.getElementById('pm-time');
    if (timeEl) timeEl.textContent = fmt(remaining);

    // Update ring
    const ring = container.querySelector('.timer-ring-progress');
    if (ring) {
      const offset = CIRCUMFERENCE * (1 - progress());
      ring.setAttribute('stroke-dashoffset', offset);
    }

    if (remaining <= 0) {
      pause();
      if (isWork) {
        sessions++;
        saveSettings();
        showToast('Break time!');
      } else {
        showToast('Back to work!');
      }
      haptic('success');
      isWork = !isWork;
      totalSec = (isWork ? workMin : breakMin) * 60;
      remaining = totalSec;

      // Try notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DevToolkit', { body: isWork ? 'Break over — focus!' : 'Good work — take a break!' });
      }

      render();
    }
  }

  function start() {
    running = true;
    timerId = setInterval(tick, 1000);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function pause() {
    running = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  render();

  return () => {
    if (timerId) clearInterval(timerId);
  };
}
