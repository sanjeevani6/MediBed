import{
    Box,
    VStack,
    HStack,
    Text,
    Input,
    Button,
    Flex,
    Icon,
    Avatar,
    InputGroup,
    InputRightElement,
    useToast,
  } from "@chakra-ui/react";
  import { FiSend, FiInfo, FiMessageCircle } from "react-icons/fi";
  import UsersList from "./UsersList";
  import { useRef, useState } from "react";
  import { useEffect } from "react";
  import axios from "axios";
  // import http://localhost:8080 from "../../utils";
  
  const ChatArea = ({ selectedGroup, socket, setSelectedGroup }) => {
    console.log(selectedGroup?._id);
    console.log(selectedGroup?._id || "No group selected");

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const toast = useToast();
  
    const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});
  
    useEffect(() => {
      if (selectedGroup && socket) {
        //fetch messages
        fetchMessages();
        socket.emit("join room", selectedGroup?._id);
        socket.on("message receive", (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
        });
  
        socket.on("users in room", (users) => {
          setConnectedUsers(users);
        });
  
        socket.on("user joined", (user) => {
          setConnectedUsers((prev) => [...prev, user]);
        });
  
        socket.on("user left", (userId) => {
          setConnectedUsers((prev) =>
            prev.filter((user) => user?._id !== userId)
          );
        });
  
        socket.on("notification", (notification) => {
          toast({
            title:
              notification?.type === "USER_JOINED" ? "New User" : "Notification",
            description: notification.message,
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        });
  
        socket.on("user typing", ({ name }) => {
          setTypingUsers((prev) => new Set(prev).add(name));
        });
  
        socket.on("user stop typing", ({ name }) => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(name);
            return newSet;
          });
        });
        //clean up
        return () => {
          socket.emit("leave room", selectedGroup?._id);
          socket.off("message received");
          socket.off("users in room");
          socket.off("user joined");
          socket.off("user left");
          socket.off("notification");
          socket.off("user typing");
          socket.off("user stop typing");
        };
      }
    }, [selectedGroup, socket, toast]);
    //fetch messages

    const getAuthConfig = () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,  // Ensure cookies are sent if needed
      };
    };
    
    const fetchMessages = async () => {
      const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});
      const token = currentUser?.token;
      try {
        const { data } = await axios.get(
          `http://localhost:8080/api/messages/${selectedGroup?._id}`,
          getAuthConfig()
        );
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };
  
    //send message
    const sendMessage = async () => {
      if (!newMessage.trim()) {
        return;
      }
      if (!currentUser.token) {
        toast({
          title: "Authentication error",
          description: "Please log in again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      try {
        const token = currentUser.token;
        console.log(selectedGroup);
        console.log("Sending message:", newMessage);
        console.log("Selected Group ID:", selectedGroup?._id);

        const { data } = await axios.post(
          `http://localhost:8080/api/messages`,
          {
            content: newMessage,
            groupId: selectedGroup?._id,
          },
          getAuthConfig()
        );
        socket.emit("new message", {
          ...data,
          groupId: selectedGroup?._id,
        });
  
        setMessages([...messages, data]);
        setNewMessage("");
      } catch (error) {
        toast({
          title: "Error sending message",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    //handleTyping
    const handleTyping = (e) => {
      setNewMessage(e.target.value);
      if (!isTyping && selectedGroup) {
        setIsTyping(true);
        socket.emit("typing", {
          groupId: selectedGroup?._id,
          name: currentUser?.staff?.name,
        });
      }
      //clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      //set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedGroup) {
          socket.emit("stop typing", {
            groupId: selectedGroup?._id,
          });
        }
        setIsTyping(false);
      }, 2000);
    };
    //format time
    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    //render typing indicator
    const renderTypingIndicator = () => {
      if (typingUsers.size === 0) return null;
      const typingUsersArray = Array.from(typingUsers);
  
      return typingUsersArray?.map((name) => (
        <Box
          key={name}
          alignSelf={
            name === currentUser?.staff?.name ? "flex-start" : "flex-end"
          }
          maxW="70%"
        >
          <Flex
            align="center"
            bg={name === currentUser?.staff?.name ? "blue.50" : "gray.50"}
            p={2}
            borderRadius="lg"
            gap={2}
          >
            {/* current user (You) -left side */}
            {name === currentUser?.staff?.name ? (
              <>
                <Avatar size="xs" name={name} />
                <Flex align="center" gap={1}>
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    You are typing
                  </Text>
                  <Flex gap={1}>
                    {[1, 2, 3].map((dot) => (
                      <Box
                        key={dot}
                        w="3px"
                        h="3px"
                        borderRadius="full"
                        bg="gray.500"
                      />
                    ))}
                  </Flex>
                </Flex>
              </>
            ) : (
              <>
                <Flex align="center" gap={1}>
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    {name} is typing
                  </Text>
                  <Flex gap={1}>
                    {[1, 2, 3].map((dot) => (
                      <Box
                        key={dot}
                        w="3px"
                        h="3px"
                        borderRadius="full"
                        bg="gray.500"
                      />
                    ))}
                  </Flex>
                </Flex>
                <Avatar size="xs" name={name} />
              </>
            )}
          </Flex>
        </Box>
      ));
    };
    // Sample data for demonstration
    const sampleMessages = [
      {
        id: 1,
        content: "Hey team! Just pushed the new updates to staging.",
        sender: { name: "Sarah Chen" },
        createdAt: "10:30 AM",
        isCurrentUser: false,
      },
      {
        id: 2,
        content: "Great work! The new features look amazing 🚀",
        sender: { name: "Alex Thompson" },
        createdAt: "10:31 AM",
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "Thanks! Let's review it in our next standup.",
        sender: { name: "You" },
        createdAt: "10:32 AM",
        isCurrentUser: true,
      },
    ];
  
    return (
      <Flex
        h="100%"
        position="relative"
        direction={{ base: "column", lg: "row" }}
      >
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          bg="gray.50"
          maxW={{ base: "100%", lg: `calc(100% - 260px)` }}
        >
          {/* Chat Header */}
          {selectedGroup ? (
            <>
              <Flex
                px={6}
                py={4}
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.200"
                align="center"
                boxShadow="sm"
              >
                <Button
                  display={{ base: "inline-flex", md: "none" }}
                  variant="ghost"
                  mr={2}
                  onClick={() => setSelectedGroup(null)}
                >
                  ←
                </Button>
                <Icon
                  as={FiMessageCircle}
                  fontSize="24px"
                  color="blue.500"
                  mr={3}
                />
                <Box flex="1">
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {selectedGroup.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {selectedGroup.description}
                  </Text>
                </Box>
                <Icon
                  as={FiInfo}
                  fontSize="20px"
                  color="gray.400"
                  cursor="pointer"
                  _hover={{ color: "blue.500" }}
                />
              </Flex>
  
              {/* Messages Area */}
              <VStack
                flex="1"
                overflowY="auto"
                spacing={4}
                align="stretch"
                px={6}
                py={4}
                position="relative"
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    width: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "gray.200",
                    borderRadius: "24px",
                  },
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message._id}
                    alignSelf={
                      message.sender._id === currentUser?.staff?._id
                        ? "flex-start"
                        : "flex-end"
                    }
                    maxW="70%"
                  >
                    <Flex direction="column" gap={1}>
                      <Flex
                        align="center"
                        mb={1}
                        justifyContent={
                          message.sender._id === currentUser?.staff?._id
                            ? "flex-start"
                            : "flex-end"
                        }
                        gap={2}
                      >
                        {message.sender._id === currentUser?.staff?._id ? (
                          <>
                            <Avatar size="xs" name={message.sender.name} />
                            <Text fontSize="xs" color="gray.500">
                              You • {formatTime(message.createdAt)}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text fontSize="xs" color="gray.500">
                              {message.sender.name} •{" "}
                              {formatTime(message.createdAt)}
                            </Text>
                            <Avatar size="xs" name={message.sender.name} />
                          </>
                        )}
                      </Flex>
  
                      <Box
                        bg={
                          message?.sender._id === currentUser?.staff?._id
                            ? "blue.500"
                            : "white"
                        }
                        color={
                          message?.sender._id === currentUser?.staff?._id
                            ? "white"
                            : "gray.800"
                        }
                        p={3}
                        borderRadius="lg"
                        boxShadow="sm"
                      >
                        <Text>{message.content}</Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
                {renderTypingIndicator()}
                <div ref={messagesEndRef} />
              </VStack>
  
              {/* Message Input */}
              <Box
                p={4}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.200"
                position="relative"
                zIndex="1"
              >
                <InputGroup size="lg">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    pr="4.5rem"
                    bg="gray.50"
                    border="none"
                    _focus={{
                      boxShadow: "none",
                      bg: "gray.100",
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                      _hover={{
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s"
                      onClick={sendMessage}
                    >
                      <Icon as={FiSend} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </>
          ) : (
            <>
              <Flex
                h="100%"
                direction="column"
                align="center"
                justify="center"
                p={8}
                textAlign="center"
              >
                <Icon
                  as={FiMessageCircle}
                  fontSize="64px"
                  color="gray.300"
                  mb={4}
                />
                <Text fontSize="xl" fontWeight="medium" color="gray.500" mb={2}>
                  Welcome to the Chat
                </Text>
                <Text color="gray.500" mb={2}>
                  Select a group from the sidebar to start chatting
                </Text>
              </Flex>
            </>
          )}
        </Box>
  
        {/* UsersList with responsive width */}
        <Box
          width={{ base: "100%", lg: "260px" }}
          position={{ base: "static", lg: "sticky" }}
          right={0}
          top={0}
          height={{ base: "auto", lg: "100%" }}
          flexShrink={0}
          display={{ base: "none", lg: "block" }}
        >
          {selectedGroup && <UsersList users={connectedUsers} />}
        </Box>
      </Flex>
    );
  };
  
  export default ChatArea;