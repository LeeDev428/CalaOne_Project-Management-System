import { useState, useEffect } from 'react';
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

const ChatPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Get current user from localStorage (assuming it's stored as JSON string)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/user/')
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
              <Text color="green.500" fontSize="14px">Online</Text>
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
            <Box alignSelf="center" color="gray.400" fontSize="lg" mt={10}>
              {/* Placeholder for conversation with selectedUser */}
              Start a conversation with <b>{selectedUser.name}</b>.
            </Box>
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
            onChange={(e) => setMessage(e.target.value)}
            isDisabled={!selectedUser}
          />
          <Button 
            colorScheme="blue" 
            size="lg"
            fontSize="15px"
            px={8}
            isDisabled={!selectedUser}
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
