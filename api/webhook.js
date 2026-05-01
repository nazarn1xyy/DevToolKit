// Telegram Bot Webhook — responds to /start only
// Runs as Vercel Serverless Function (zero hosting)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'DevToolkit webhook active' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'BOT_TOKEN not set' });
  }

  try {
    const update = req.body;
    const message = update?.message;

    if (!message?.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Only handle /start
    if (text === '/start' || text.startsWith('/start ')) {
      const WEBAPP_URL = process.env.WEBAPP_URL || `https://${req.headers.host}`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '*DevToolkit*\n\nDeveloper utilities — in your pocket.\n\n15 tools: colors, CSS gen, JSON formatter, image compressor, Python generators, and more.',
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Open DevToolkit',
                  web_app: { url: WEBAPP_URL },
                },
              ],
            ],
          },
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
