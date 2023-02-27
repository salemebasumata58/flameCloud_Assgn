const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connect = async () => {
  return mongoose.connect(
    "mongodb+srv://salemes:salemes@cluster0.8hhyd86.mongodb.net/FlameClouds?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: false, 
      // useCreateIndex: true
    }
  );
};
module.exports = connect;