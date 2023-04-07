const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
dotenv.config();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});
console.log("first bot");

bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const { username } = callbackQuery.from;

  if (data === "button_clicked") {
    const updatedMessageText = `${message.text} @${username}`;

    bot.editMessageText(updatedMessageText, {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: message.reply_markup,
    });
  }
});

const sendMassage = async ({ dealId, messageText }) => {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 9 || hours >= 18) {
    return 0;
  }
  const urlDeal = `${process.env.BASE_URL_CRM}/${dealId}/`;

  // Define the button markup
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть сделку",
            url: urlDeal,
          },
          {
            text: "Взял",
            callback_data: "button_clicked",
          },
        ],
      ],
    },
  };
  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, messageText, opts);
};

module.exports = { sendMassage };
