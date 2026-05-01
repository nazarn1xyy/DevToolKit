import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

function jsonToDataclass(json, name = 'MyModel') {
  const obj = JSON.parse(json);
  const lines = ['from dataclasses import dataclass', '', '', '@dataclass', `class ${name}:`];
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`    ${k}: ${pyType(v)}`);
  }
  return lines.join('\n');
}

function jsonToPydantic(json, name = 'MyModel') {
  const obj = JSON.parse(json);
  const lines = ['from pydantic import BaseModel', '', '', `class ${name}(BaseModel):`];
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`    ${k}: ${pyType(v)}`);
  }
  return lines.join('\n');
}

function jsonToSqlalchemy(json, name = 'MyModel', table = 'my_table') {
  const obj = JSON.parse(json);
  const lines = [
    'from sqlalchemy import Column, Integer, String, Float, Boolean, Text',
    'from sqlalchemy.orm import DeclarativeBase',
    '',
    '',
    'class Base(DeclarativeBase):',
    '    pass',
    '',
    '',
    `class ${name}(Base):`,
    `    __tablename__ = "${table}"`,
    '',
    '    id = Column(Integer, primary_key=True, autoincrement=True)',
  ];
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`    ${k} = Column(${saType(v)})`);
  }
  return lines.join('\n');
}

function pyType(v) {
  if (v === null) return 'str | None';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
  if (typeof v === 'boolean') return 'bool';
  if (Array.isArray(v)) return v.length ? `list[${pyType(v[0])}]` : 'list';
  if (typeof v === 'object') return 'dict';
  return 'str';
}

function saType(v) {
  if (v === null) return 'String, nullable=True';
  if (typeof v === 'string') return v.length > 255 ? 'Text' : 'String(255)';
  if (typeof v === 'number') return Number.isInteger(v) ? 'Integer' : 'Float';
  if (typeof v === 'boolean') return 'Boolean';
  return 'String(255)';
}

export function renderModelGen(container) {
  let tab = 'dataclass';
  let result = '';

  function render() {
    container.innerHTML = `
      <div class="tool-page flex-col gap-lg">
        <div class="section flex-col gap-md">
          <div class="tabs">
            <button class="tab${tab==='dataclass'?' active':''}" data-t="dataclass">Dataclass</button>
            <button class="tab${tab==='pydantic'?' active':''}" data-t="pydantic">Pydantic</button>
            <button class="tab${tab==='sqlalchemy'?' active':''}" data-t="sqlalchemy">SQLAlchemy</button>
          </div>
          <input class="input" id="mg-name" placeholder="Class name (MyModel)" value="MyModel" spellcheck="false">
          <textarea class="input" id="mg-json" placeholder='{"name": "test", "age": 25, "active": true}' rows="5" spellcheck="false"></textarea>
          <button class="btn" id="mg-gen">${icon('code',18)} Generate</button>
        </div>
        <div id="mg-out" class="hidden">
          <div class="section flex-col gap-md">
            <div class="code-block-header">
              <span>PYTHON</span>
              <button class="btn btn-sm btn-secondary" id="mg-copy">${icon('copy',14)} Copy</button>
            </div>
            <div class="code-block" id="mg-code" style="max-height:350px;overflow-y:auto"></div>
          </div>
        </div>
      </div>`;

    container.querySelector('.tabs').addEventListener('click', e => {
      const t = e.target.closest('.tab');
      if (t) { tab = t.dataset.t; haptic('light'); render(); }
    });

    container.querySelector('#mg-gen').addEventListener('click', () => {
      const json = container.querySelector('#mg-json').value.trim();
      const name = container.querySelector('#mg-name').value.trim() || 'MyModel';
      try {
        if (tab === 'dataclass') result = jsonToDataclass(json, name);
        else if (tab === 'pydantic') result = jsonToPydantic(json, name);
        else result = jsonToSqlalchemy(json, name, name.toLowerCase());
        container.querySelector('#mg-code').textContent = result;
        container.querySelector('#mg-out').classList.remove('hidden');
        haptic('success');
      } catch (e) {
        container.querySelector('#mg-code').innerHTML = `<span style="color:#ff6b6b">${e.message}</span>`;
        container.querySelector('#mg-out').classList.remove('hidden');
        haptic('error');
      }
    });

    container.querySelector('#mg-copy')?.addEventListener('click', () => { if (result) copyText(result); });
  }
  render();
}
