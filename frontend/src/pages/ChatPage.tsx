import { useState } from 'react';
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
} from '@chakra-ui/react';

const ChatPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState('');

  const handleLogout = () => {
    onOpen();
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
        <VStack p={5} spacing={5} align="stretch">
          <HStack justify="space-between" py={2}>
            <Heading size="lg" color="blue.600">CalaOne</Heading>
            <Button 
              colorScheme="red" 
              size="md" 
              onClick={handleLogout}
              fontSize="15px"
            >
              Logout
            </Button>
          </HStack>
          <Divider />
          <VStack align="stretch" spacing={3}>
            <Box 
              p={4} 
              bg="blue.50" 
              borderRadius="xl" 
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ bg: 'blue.100' }}
              boxShadow="sm"
            >
              <HStack>
                <Avatar size="md" name="John Doe" />
                <Box>
                  <Text fontWeight="bold" fontSize="16px">John Doe</Text>
                  <Text fontSize="14px" color="gray.600">Last message...</Text>
                </Box>
              </HStack>
            </Box>
          </VStack>
        </VStack>
      </Box>

      <Flex flex={1} direction="column" bg={bgColor}>
        <Box p={5} borderBottom="1px" borderColor={borderColor} boxShadow="sm">
          <HStack>
            <Text fontWeight="bold" fontSize="18px">John Doe</Text>
            <Text color="green.500" fontSize="14px">Online</Text>
          </HStack>
        </Box>

        <VStack flex={1} p={5} spacing={4} overflowY="auto" align="stretch">
          <Box 
            alignSelf="flex-start" 
            maxW="70%" 
            bg="gray.100" 
            p={4} 
            borderRadius="2xl"
            boxShadow="sm"
          >
            <Text fontSize="15px">Hey, how are you?</Text>
            <Text fontSize="12px" color="gray.500" mt={1}>10:30 AM</Text>
          </Box>
          <Box 
            alignSelf="flex-end" 
            maxW="70%" 
            bg="blue.500" 
            color="white" 
            p={4} 
            borderRadius="2xl"
            boxShadow="sm"
          >
            <Text fontSize="15px">I'm good! How about you?</Text>
            <Text fontSize="12px" opacity={0.8} mt={1}>10:31 AM</Text>
          </Box>
        </VStack>

        <HStack p={5} borderTop="1px" borderColor={borderColor} bg={bgColor} boxShadow="0 -2px 10px rgba(0,0,0,0.05)">
          <Input
            placeholder="Type a message..."
            size="lg"
            fontSize="15px"
            borderRadius="lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            colorScheme="blue" 
            size="lg"
            fontSize="15px"
            px={8}
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
