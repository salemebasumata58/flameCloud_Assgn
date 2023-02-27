const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    boardId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const Board = mongoose.model("board", boardSchema);
module.exports = Board;
