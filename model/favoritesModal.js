const mongoose = require("mongoose");

const { Schema } = mongoose;

const favoriteSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  releaseDates: [],
  titles: [],
  characters: [],
});

module.exports = mongoose.model("Favorite", favoriteSchema);
