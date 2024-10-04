const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeUserFromGroupChat,
} = require("../controller/chatController");
const router = express.Router();

// to create a chat
router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
// create a group chat
router.route("/group").post(protect, createGroupChat);
// rename a group
router.route("/rename").put(protect, renameGroupChat);
// remove from a group
router.route("/removefromgroup").put(protect, removeUserFromGroupChat);
// add to a group
router.route("/addtogroup").put(protect, addToGroupChat);

module.exports = router;
