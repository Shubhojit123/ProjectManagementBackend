// server.js
const express = require("express");
require("dotenv").config();
const { dbConnect } = require("./config/DbConnection");
const router = require("./router/Router");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./model/UserModel");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

dbConnect();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ["websocket"],

});

const onlineUsers = {};
app.set("onlineUsers", onlineUsers);
app.set("io", io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token not found"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const userExist = await User.findOne({ email });
    if (!userExist) return next(new Error("User does not exist"));

    socket.user = userExist._id;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  if (!socket.user) {
    console.log("Unauthenticated socket tried to connect");
    return socket.disconnect();
  }

  console.log(`User connected: ${socket.user}`);
  onlineUsers[socket.user] = socket.id;
  console.log(Object.keys(onlineUsers));
  io.emit("onlineUsers", Object.keys(onlineUsers));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user}`);
    delete onlineUsers[socket.user];
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });
  
  socket.on("stop-typing", ({ toUserId }) => {
    const recipientSocketId = onlineUsers[toUserId];
    if (recipientSocketId) {
        io.to(recipientSocketId).emit("hide-typing");
    }});

socket.on("typing", ({ toUserId, fromUsername }) => {
  const recipientSocketId = onlineUsers[toUserId.toString()];
  console.log("From Username:", toUserId);
  console.log("Recipient Socket ID:", recipientSocketId);
  if (recipientSocketId) {
    io.to(recipientSocketId).emit("display-typing", {
      fromUsername,
      toUserId: socket.user.toString(), 
    });
  }
});


});


app.use("/api/v1", router);

server.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
