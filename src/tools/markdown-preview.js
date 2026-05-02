// Markdown Preview — live render with syntax support
import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

// Minimal markdown parser (no dependencies)
function parseMd(md) {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="md-code-block"><code>${esc(code.trim())}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links & images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#8ab4f8;text-decoration:underline">$1</a>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="md-quote">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:12px 0">');

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul style="padding-left:20px;margin:8px 0">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Checkbox
  html = html.replace(/\[ \]/g, '<span style="opacity:0.4">☐</span>');
  html = html.replace(/\[x\]/gi, '<span style="color:#4ade80">☑</span>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>\s*<(h[1-6]|pre|blockquote|ul|ol|hr)/g, '<$1');
  html = html.replace(/<\/(h[1-6]|pre|blockquote|ul|ol)>\s*<\/p>/g, '</$1>');

  // Single newlines → <br>
  html = html.replace(/\n/g, '<br>');

  return html;
}

const SAMPLE = `# Hello World

This is a **Markdown** preview tool. It supports:

- **Bold** and *italic* text
- ~~Strikethrough~~ too
- [Links](https://example.com)
- \`inline code\`

## Code Blocks

\`\`\`python
def hello():
    print("Hello, DevToolkit!")
\`\`\`

> Blockquotes look like this

---

- [x] Task completed
- [ ] Task pending

Have fun! 🚀`;

export function renderMarkdown(container) {
  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      <div class="section flex-col gap-md">
        <div class="section-title">Markdown</div>
        <textarea class="input" id="md-input" rows="8" spellcheck="false" placeholder="Type or paste markdown...">${SAMPLE}</textarea>
      </div>
      <div class="section flex-col gap-md">
        <div class="code-block-header">
          <span>PREVIEW</span>
          <button class="btn btn-sm btn-secondary" id="md-copy">${icon('copy',14)} Copy HTML</button>
        </div>
        <div class="md-preview" id="md-preview"></div>
      </div>
    </div>`;

  const input = container.querySelector('#md-input');
  const preview = container.querySelector('#md-preview');

  function update() {
    preview.innerHTML = parseMd(input.value);
  }

  input.addEventListener('input', update);
  update();

  container.querySelector('#md-copy').addEventListener('click', () => {
    copyText(parseMd(input.value));
  });
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
