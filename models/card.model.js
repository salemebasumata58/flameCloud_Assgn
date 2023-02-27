const mongoose = require("mongoose");

const carddSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true },
    cardName: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const Card = mongoose.model("card", carddSchema);
module.exports = Card;