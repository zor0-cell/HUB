const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  watchedAnime: [
    {
      animeId: { type: String, required: true },
      episode: { type: Number, default: 1 },
      rating: { type: Number, min: 1, max: 10 },
    },
  ],
  favorites: [{ type: String }],
});

module.exports = mongoose.model('User', UserSchema);
