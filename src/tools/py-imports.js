import { icon } from '../icons.js';
import { copyText, haptic, showToast } from '../main.js';

// Known stdlib modules to exclude
const STDLIB = new Set(['os','sys','re','json','math','time','datetime','typing','logging','pathlib',
  'collections','functools','itertools','hashlib','base64','uuid','abc','io','copy','enum','struct',
  'string','textwrap','unicodedata','difflib','pprint','dataclasses','contextlib','traceback',
  'unittest','argparse','configparser','csv','sqlite3','xml','html','http','urllib','email',
  'asyncio','socket','ssl','threading','multiprocessing','subprocess','tempfile','shutil','glob',
  'pickle','shelve','zlib','gzip','zipfile','tarfile','stat','fnmatch','random','secrets',
  'statistics','decimal','fractions','operator','signal','warnings','inspect','dis','types',
  'weakref','array','queue','heapq','bisect','codecs','locale','gettext','platform','ctypes',
  'importlib','pkgutil','ast','compileall','token','tokenize','pdb','cProfile','profile',
  'timeit','trace','__future__','builtins','gc','marshal','mmap','code','codeop','rlcompleter']);

function extractImports(code) {
  const pkgs = new Set();
  const lines = code.split('\n');
  for (const line of lines) {
    const l = line.trim();
    // import X / import X as Y / import X, Y
    let m = l.match(/^import\s+(.+)/);
    if (m) {
      m[1].split(',').forEach(p => {
        const name = p.trim().split(/\s+as\s+/)[0].split('.')[0].trim();
        if (name && !STDLIB.has(name) && !name.startsWith('_')) pkgs.add(name);
      });
      continue;
    }
    // from X import ...
    m = l.match(/^from\s+(\S+)\s+import/);
    if (m) {
      const name = m[1].split('.')[0].trim();
      if (name && !STDLIB.has(name) && !name.startsWith('_') && !name.startsWith('.')) pkgs.add(name);
    }
  }
  return [...pkgs].sort();
}

// Common package name mappings (import name → pip name)
const PIP_MAP = {
  'PIL': 'Pillow', 'cv2': 'opencv-python', 'sklearn': 'scikit-learn',
  'bs4': 'beautifulsoup4', 'yaml': 'PyYAML', 'dotenv': 'python-dotenv',
  'jwt': 'PyJWT', 'magic': 'python-magic', 'gi': 'PyGObject',
  'telegram': 'python-telegram-bot', 'pyrogram': 'Pyrogram',
  'docx': 'python-docx', 'openpyxl': 'openpyxl', 'xlrd': 'xlrd',
  'psycopg2': 'psycopg2-binary', 'MySQLdb': 'mysqlclient',
  'lxml': 'lxml', 'pydantic': 'pydantic', 'httpx': 'httpx',
  'aiohttp': 'aiohttp', 'fastapi': 'fastapi', 'uvicorn': 'uvicorn',
  'starlette': 'starlette', 'sqlalchemy': 'SQLAlchemy',
  'alembic': 'alembic', 'celery': 'celery', 'redis': 'redis',
  'pymongo': 'pymongo', 'motor': 'motor', 'boto3': 'boto3',
  'pytz': 'pytz', 'requests': 'requests', 'flask': 'Flask',
  'django': 'Django', 'scrapy': 'Scrapy', 'selenium': 'selenium',
  'numpy': 'numpy', 'pandas': 'pandas', 'matplotlib': 'matplotlib',
  'scipy': 'scipy', 'torch': 'torch', 'tensorflow': 'tensorflow',
  'transformers': 'transformers', 'openai': 'openai',
  'supabase': 'supabase', 'aiogram': 'aiogram',
  'apscheduler': 'APScheduler', 'Crypto': 'pycryptodome',
};

export function renderImports(container) {
  let result = '';

  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      <div class="section flex-col gap-md">
        <div class="section-title">Paste Python Code</div>
        <textarea class="input" id="pi-input" placeholder="import aiogram\nfrom telegram.ext import Application\nimport httpx\nfrom dotenv import load_dotenv" rows="8" spellcheck="false"></textarea>
        <button class="btn" id="pi-extract">${icon('download',18)} Extract</button>
      </div>
      <div id="pi-out" class="hidden">
        <div class="section flex-col gap-md">
          <div class="section-title">requirements.txt</div>
          <div class="code-block" id="pi-req"></div>
          <button class="btn btn-secondary" id="pi-copy-req">${icon('copy',18)} Copy requirements.txt</button>
        </div>
        <div class="section flex-col gap-md" style="margin-top:12px">
          <div class="section-title">pip install</div>
          <div class="code-block" id="pi-pip"></div>
          <button class="btn btn-secondary" id="pi-copy-pip">${icon('copy',18)} Copy command</button>
        </div>
      </div>
    </div>`;

  container.querySelector('#pi-extract').addEventListener('click', () => {
    const code = container.querySelector('#pi-input').value;
    const pkgs = extractImports(code);
    if (!pkgs.length) { showToast('No packages found'); haptic('error'); return; }

    const pipNames = pkgs.map(p => PIP_MAP[p] || p);
    const req = pipNames.join('\n');
    const pip = `pip install ${pipNames.join(' ')}`;

    container.querySelector('#pi-req').textContent = req;
    container.querySelector('#pi-pip').textContent = pip;
    container.querySelector('#pi-out').classList.remove('hidden');
    result = req;
    haptic('success');

    container.querySelector('#pi-copy-req').addEventListener('click', () => copyText(req));
    container.querySelector('#pi-copy-pip').addEventListener('click', () => copyText(pip));
  });
}
