import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  Tabs, Tab, Paper
} from '@mui/material';

function LoginPage({ setIsAdminAuthenticated, setCurrentGuestId }) {
  const [activeTab, setActiveTab] = useState(0);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idProof: ''
  });
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    console.log('Attempting login with:', adminCredentials); // Add this line
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', adminCredentials);
      console.log('Login response:', response); // Add this line
      if (response.data.success) {
        setIsAdminAuthenticated(true);
        navigate('/admin');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error details:', error.response); // Modified this line
      alert(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  };
  const handleGuestRegistration = async (e) => {
    e.preventDefault();
    if (!guestDetails.firstName || !guestDetails.lastName) {
      alert('First and last name are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/guests', guestDetails);
      if (response.data.success) {
        setCurrentGuestId(response.data.guestId);
        navigate('/user');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
            <Tab label="Admin Login" />
            <Tab label="User Booking" />
          </Tabs>
          
          {activeTab === 0 ? (
            <Box component="form" onSubmit={handleAdminLogin} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Admin Login</Typography>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleGuestRegistration} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Guest Registration</Typography>
              <TextField
                label="First Name"
                fullWidth
                margin="normal"
                required
                value={guestDetails.firstName}
                onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
              />
              <TextField
                label="Last Name"
                fullWidth
                margin="normal"
                required
                value={guestDetails.lastName}
                onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
              />
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                type="email"
                value={guestDetails.email}
                onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
              />
              <TextField
                label="Phone"
                fullWidth
                margin="normal"
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
              />
              <TextField
                label="ID Proof"
                fullWidth
                margin="normal"
                value={guestDetails.idProof}
                onChange={(e) => setGuestDetails({...guestDetails, idProof: e.target.value})}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Register
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;