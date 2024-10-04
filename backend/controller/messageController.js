const { chat } = require("../models/chatModel");
const { message } = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.status(400).send("Invalid Content Please try again !");
    }
    let newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    // do chatgpt this to learn why populate is not used in single sentence
    let message1 = await message.create(newMessage);
    message1 = await message1.populate("sender", "name email pic");
    message1 = await message1.populate("chat");
    message1 = await User.populate(message1, {
      path: "chat.users",
      select: "name pic email",
    });

    await chat.findByIdAndUpdate(chatId, { latestMessage: message1 });

    res.json(message1);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await message
      .find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

module.exports = { sendMessage, allMessages };
