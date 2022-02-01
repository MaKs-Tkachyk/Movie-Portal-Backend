const mongoose = require('mongoose')

const film = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    moving: { type: String, required: true },
    picture: { type: String },
    country: { type: String, required: true },
    time: { type: Number, required: true },
    rating: { type: Number, required: true, default: 0 },
    genre: { type: Array, required: true },
    release: { type: Number, required: true },
    director: { type: String, required: true },
    cast: { type: String, required: true },

})

module.exports = mongoose.model('film', film)