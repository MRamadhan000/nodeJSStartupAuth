const express = require("express");
const authenticateToken = require("../middlewares/auth.js");
const {
  createBoardingHouse,
  getAllBoardingHouses,
  getBoardingHouseById,
  updateBoardingHouse,
  deleteBoardingHouse,
} = require("../controllers/boardingHouseController.js");

const router = express.Router();
const verifyRoles = require("../middlewares/verifyRoles.js");

// Apply the middleware to routes that need authentication
router.post("/",authenticateToken ,verifyRoles("Admin"),createBoardingHouse); 
router.get("/", authenticateToken, verifyRoles("User"), getAllBoardingHouses);
router.get("/:id", authenticateToken,verifyRoles("User"), getBoardingHouseById);
router.put(
  "/:id",
  authenticateToken,
  verifyRoles("Admin"),
  updateBoardingHouse
);

router.delete(
  "/:id",
  authenticateToken,
  verifyRoles("Admin"),
  deleteBoardingHouse
);


module.exports = router;