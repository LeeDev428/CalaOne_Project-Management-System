import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Heading,
  Avatar,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import io from 'socket.io-client';

const socketServerURL = 'http://localhost:5000'; // Make sure this matches your backend

const ChatPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState<{ senderId: string, receiverId?: string, content: string }[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get current user from localStorage (assuming it's stored as JSON string)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  // Normalize _id for currentUser if needed
  if (currentUser.id && !currentUser._id) {
    currentUser._id = currentUser.id;
  }

  // Create a proxy URL for API calls
  const createApiUrl = (endpoint: string) => {
    return `http://localhost:5000${endpoint}`;
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    setLoading(true);
    fetch(createApiUrl('/api/user/'))
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error('Failed to fetch users:', err);
      });
  }, []);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser || !currentUser._id) {
      setMessages([]);
      return;
    }
    console.log("Fetching messages between users:", 
      { currentUser: currentUser._id, selectedUser: selectedUser._id });
    fetch(createApiUrl(`/api/messages?user1=${currentUser._id}&user2=${selectedUser._id}`))
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Messages API response:", data);
        if (!Array.isArray(data)) {
          console.error("API didn't return an array:", data);
          return;
        }
        // Store messages exactly as they come from the API
        setMessages(data);
      })
      .catch(err => {
        console.error("Error fetching messages:", err);
      });
  }, [selectedUser, currentUser._id]);

  // Always up-to-date refs for socket event handlers
  const selectedUserRef = useRef(selectedUser);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
    currentUserRef.current = currentUser;
  }, [selectedUser, currentUser]);

  // Only initialize socket ONCE
  useEffect(() => {
    socketRef.current = io(socketServerURL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      if (currentUser && currentUser._id) {
        socketRef.current.emit('user_connected', currentUser._id);
      }
    });

    socketRef.current.on('online_users', (onlineUserIds: string[]) => {
      setOnlineUsers(onlineUserIds);
    });

    // Typing indicator: show if the OTHER user is typing to me in this convo
    socketRef.current.on('typing', ({ from, to }) => {
      if (
        selectedUserRef.current &&
        from === selectedUserRef.current._id &&
        to === currentUserRef.current._id
      ) {
        setIsTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 1500);
      }
    });

    socketRef.current.on('stop_typing', ({ from, to }) => {
      if (
        selectedUserRef.current &&
        from === selectedUserRef.current._id &&
        to === currentUserRef.current._id
      ) {
        setIsTyping(false);
      }
    });

    socketRef.current.on('receive_message', (msg) => {
      const senderId = String(msg.senderId);
      const receiverId = String(msg.receiverId);
      const currentId = String(currentUser._id);
      const selectedId = selectedUserRef.current ? String(selectedUserRef.current._id) : null;
      const isForCurrentConversation =
        selectedId &&
        ((senderId === selectedId && receiverId === currentId) ||
          (senderId === currentId && receiverId === selectedId));
      if (isForCurrentConversation) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    
    // Ensure we have valid IDs
    if (!currentUser._id || !selectedUser._id) {
      console.error("Missing user IDs:", { currentUser, selectedUser });
      return;
    }
    // Get the proper user ID (some APIs return id, others return _id)
    const currentUserId = currentUser._id || currentUser.id;
    console.log("Sending message:", {
      from: currentUserId,
      to: selectedUser._id,
      content: message.trim(),
    });
    const msgObj = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      content: message.trim(),
    };
    // Always use REST API to ensure consistency
    try {
      console.log("Sending message via REST API:", msgObj);
      const response = await fetch(createApiUrl('/api/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(msgObj),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status}, ${JSON.stringify(errorData)}`);
      }
      const sentMessage = await response.json();
      console.log("Message sent, API response:", sentMessage);
      // Socket handling will be for real-time updates from other clients
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send_message', sentMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. See console for details.");
    }
    setMessage('');
    if (socketRef.current && selectedUser) {
      socketRef.current.emit('stop_typing', { from: currentUser._id, to: selectedUser._id });
    }
  };

  // Add this to debug rendering
  console.log("Current state:", {
    selectedUser: selectedUser?._id,
    currentUser: currentUser._id,
    messageCount: messages.length,
    socketConnected: socketRef.current?.connected
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);

  // Typing indicator logic (emit only if user is typing to someone else)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (
      socketRef.current &&
      selectedUser &&
      currentUser._id &&
      e.target.value.trim() !== ""
    ) {
      socketRef.current.emit('typing', { from: currentUser._id, to: selectedUser._id });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { from: currentUser._id, to: selectedUser._id });
      }, 1000);
    } else if (
      socketRef.current &&
      selectedUser &&
      currentUser._id &&
      e.target.value.trim() === ""
    ) {
      socketRef.current.emit('stop_typing', { from: currentUser._id, to: selectedUser._id });
    }
  };

  // Clear typing indicator when switching users
  useEffect(() => {
    setIsTyping(false);
    if (
      socketRef.current &&
      selectedUser &&
      currentUser._id
    ) {
      socketRef.current.emit('stop_typing', { from: currentUser._id, to: selectedUser._id });
    }
    // eslint-disable-next-line
  }, [selectedUser]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Flex h="100vh" bg="gray.50">
      <Box 
        w="320px" 
        bg={bgColor} 
        borderRight="1px" 
        borderColor={borderColor}
        boxShadow="base"
      >
        <VStack p={5} spacing={3} align="stretch">
          <Heading size="lg" color="blue.600" mb={1}>CalaOne</Heading>
          <HStack spacing={2} mb={4}>
            <Avatar size="sm" name={currentUser.name} src={currentUser.profilePic} />
            <Text fontWeight="bold" fontSize="17px">{currentUser.name || "Me"}</Text>
          </HStack>
          <Divider />
          <VStack align="stretch" spacing={3}>
            {loading && <Text>Loading users...</Text>}
            {error && <Text color="red.500">Error: {error}</Text>}
            {!loading && !error && users.length === 0 && (
              <Text>No users found.</Text>
            )}
            {/* Display users */}
            {users
              .filter(user => user._id !== currentUser._id) // Don't show self
              .map(user => (
                <Box 
                  key={user._id}
                  p={4} 
                  bg={selectedUser && selectedUser._id === user._id ? "blue.100" : "blue.50"}
                  borderRadius="xl" 
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: 'blue.200' }}
                  boxShadow="sm"
                  onClick={() => setSelectedUser(user)}
                >
                  <HStack>
                    <Avatar
                      size="md"
                      name={user.name}
                      src={user.profilePic && user.profilePic !== 'default-avatar.png' ? user.profilePic : undefined}
                    />
                    <Box>
                      <Text fontWeight="bold" fontSize="16px">{user.name}</Text>
                      <Text fontSize="14px" color="gray.600">{user.email}</Text>
                      <Text fontSize="12px" color={onlineUsers.includes(user._id) ? "green.500" : "gray.400"}>
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
          </VStack>
        </VStack>
      </Box>
      <Flex flex={1} direction="column" bg={bgColor}>
        <HStack justify="space-between" p={5} borderBottom="1px" borderColor={borderColor} boxShadow="sm">
          {selectedUser ? (
            <HStack>
              <Avatar size="sm" name={selectedUser.name} src={selectedUser.profilePic} />
              <Text fontWeight="bold" fontSize="18px">{selectedUser.name}</Text>
              <Text fontSize="14px" color={onlineUsers.includes(selectedUser._id) ? "green.500" : "gray.400"}>
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </Text>
            </HStack>
          ) : (
            <Text fontWeight="bold" fontSize="18px" color="gray.500">
              Select a user to start a conversation
            </Text>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="ghost"
              size="lg"
            />
            <MenuList>
              <MenuItem color="red.500" onClick={onOpen}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <VStack flex={1} p={5} spacing={4} overflowY="auto" align="stretch">
          {selectedUser ? (
            messages.length === 0 ? (
              <Box alignSelf="center" color="gray.400" fontSize="lg" mt={10}>
                Start a conversation with <b>{selectedUser.name}</b>.
              </Box>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  // ...existing code for message rendering...
                  const isSender = String(msg.senderId) === String(currentUser._id || currentUser.id);
                  let displayTime = '';
                  let dateObj: Date;
                  if (msg.createdAt) {
                    dateObj = new Date(msg.createdAt);
                  } else {
                    dateObj = new Date();
                  }
                  displayTime = isNaN(dateObj.getTime())
                    ? ''
                    : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <Box
                      key={msg._id || idx}
                      alignSelf={isSender ? "flex-end" : "flex-start"}
                      bg={isSender ? "blue.400" : "gray.200"}
                      color={isSender ? "white" : "black"}
                      px={4}
                      py={2}
                      borderRadius="lg"
                      maxW="70%"
                      mb={2}
                    >
                      <Text>{msg.content}</Text>
                      <Text fontSize="xs" color={isSender ? "whiteAlpha.700" : "gray.500"} textAlign="right">
                        {displayTime}
                      </Text>
                    </Box>
                  );
                })}
                {/* Typing indicator */}
                {isTyping && (
                  <Box alignSelf="flex-start" color="gray.500" fontSize="sm" mt={-3}>
                    {selectedUser.name} is typing...
                  </Box>
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </>
            )
          ) : (
            <Box alignSelf="center" color="gray.400" fontSize="lg" mt={10}>
              No conversation selected.
            </Box>
          )}
        </VStack>
        <HStack p={5} borderTop="1px" borderColor={borderColor} bg={bgColor} boxShadow="0 -2px 10px rgba(0,0,0,0.05)">
          <Input
            placeholder={selectedUser ? "Type a message..." : "Select a user to start chatting..."}
            size="lg"
            fontSize="15px"
            borderRadius="lg"
            value={message}
            onChange={handleInputChange}
            isDisabled={!selectedUser}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <Button 
            colorScheme="blue" 
            size="lg"
            fontSize="15px"
            px={8}
            isDisabled={!selectedUser || !message.trim()}
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </HStack> 
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent p={2}>
          <ModalHeader fontSize="18px">Confirm Logout</ModalHeader>
          <ModalBody fontSize="16px">
            Are you sure you want to logout?
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="red" 
              mr={3}
              onClick={confirmLogout}
              fontSize="15px"
            >
              Yes, Logout
            </Button>
            <Button variant="ghost" onClick={onClose} fontSize="15px">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatPage;
