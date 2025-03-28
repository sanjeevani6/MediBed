import mongoose from 'mongoose';
import Staff from "./staffmodel.js";
const messageSchema=new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:Staff,
    },
    
    content:{
        type: String,
        required: true,
    },
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Group',
    },

},{
    timestamps:true,
});


const Message=mongoose.model("Message",messageSchema);
export default  Message;
