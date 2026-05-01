import { icon } from '../icons.js';
import { copyText, haptic } from '../main.js';

const templates = {
  aiogram_handler: {
    name: 'aiogram 3 — Handler',
    code: `from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command, CommandStart

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer("Hello!")


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer("Help message")


@router.message(F.text)
async def handle_text(message: Message):
    await message.answer(f"You said: {message.text}")


@router.callback_query(F.data.startswith("action:"))
async def handle_callback(callback: CallbackQuery):
    action = callback.data.split(":")[1]
    await callback.answer(f"Action: {action}")
    await callback.message.edit_text(f"Selected: {action}")`,
  },

  aiogram_bot: {
    name: 'aiogram 3 — Bot Setup',
    code: `import asyncio
import logging
import os
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode

BOT_TOKEN = os.environ["BOT_TOKEN"]

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()


async def main():
    # Include routers
    # dp.include_router(router)

    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())`,
  },

  aiogram_keyboard: {
    name: 'aiogram 3 — Keyboards',
    code: `from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    ReplyKeyboardMarkup,
    KeyboardButton,
)


def get_main_keyboard():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Option 1"), KeyboardButton(text="Option 2")],
            [KeyboardButton(text="Settings")],
        ],
        resize_keyboard=True,
    )


def get_inline_keyboard():
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Yes", callback_data="confirm:yes"),
                InlineKeyboardButton(text="No", callback_data="confirm:no"),
            ],
            [InlineKeyboardButton(text="Cancel", callback_data="cancel")],
        ]
    )`,
  },

  fastapi_crud: {
    name: 'FastAPI — CRUD Endpoint',
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    active: bool = True


items_db: dict[int, Item] = {}
counter = 0


@app.post("/items", status_code=201)
async def create_item(item: Item):
    global counter
    counter += 1
    items_db[counter] = item
    return {"id": counter, **item.model_dump()}


@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item_id, **items_db[item_id].model_dump()}


@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return [{"id": k, **v.model_dump()} for k, v in list(items_db.items())[skip:skip+limit]]


@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]
    return {"ok": True}`,
  },

  decorators: {
    name: 'Decorators Collection',
    code: `import functools
import time
import logging

logger = logging.getLogger(__name__)


# ── Retry decorator ──
def retry(max_attempts=3, delay=1):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    logger.warning(f"Attempt {attempt} failed: {e}")
                    await asyncio.sleep(delay * attempt)
        return wrapper
    return decorator


# ── Timer decorator ──
def timer(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"{func.__name__} took {elapsed:.3f}s")
        return result
    return wrapper


# ── Cache decorator (TTL) ──
def cache_ttl(seconds=300):
    def decorator(func):
        _cache = {}
        @functools.wraps(func)
        async def wrapper(*args):
            now = time.time()
            if args in _cache:
                result, ts = _cache[args]
                if now - ts < seconds:
                    return result
            result = await func(*args)
            _cache[args] = (result, now)
            return result
        return wrapper
    return decorator


# ── Rate limiter ──
def rate_limit(calls=1, period=1):
    def decorator(func):
        last_called = [0.0]
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            now = time.time()
            if now - last_called[0] < period / calls:
                return None
            last_called[0] = now
            return await func(*args, **kwargs)
        return wrapper
    return decorator`,
  },
};

export function renderTemplates(container) {
  const keys = Object.keys(templates);

  container.innerHTML = `
    <div class="tool-page flex-col gap-lg">
      ${keys.map(k => {
        const t = templates[k];
        return `
        <div class="section flex-col gap-md">
          <div class="code-block-header">
            <span style="font-size:14px;font-weight:600;color:var(--text)">${t.name}</span>
            <button class="btn btn-sm btn-secondary tpl-copy" data-k="${k}">${icon('copy',14)} Copy</button>
          </div>
          <div class="code-block" style="max-height:150px;overflow-y:auto;font-size:12px">${esc(t.code)}</div>
        </div>`;
      }).join('')}
    </div>`;

  container.querySelectorAll('.tpl-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(templates[btn.dataset.k].code);
      haptic('success');
    });
  });
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
