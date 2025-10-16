const { send } = require("express/lib/response");
const Chats = require("../../model/ChatModel");
const Users = require("../../model/UserModel");
exports.sendMsg = async (req, res) => {
    try {
        const email = req.email;
        const sender = await Users.findOne({ email });
        const { recivedId, msg } = req.body;
        const receiver = await Users.findById(recivedId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        const newChat = new Chats({
            senderId: sender._id,
            receiverId: receiver._id,
            message: msg
        });
        await newChat.save();
        const onlineUser = req.app.get("onlineUsers");
        console.log("OnlineUser",onlineUser);
        const socketId = onlineUser[recivedId];
        if (socketId) {
            const io = req.app.get("io");
            console.log("Socket ID: ", socketId);
            io.to(socketId).emit("msg-recieve", newChat);
        }        
        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }

}

exports.getMsg = async (req, res) => {
    try {
        const email = req.email;
        const sender = await Users.findOne({ email });
        const { id } = req.params;
        console.log(id);
        const receiver = await Users.findById(id);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        const messages = await Chats.find({
            $or: [
                { senderId: sender._id, receiverId: receiver._id },
                { senderId: receiver._id, receiverId: sender._id },
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}