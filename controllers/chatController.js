const Chat = require("../models/chatModel");
const {UsersModel}=require("../models/index");

class ChatController {
  static async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const currentUser = req.jwtToken?._id;
      const messages = await Chat.find({
        $or: [
          { from: currentUser, to: userId },
          { from: userId, to: currentUser },
        ],
      })
        .sort({ createdAt: 1 })
        .populate("from to", "firstName profileImage");

      return res.json({
        success: true,
        data:messages,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getInboxUsers (req, res) {
  try {
    const userId = req.jwtToken._id;

    // 🔥 get all chats where user involved
    const chats = await Chat.find({
      $or: [{ from: userId }, { to: userId }],
    }).sort({ createdAt: -1 });

    // 🔥 unique users map
    const userMap = new Map();

    for (let chat of chats) {
      const otherUserId =
        chat.from.toString() === userId
          ? chat.to.toString()
          : chat.from.toString();

      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: chat.message,
          time: chat.createdAt,
        });
      }
    }

    const userIds = Array.from(userMap.keys());

    // 🔥 fetch user info
    const users = await UsersModel.find({ _id: { $in: userIds } }).select(
      "firstName lastName profileImage"
    );

    // 🔥 merge data
    const inbox = users.map((u) => ({
      _id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      profileImage: u.profileImage,
      lastMessage: userMap.get(u._id.toString()).lastMessage,
      time: userMap.get(u._id.toString()).time,
    }));

    return res.json({
      success: true,
      data:inbox,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

static async getUnReadMessages(req,res){
  const userId=req.params.id;
  const unReadChats=await Chat.find({$and:[{to:userId},{isRead:false}]});
  return res.status(200).json({
  data:unReadChats.length,
  })
}
}

module.exports = ChatController;