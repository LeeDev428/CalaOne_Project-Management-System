import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  Input,
  Stack,
  Text,
  Heading,
  Link,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';

const register = async (formData: { name: string; email: string; password: string }) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register(formData);
      localStorage.setItem('token', response.token);
      navigate('/chat');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Registration failed',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="gray.50"
    >
      <Box 
        w="100%" 
        maxW="450px" 
        p={8} 
        mx={4}
        borderRadius="xl" 
        boxShadow="lg" 
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
      >
        <Stack spacing={6}>
          <Heading textAlign="center" size="lg" color="blue.600">
            Create Account
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={5}>
              <FormControl>
                <Input
                  placeholder="Name"
                  size="lg"
                  fontSize="16px"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormControl>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  size="lg"
                  fontSize="16px"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </FormControl>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  size="lg"
                  fontSize="16px"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="16px"
                isLoading={loading}
                w="100%"
                boxShadow="sm"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                Register
              </Button>
            </Stack>
          </form>
          <Text textAlign="center" fontSize="16px">
            Already have an account?{' '}
            <Link 
              as={RouterLink} 
              to="/login" 
              color="blue.500"
              fontWeight="semibold"
              _hover={{ textDecoration: 'none', color: 'blue.600' }}
            >
              Login
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default RegisterPage;
