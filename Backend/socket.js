

const socketIo=(io)=>{
    //store connected users with their room information using socket.id as their key
    const connectedUsers=new Map();
    io.on('connection',(socket)=>{
        //Get user from authentication
        const user=socket.handshake.auth.user;
        console.log("User connected",user?.name);
        //START :join room handler
        socket.on("join room",(groupId)=>{
            //Add socket to the specified room
            socket.join(groupId);
            //Store user and room info in connectedUsers map
            connectedUsers.set(socket.id,{user,room:groupId});
            //Get list of all users currently in the room
            const usersInRoom=Array.from(connectedUsers.values())
            .filter((u)=>u.room ===groupId)
            .map((u)=>u.user);
            //Emit updated users list to all clients in the room
            io.in(groupId).emit("users in room",usersInRoom);
            socket.to(groupId).emit("notification",{
                type:"USER_JOINED",
                message:`${user?.name}  has joined`,
                user:user,
            });
        });
        //END:Join room handler

        //START :Leave room handler
        //Triggered when user manually leaves a room
        socket.on('leave room',(groupId)=>{
            console.log(`${user?.name} leaving room :`,groupId);
            //remove socket from the room
            socket.leave(groupId);
            if(connectedUsers.has(socket.id)){
                //Remove user from connected users and notify others
                connectedUsers.delete(socket.id);
                socket.to(groupId).emit("user left",user?._id);
            }
        })
        //END:Leave room handler

        //START :New message handler
        //triggered when user sends a new message
        socket.on("new message",(message)=>{
            //Broadcast message to all other users in the room
            socket.to(message.groupId).emit("message received",message);
        });
        //END:New message handler

        //START :Disconnect handler
        //triggered when user disconnects
        socket.on("disconnect",()=>{
            console.log(`${user?.name} disconnected`);
            if (connectedUsers.has(socket.id)) {
            // Get user's room info before removing
            const userData = connectedUsers.get(socket.id);
            //Notify others in the room about user's departure
            socket.to(userData.room).emit("user left", user?._id);
            //Remove user from connected users
            connectedUsers.delete(socket.id);
        }
        })
        //END:Disconnect handler

        //START :Typing indicator
        //Triggered when user starts typing
        socket.on("typing",({groupId,name})=>{
            //Broadcast typing status to other users in the room
            socket.to(groupId).emit("user typing",{name});

        });
        socket.on("stop typing",({groupId})=>{
            //Broadcast stop typing status to other users in the room
            socket.to(groupId).emit("user stop  typing",{name:user?.name});

        });
        
        //END:Typing indicator

    })
}
export default socketIo;