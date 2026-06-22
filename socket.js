const http = require('http');
const config = require('config');

const socketJWTMiddleware = require('./middleware/socketJWTMiddleware');
const { setSocket } = require('./socketInstance');
const { corsOrigins } = require('./utils');

const Chat = require("./models/chatModel");
const {UserAccessService} = require('./services');

module.exports.prepare = ({ app }) => {
  const server = http.createServer(app);

  const io = setSocket({
  server,
  options: {
    cors: { origin: corsOrigins, credentials: true },
    transports: ["websocket", "polling"], // ← add this
  },
});

  // ✅ AUTH
  io.use(socketJWTMiddleware);

  // 🔥 store online users
  const users = {}; // { userId: socketId }

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const ensureSocketAllowed = async () => {
      const accountStatus = await UserAccessService.getAccountStatus({
        userId,
        force: true,
      });
      if (!accountStatus.exists || accountStatus.isBlocked) {
        socket.emit('accountBlocked', {
          reason: accountStatus.blockReason || 'Your account is blocked.',
        });
        socket.disconnect(true);
        return false;
      }

      return true;
    };

    // ✅ store user
    users[userId] = socket.id;

    // 🔥 broadcast online users
    io.emit("onlineUsers", Object.keys(users));

    /* ================= SEND MESSAGE ================= */
    socket.on("sendMessage", async ({ to, message }) => {
  try {
    if (!(await ensureSocketAllowed())) return;
    const from = userId;

    await Chat.create({
      from,
      to,
      message,
      isRead: false,
    });

    // 🔥 GET FULL CHAT BETWEEN USERS
    const updatedMessages = await Chat.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    }).sort({ createdAt: 1 });

    // 🔥 SEND TO RECEIVER
    if (users[to]) {
      io.to(users[to]).emit("messagesUpdated", updatedMessages);
    }

    // 🔥 SEND TO SENDER
    socket.emit("messagesUpdated", updatedMessages);

    // 🔥 UPDATE INBOX
    io.emit("inboxUpdate");

  } catch (err) {
    console.log("CHAT ERROR:", err);
  }
});

    /* ================= MARK AS READ ================= */
   socket.on("markAsRead", async ({ from }) => {
  try {
    if (!(await ensureSocketAllowed())) return;
    await Chat.updateMany(
      { from, to: userId, isRead: false },
      { isRead: true }
    );

    // 🔥 GET UPDATED CHAT
    const updatedMessages = await Chat.find({
      $or: [
        { from: userId, to: from },
        { from: from, to: userId },
      ],
    }).sort({ createdAt: 1 });

    // 🔥 SEND TO BOTH USERS
    if (users[from]) {
      io.to(users[from]).emit("messagesUpdated", updatedMessages);
    }

    socket.emit("messagesUpdated", updatedMessages);

  } catch (err) {
    console.log("READ ERROR:", err);
  }
});
    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      delete users[userId];
      // 🔥 update online list
      io.emit("onlineUsers", Object.keys(users));
    });
  });

  // ✅ start server
  if (config.get('env') !== config.get('envVariables.test')) {
    const PORT = config.get('port') || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }

  return io;
};
