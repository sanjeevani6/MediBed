import {
  Box,
  VStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Icon,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
  import axios from "axios";
  import { useEffect, useState } from "react";
  import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
  import { Link, useNavigate } from "react-router-dom";
  const Sidebar = ({setSelectedGroup}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [newGroupName, setNewGroupName] = useState("");
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [newGroupDescription, setNewGroupDescription] = useState("");
    const toast = useToast();
    const [isAdmin, setIsAdmin] = useState(false);

    const navigate=useNavigate();
    useEffect(()=>{
      checkAdminStatus();
      fetchGroups();
    },[]);
  
    //check if login user is an admin
    const checkAdminStatus = () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      console.log(userInfo);
      console.log(userInfo?.role);
    
      // Update admin status
      setIsAdmin(userInfo?.role === "superadmin" || false);
    };
    
    // useEffect to log the updated value of isAdmin
    useEffect(() => {
      console.log("Updated isAdmin:", isAdmin);
    }, [isAdmin]); // Runs whenever isAdmin changes
    const getAuthConfig = () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,  // Ensure cookies are sent if needed
      };
    };
    
    //fetch all groups
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get("https://medibed.onrender.com/api/groups", {... getAuthConfig(), withCredentials:true});
        setGroups(data);
        
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userGroupIds = data
          ?.filter((group) => group?.members?.some((member) => member?._id === userInfo?._id))
          .map((group) => group?._id);
    
        setUserGroups(userGroupIds);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    
    //fetch users group
  
    //create groups
    const handleCreateGroup = async () => {
      try {
        await axios.post(
          "https://medibed.onrender.com/api/groups",
          { name: newGroupName, description: newGroupDescription },
          {...getAuthConfig(),
          withCredentials: true,}
        );
    
        toast({ title: "Group Created Successfully", status: "success", duration: 3000, isClosable: true });
        onClose();
        fetchGroups();
        setNewGroupName("");
        setNewGroupDescription("");
      } catch (error) {
        toast({
          title: "Error Creating Group",
          status: "error",
          duration: 3000,
          isClosable: true,
          description: error?.response?.data?.message || "An error occurred",
        });
      }
    };
    
    //logout
    const handleLogout=()=>{
      localStorage.removeItem("userInfo");
      navigate("/login");
    }
  
    //join group
    const handleJoinGroup = async (groupId) => {
      try {
        await axios.post(`https://medibed.onrender.com/api/groups/${groupId}/join`, {},{ ... getAuthConfig(), withCredentials:true});
        await fetchGroups();
        setSelectedGroup(groups.find((g) => g?._id === groupId));
    
        toast({ title: "Joined group Successfully", status: "success", duration: 3000, isClosable: true });
      } catch (error) {
        toast({
          title: "Error Joining Group",
          status: "error",
          duration: 3000,
          isClosable: true,
          description: error?.response?.data?.message || "An error occurred",
        });
      }
    };
    
    const handleLeaveGroup = async (groupId) => {
      try {
        await axios.post(`https://medibed.onrender.com/api/groups/${groupId}/leave`, {}, { ...getAuthConfig(),withCredentials:true});
        await fetchGroups();
        setSelectedGroup(null);
    
        toast({ title: "Left group Successfully", status: "success", duration: 3000, isClosable: true });
      } catch (error) {
        toast({
          title: "Error leaving Group",
          status: "error",
          duration: 3000,
          isClosable: true,
          description: error?.response?.data?.message || "An error occurred",
        });
      }
    };
    
    // Sample groups data
  
    return (
      <Box
        h="100%"
        bg="white"
        borderRight="1px"
        borderColor="gray.200"
        width="300px"
        display="flex"
        flexDirection="column"
      >
        <Flex
          p={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="white"
          position="sticky"
          top={0}
          zIndex={1}
          backdropFilter="blur(8px)"
          align="center"
          justify="space-between"
        >
          <Flex align="center">
            <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Groups
            </Text>
          </Flex>
          {isAdmin && (
            <Tooltip label="Create New Group" placement="right">
              <Button
                size="sm"
                colorScheme="blue"
                variant="ghost"
                onClick={onOpen}
                borderRadius="full"
              >
                <Icon as={FiPlus} fontSize="20px" />
              </Button>
            </Tooltip>
          )}
        </Flex>
  
        <Box flex="1" overflowY="auto" p={4} mb={16}>
          <VStack spacing={3} align="stretch">
            {groups.map((group) => (
              <Box
                key={group._id}
                p={4}
                cursor="pointer"
                borderRadius="lg"
                bg={userGroups.includes(group?._id)  ? "blue.50" : "gray.50"}
                borderWidth="1px"
                borderColor={userGroups.includes(group?._id) ? "blue.200" : "gray.200"}
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "md",
                  borderColor: "blue.300",
                }}
              >
                <Flex justify="space-between" align="center">
                  <Box onClick={()=>
                    userGroups.includes(group?._id) && setSelectedGroup(group)
                  } flex="1">
                    <Flex align="center" mb={2}>
                      <Text fontWeight="bold" color="gray.800">
                        {group.name}
                      </Text>
                      {userGroups.includes(group?._id)  && (
                        <Badge ml={2} colorScheme="blue" variant="subtle">
                          Joined
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {group.description}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme={userGroups?.includes(group?._id) ? "red" : "blue"}
                    variant={userGroups?.includes(group?._id)? "ghost" : "solid"}
                    ml={3}
                    onClick={()=>{userGroups?.includes(group?._id) ? handleLeaveGroup(group?._id) :handleJoinGroup(group?._id)}}
                    _hover={{
                      transform: group.isJoined ? "scale(1.05)" : "none",
                      bg: group.isJoined ? "red.50" : "blue.600",
                    }}
                    transition="all 0.2s"
                  >
                    {userGroups.includes(group?._id)  ? (
                      <Text fontSize="sm" fontWeight="medium">
                        Leave
                      </Text>
                    ) : (
                      "Join"
                    )}
                  </Button>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
  
        <Box
          p={4}
          borderTop="1px solid"
          borderColor="gray.200"
          bg="gray.50"
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          width="100%"
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            colorScheme="red"
            leftIcon={<Icon as={FiLogOut} />}
            _hover={{
              bg: "red.50",
              transform: "translateY(-2px)",
              shadow: "md",
            }}
            transition="all 0.2s"
          >
            Logout
          </Button>
        </Box>
  
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent>
            <ModalHeader>Create New Group</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Group Name</FormLabel>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  focusBorderColor="blue.400"
                />
              </FormControl>
  
              <FormControl mt={4}>
                <FormLabel>Description</FormLabel>
                <Input
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                  focusBorderColor="blue.400"
                />
              </FormControl>
  
              <Button
                colorScheme="blue"
                mr={3}
                mt={4}
                width="full"
                onClick={handleCreateGroup}
              >
                Create Group
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  };
  
  export default Sidebar;
  