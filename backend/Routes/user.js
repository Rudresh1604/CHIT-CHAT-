const express = require("express");
const {
  registerUser,
  loginController,

  allUserController,
} = require("../controller/user");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(registerUser).get(protect, allUserController);
router.route("/login").post(loginController);

module.exports = router;
