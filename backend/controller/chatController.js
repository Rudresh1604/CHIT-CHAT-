const { chat } = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    // console.log(userId);

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }

    var isChat = await chat
      .find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
      .populate("users", "-password")
      .populate("latestMessage");
    // get user details except password

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    // if chat already exists
    if (isChat?.lenght > 0) {
      res.send(isChat[0]);
    } else {
      let chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await chat.create(chatData);
      const fullChat = await chat
        .findOne({ _id: createdChat._id })
        .populate("users", "-password");
      res.status(200).send(fullChat);
    }
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

// getting all chats of the login user
const fetchChats = async (req, res) => {
  try {
    let allChats = await chat
      .find({
        users: { $elemMatch: { $eq: req.user._id } },
      })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    allChats = await User.populate(allChats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    // console.log(allChats);
    res.status(200).send(allChats);
  } catch (error) {
    console.log(error);
    res.status(401).send(error.message);
  }
};

// creating a group chat
const createGroupChat = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res
        .status(400)
        .send({ success: false, message: "Please fill all fields" });
    }
    let users = JSON.parse(req.body.users);

    if (users.lenght < 2) {
      return res.status(400).send({
        success: false,
        message: "Atleast 2 users are required for a group chat",
      });
    }
    users.push(req.user);

    const groupChat = await chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      groupAdmin: req.user,
      users: users,
    });
    if (!groupChat) {
      return res
        .status(400)
        .send({ success: false, message: "Oops Something went wrong !" });
    }
    const fullChat = await chat
      .findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    console.log(groupChat);

    return res.status(200).json(fullChat);
  } catch (error) {
    console.log(error);
    return res.status(200).send(error.message);
  }
};

// renaming a group chat
const renameGroupChat = async (req, res) => {
  try {
    const { groupId, chatName } = req.body;

    const groupChat = await chat
      .findByIdAndUpdate(groupId, { chatName }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!groupChat) {
      return res.status(400).send({ success: false, message: "Invalid Group" });
    }

    return res.status(200).json(groupChat);
  } catch (error) {
    console.log(error);
    return res.send(error.message);
  }
};

// add user to a group chat
const addToGroupChat = async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    if (!userId || !groupId) {
      return res.status(400).send("All fields are required !");
    }
    const groupChat = await chat
      .findByIdAndUpdate(groupId, { $push: { users: userId } }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!groupChat) {
      return res.status(400).send("Oops something went wrong !");
    }
    return res.json(groupChat);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

// remove user from a group chat
const removeUserFromGroupChat = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) {
      return res.status(400).send("All fields are required !");
    }
    // const groupChat = await chat
    //   .findByIdAndUpdate(groupId, { $pull: { users: userId } })
    //   .populate("users", "-password")
    //   .populate("groupAdmin", "-password");
    let groupChat = await chat
      .findByIdAndUpdate(groupId, { $pull: { users: userId } })
      .populate("users", "-password");

    if (!groupChat) {
      return res.status(400).send("Oops something went wrong!");
    }

    // If the removed user is the group admin, update the groupAdmin to the first remaining user
    if (groupChat.groupAdmin._id.toString() === userId.toString()) {
      groupChat.groupAdmin = groupChat.users[0];
    }

    groupChat = await groupChat.populate("groupAdmin", "-password");
    groupChat.save();

    return res.status(200).json(groupChat);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeUserFromGroupChat,
};
