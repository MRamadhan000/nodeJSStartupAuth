const mongoose = require('mongoose');

const boardingHouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: ["male", "female", "mixed"], required: true }, // "putra", "putri", "campur"
  price: { type: Number, required: true },
  images: { type: [String], default: [] },
  roomSize: { type: String, required: true },
  description: { type: String, required: false },
  facilities: {
    private: { type: [String], default: [] },
    shared: { type: [String], default: [] }, 
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
});

const BoardingHouse = mongoose.model("BoardingHouse", boardingHouseSchema);

module.exports = BoardingHouse;