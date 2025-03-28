import express from 'express';
import Message from '../models/ChatModel.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const messageRouter=express.Router();

messageRouter.post('/', authMiddleware, async (req, res) => {
    console.log("User creating message:", req.user); // Debug log
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user found" });
        }
        const { content, groupId } = req.body;
        if (!content || !groupId) {
            return res.status(400).json({ message: "Content and groupId are required" });
        }

        const message = await Message.create({
            sender: req.user.id,
            content,
            group: groupId,
        });

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "name")
            .populate("group", "name");

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Message creation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//get messages for a group
messageRouter.get('/:groupId',authMiddleware,async(req,res)=>{
    try {
        const messages=await Message.find({group:req.params.groupId})
        .populate("sender", "name email")
        .sort({createdAt:-1});
        res.json(messages);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

export default messageRouter;