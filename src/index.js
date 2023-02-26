const telegramBot = require("node-telegram-bot-api");
const token = "5408828169:AAE8kErfrLKqiC6JY1Keoi5EvV56wOwElAg";

const bot = new telegramBot(token, { polling: true });

// bot.on("message", (message) => {
//   console.log(message.from.id);
//   let client_name = message.from.id;
//   bot.sendMessage(client_name, 'hello');
// });
bot.onText(/\/start/, (msg) => {
  let mg = `
    /create board - Create a new board on trello
    /update board = update a new board on trello
    `;
  bot.sendMessage(msg.chat.id, mg);
});
bot.on('message', function onMessage(msg) {
    bot.sendMessage(msg.chat.id, 'I am alive!');
  });
