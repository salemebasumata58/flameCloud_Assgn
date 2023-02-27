const telegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require('dotenv').config()

const Board = require("./models/board.model");
const connect = require("./config/db");
const Card = require("./models/card.model");

const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_KEY = process.env.TRELLO_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
// console.log(BOT_TOKEN)
const bot = new telegramBot(BOT_TOKEN, { polling: true });  //  created a new bot
const app = express();
app.use(cors());

// // Greet initially when server start :
bot.onText(/\/start/, (msg) => {
  let mg = `<strong>Hello ${msg.from.first_name} :</strong>\nWelcome To the Cloud Of Flame Api Service\n****************************************\n\nCreate a New board on flame clod aoi service click on - /create\nTo change an existing board title click on - /update`;

  bot.sendMessage(msg.chat.id, mg, { parse_mode: "HTML" });
});

// Update an Existing Board on Trello 
bot.onText(/\/update/, async (msg) => {
  const namePrompt = await bot.sendMessage(
    msg.chat.id,
    "Type, new title for the existing board",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
    const name = nameMsg.text;
    console.log(name);
    let board = await Board.find().sort({ _id: -1 }).limit(1);
    console.log("b", board[0].boardId);
    fetch(
      `https://api.trello.com/1/boards/${board[0].boardId}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&name=${name}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response.text();
      })
      .then((text) => console.log(text))
      .catch((err) => console.error(err));
  });
});

// Creating The New Board on Trello
bot.onText(/\/create/, async (msg) => {
  const namePrompt = await bot.sendMessage(
    msg.chat.id,
    "Hi, Put a New Board title",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
    const name = nameMsg.text;
    console.log(name);

    let res = await axios.post(
      `https://api.trello.com/1/boards/?name=${name}&${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    );
    console.log(res.data);

    await bot.sendMessage(
      msg.chat.id,
      `Board with name - <b>${name} </b>is created\n**************************** \nAdd New Card to the Board - \nClick on - /here to create new card to the board`,
      { parse_mode: "HTML" }
    );
    await Board.create({
      boardId: res.data.id,
      name: res.data.name,
    });
  });
});

// Creating New Card for the existing Board

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
    `https://api.trello.com/1/boards/${board[0].boardId}/lists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
  );
  let data = await res.json();
  console.log(data);
  let idList = data[0].id;
  bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
    const name = nameMsg.text;
    console.log(name);
    let res1 = await fetch(
      `https://api.trello.com/1/cards?idList=${idList}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&name=${name}`,
      {
        method: "POST",
      }
    );
    let data1 = await res1.json();
    console.log(data1.id);
    await Card.create({
      cardId: data1.id,
      cardName: name,
    });
    await Board.updateOne({ _id: board[0]._id }, { $push: { cards: name } });

    await bot.sendMessage(
      msg.chat.id,
      `card with name - <b>${name} </b>is created \n**************************************\nDo you want to customize your card \nClick to /proceed`,
      { parse_mode: "HTML" }
    );
  });
});

// Removed existing Card from the Board 
bot.onText(/\/proceed/, async (msg) => {
  const namePrompt = await bot.sendMessage(
    msg.chat.id,
    "Please, enter name of the card to Remove from Board",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
    const name = nameMsg.text;
    console.log(name);
    let card = await Card.findOne({
      cardName: name,
    });
    console.log("card", card);
    if (card) {
      let res = await axios.delete(
        `https://api.trello.com/1/cards/${card.cardId}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
      );
      let data = res.data;
      console.log(data);
      await bot.sendMessage(
        msg.chat.id,
        `card with name - <b>${name} </b>is removed successfully \n**************************************\nDo you want to restart again\nClick to - /restart`,
        { parse_mode: "HTML" }
      );
    }
  });
});
// Restart from the Beggining 
bot.onText(/\/restart/, (msg) => {
  let mg = `<strong>Hello, ${msg.from.first_name} :</strong>\nWelcome To the Cloud Of Flame Api Service\n****************************************\n\nCreate a New board on flame clod aoi service click on - /create\nTo change an existing board title click on - /update`;

  bot.sendMessage(msg.chat.id, mg, { parse_mode: "HTML" });
});

// Server Initialzation 
bot.on("message", function onText(msg) {
  console.log(msg.from.first_name);
  let isQuery = msg.text.split("").includes("/");
  // console.log("arr",isQuery);
  if (isQuery) {
    return;
  }
  bot.sendMessage(msg.chat.id, "I am alive!");
});


app.listen(8080, async () => {
  await connect();
  console.log("Server started on 8080");
});

