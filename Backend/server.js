import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import DB connection
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import addstaffroute from "./routes/staff.js";
import doctorRoute from "./routes/doctor.js";
import patientRoute from "./routes/patientRoutes.js";
import bedRoutes from "./routes/bedRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { sendEmail } from "./utils/sendEmail.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware (Ensure it's only added once)
app.use(cors({
    origin: "http://localhost:5173", // Allow only your frontend
    credentials: true, 
}));
app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

// Initialize Socket.io
const io = new SocketServer(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
    const user = socket.handshake.auth.user;
    console.log("User connected:", user?.name);

    // Join Room
    socket.on("join room", (groupId) => {
        socket.join(groupId);
        connectedUsers.set(socket.id, { user, room: groupId });

        const usersInRoom = Array.from(connectedUsers.values())
            .filter((u) => u.room === groupId)
            .map((u) => u.user);

        io.in(groupId).emit("users in room", usersInRoom);
        socket.to(groupId).emit("notification", {
            type: "USER_JOINED",
            message: `${user?.name} has joined`,
            user: user,
        });
    });

    // Leave Room
    socket.on('leave room', (groupId) => {
        console.log(`${user?.name} leaving room:`, groupId);
        socket.leave(groupId);
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
    });

    // New Message
    socket.on("new message", (message) => {
        socket.to(message.groupId).emit("message received", message);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log(`${user?.name} disconnected`);
        if (connectedUsers.has(socket.id)) {
            const userData = connectedUsers.get(socket.id);
            socket.to(userData.room).emit("user left", user?._id);
            connectedUsers.delete(socket.id);
        }
    });

    // Typing Indicator
    socket.on("typing", ({ groupId, name }) => {
        socket.to(groupId).emit("user typing", { name });
    });

    socket.on("stop typing", ({ groupId }) => {
        socket.to(groupId).emit("user stop typing", { name: user?.name });
    });
});

// Routes (Define only once)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/staff", addstaffroute);
app.use("/api/v1/doctor", doctorRoute);
app.use("/api/v1/patients", patientRoute);
app.use("/api/v1/beds", bedRoutes);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);
app.post("/send-email", async (req, res) => {
    const { email, message } = req.body;
    try {
      await sendEmail(email, message);
      res.status(200).json({ status: "success", message: "Email sent successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: "Error sending email" });
    }
});

// Set port correctly
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
