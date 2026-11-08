// Принимает заявку с сайта и пересылает её вам в Telegram через бота.
// Токен бота и ваш chat id хранятся в переменных окружения Netlify (BOT_TOKEN, CHAT_ID),
// в код сайта они не попадают.

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!token || !chatId) return json(500, { error: "not_configured" });

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "bad_json" });
  }

  // Скрытое поле-ловушка: его заполняют только боты. Делаем вид, что всё хорошо.
  if (data.hp) return json(200, { ok: true });

  const text = String(data.text || "").trim().slice(0, 3000);
  if (text.length < 20) return json(400, { error: "empty" });

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: "Новая заявка с сайта\n\n" + text }),
  });

  if (!res.ok) return json(502, { error: "telegram_failed" });
  return json(200, { ok: true });
};
