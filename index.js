const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoute");
const message = require("./routes/messages");

const socket = require("socket.io");
const app = express();

require("dotenv").config();

app.use(cors());

app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", message);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log(error.message));

const server = app.listen(process.env.PORT, () => {
  console.log("Server running on Port " + process.env.PORT);
});

const io = socket(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
