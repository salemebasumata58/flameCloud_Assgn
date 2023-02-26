const telegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Board = require("./models/board.model");
const connect = require("./config/db");
const token = "5408828169:AAE8kErfrLKqiC6JY1Keoi5EvV56wOwElAg";
// const Trello = require('node-trello');

const bot = new telegramBot(token, { polling: true });
const app = express();
app.use(cors());
// const t = new Trello("9808782db7c98d124243ace66edc9e6d", "ATTAb874ba43023a3dfc7b2358ec95fb86be965e1580b257e0b30cfba509024b6e0724B7AF25");
bot.onText(/\/start/, (msg) => {
  let mg = `/create board - Create a newtrello board on trello 
  /update board - update a  board on trello`;

  bot.sendMessage(msg.chat.id, mg);
});
// bot.onText(/\/create/, (msg) => {
//   bot.sendMessage(msg.chat.id, "<strong>Enter your Board name</strong>", {
//     parse_mode: "HTML",
//   });
// });

bot.onText(/\/create/, async (msg) => {
  const namePrompt = await bot.sendMessage(
    msg.chat.id,
    "Hi, Put a Board name",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
    const name = nameMsg.text;
    console.log(name);
    // save name in DB if you want to ...
    let res = await fetch(
      `https://api.trello.com/1/boards/?name=${name}&key=9808782db7c98d124243ace66edc9e6d&token=ATTAb874ba43023a3dfc7b2358ec95fb86be965e1580b257e0b30cfba509024b6e0724B7AF25`,
      {
        method: "POST",
      }
    )
      .then((response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response.json();
      })
      .then((text) => text)
      .catch((err) => console.error(err));
    console.log(res.id);

    await bot.sendMessage(
      msg.chat.id,
      `Board with name - <b>${name} </b>is created \nadd new card to the board - \nClick /here`,
      { parse_mode: "HTML" }
    );
    await Board.create({
      boardId: res.id,
      name: res.name,
    });
  });
});
bot.onText(/\/here/, async (msg) => {
  console.log(msg.chat.id);
  const namePrompt = await bot.sendMessage(msg.chat.id, "Hi, Put a card name", {
    reply_markup: {
      force_reply: true,
    },
  });
  let board = await Board.find().sort({ _id: -1 }).limit(1);
  console.log("b", board[0].boardId);

  let res = await fetch(
    `https://api.trello.com/1/boards/${board[0].boardId}/lists?key=9808782db7c98d124243ace66edc9e6d&token=ATTAb874ba43023a3dfc7b2358ec95fb86be965e1580b257e0b30cfba509024b6e0724B7AF25`
  );
  let data = await res.json();
  console.log(data);
  let idList = data[0].id;
  bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
    const name = nameMsg.text;
    console.log(name);
    let res1 = await fetch(
      `https://api.trello.com/1/cards?idList=${idList}&key=9808782db7c98d124243ace66edc9e6d&token=ATTAb874ba43023a3dfc7b2358ec95fb86be965e1580b257e0b30cfba509024b6e0724B7AF25&name=${name}`,
      {
        method: "POST",
      }
    );
    let data1 = await res1.json();
    console.log(data1);
    await bot.sendMessage(
      msg.chat.id,
      `card with name - <b>${name} </b>is created \n**************************************\nDo you want to customize your card \nClick to /proceed`,
      { parse_mode: "HTML" }
    );
  });
});
bot.onText(/\/create/, async (msg) => {
  await bot.sendMessage(
  msg.chat.id,
  `card with name - <b>${name} </b>is created \n**************************************\nDo you want to customize your card \nClick to /proceed`,
  { parse_mode: "HTML" }
);
});
bot.on("message", function onText(msg) {
  // console.log(msg);
  let isQuery = msg.text.split("").includes("/");
  // console.log("arr",isQuery);
  if (isQuery) {
    return;
  }
  bot.sendMessage(msg.chat.id, "I am alive!");
});

app.listen(process.env.PORT || 8000, async () => {
  await connect();
  console.log("Server started on 8000");
});
//Token = "ATTAb874ba43023a3dfc7b2358ec95fb86be965e1580b257e0b30cfba509024b6e0724B7AF25"
//Key="9808782db7c98d124243ace66edc9e6d"
