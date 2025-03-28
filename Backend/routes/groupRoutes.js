import express from 'express';
import Group from '../models/GroupModel.js';
import {  authMiddleware } from '../middlewares/authMiddleware.js';


const checkSuperadmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Only superadmins can add staff members." });
  }
  next();
};

const groupRouter=express.Router();
groupRouter.post('/',authMiddleware,checkSuperadmin,async(req,res)=>{
    console.log(req.user);
    try{
        const {name,description}=req.body;
        const group= await Group.create({name:name,description:description,
        admin:req.user.id,
        members:[req.user.id],
        });
        console.log(req.user);
        const populateGroup=await Group.findById(group._id)
        .populate("admin",'name ')
        .populate("members","name ");
        res.status(201).json({populateGroup});

    }catch(error){
        res.status(400).json({error:error.message});
    }
})

//get all groups
groupRouter.get("/",authMiddleware,async(req,res)=>{
    try {
        const groups=await Group.find()
        .populate("admin","name email")
        .populate("members","name email");
        res.json(groups);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

//join group
groupRouter.post("/:groupId/join",authMiddleware,async(req,res)=>{
    try {
        const group = await Group.findById(req.params.groupId);
        console.log(group);
    
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }
        if (group.members.includes(req.user.id)) {
            return res.status(404).json({ message: "Already in group" });
          }
        // Add the authenticated user to the group members if not already added
        if (!group.members.includes(req.user.id)) {
          group.members.push(req.user.id);
          await group.save();
        }
    
        // Respond with the updated group details
        res.status(200).json({ message: "Joined group successfully", group });
      }catch(error){
        console.error("Error joining group:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
});


//leave group 
groupRouter.post('/:groupId/leave',authMiddleware, async (req, res) => {
    try {
      const group = await Group.findById(req.params.groupId);
  
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      // Check if the user is a member of the group
      if (!group.members.includes(req.user.id)) {
        return res.status(400).json({
          message: "You are not a member of this group",
        });
      }
  
      // If the user is the admin
      if (group.admin.toString() === req.user.id.toString()) {
        if (group.members.length > 1) {
          return res.status(400).json({
            message:
              "You are the admin of this group. Transfer admin rights to another member before leaving.",
          });
        } else {
          // Delete the group if the admin is the only member
          await group.deleteOne();
          return res.status(200).json({
            message: "You were the only member of the group. Group has been deleted.",
          });
        }
      }
  
      // Remove the user from the group's members
      group.members = group.members.filter(member => member && member.toString() !== req.user.id);

  
      await group.save();
  
      res.status(200).json({
        message: "You have left the group successfully",
        group,
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
  
export default groupRouter;