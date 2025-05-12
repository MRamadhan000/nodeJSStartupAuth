const BoardingHouse = require('../models/boardingHouse.js');

// Create new boarding house
exports.createBoardingHouse = async (req, res) => {
  try {
    const newHouse = new BoardingHouse(req.body);
    const savedHouse = await newHouse.save();
    res.status(201).json(savedHouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all boarding houses
exports.getAllBoardingHouses = async (req, res) => {
  try {
    const houses = await BoardingHouse.find();
    res.status(200).json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one boarding house by ID
exports.getBoardingHouseById = async (req, res) => {
  try {
    const house = await BoardingHouse.findById(req.params.id);
    if (!house) return res.status(404).json({ message: "Boarding house not found" });
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update boarding house by ID
exports.updateBoardingHouse = async (req, res) => {
  try {
    const updatedHouse = await BoardingHouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedHouse) return res.status(404).json({ message: "Boarding house not found" });
    res.status(200).json(updatedHouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete boarding house by ID
exports.deleteBoardingHouse = async (req, res) => {
  try {
    const deleted = await BoardingHouse.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Boarding house not found" });
    res.status(200).json({ message: "Boarding house deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};