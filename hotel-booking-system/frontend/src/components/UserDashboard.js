import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Button, Typography, Paper, Grid, Card, CardContent,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  TextField, InputAdornment, Select, MenuItem
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

function UserDashboard({ guestId, setCurrentGuestId }) {
  const [activeStep, setActiveStep] = useState(0);
  const [roomType, setRoomType] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    roomCategory: 'Regular'
  });
  const navigate = useNavigate();

  const handleRoomTypeSelect = (type) => {
    setRoomType(type);
    fetchAvailableRooms(type);
    setActiveStep(1);
  };

  const fetchAvailableRooms = async (type) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/available/${type}`);
      console.log('Available rooms response:', response.data); // Add this line
      setAvailableRooms(response.data);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      alert('Failed to load available rooms'); // Add user feedback
    }
  };

  const handleRoomSelection = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId) 
        : [...prev, roomId]
    );
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/reservations', {
        guestId,
        roomIds: selectedRooms,
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        adults: bookingDetails.adults,
        children: bookingDetails.children
      });

      if (response.data.success) {
        setActiveStep(2);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed');
    }
  };

  const handleBackToHome = () => {
    setCurrentGuestId(null);
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      {activeStep === 0 && (
        <Box>
          <Typography variant="h4" gutterBottom>Select Room Type</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }} 
                onClick={() => handleRoomTypeSelect('Single Seater')}
              >
                <CardContent>
                  <Typography variant="h6">Single Seater</Typography>
                  <Typography>For 1 person</Typography>
                  <Typography>Price: ₹1500 - ₹2500</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }} 
                onClick={() => handleRoomTypeSelect('Double Seater')}
              >
                <CardContent>
                  <Typography variant="h6">Double Seater</Typography>
                  <Typography>For 2 persons</Typography>
                  <Typography>Price: ₹2500 - ₹3500</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }} 
                onClick={() => handleRoomTypeSelect('Four Seater')}
              >
                <CardContent>
                  <Typography variant="h6">Four Seater</Typography>
                  <Typography>For 4 persons</Typography>
                  <Typography>Price: ₹4000 - ₹6000</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeStep === 1 && (
        <Box component="form" onSubmit={handleBookingSubmit}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => setActiveStep(0)}
            sx={{ mb: 2 }}
          >
            Back to Room Types
          </Button>

          <Typography variant="h4" gutterBottom>Book {roomType}</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Available Rooms</Typography>
                <Grid container spacing={2}>
                  {availableRooms.map((room) => (
                    <Grid item xs={6} sm={4} key={room.room_id}>
                      <Card 
                        variant={selectedRooms.includes(room.room_id) ? 'outlined' : 'elevation'}
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedRooms.includes(room.room_id) ? '2px solid blue' : '',
                          height: '100%'
                        }}
                        onClick={() => handleRoomSelection(room.room_id)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1">{room.room_number}</Typography>
                          <Typography variant="body2">{room.room_category}</Typography>
                          <Typography variant="body2">₹{room.price_per_night}/night</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Booking Details</Typography>
                
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Room Category</FormLabel>
                  <RadioGroup
                    row
                    value={bookingDetails.roomCategory}
                    onChange={(e) => setBookingDetails({...bookingDetails, roomCategory: e.target.value})}
                  >
                    <FormControlLabel value="Regular" control={<Radio />} label="Regular" />
                    <FormControlLabel value="Premium" control={<Radio />} label="Premium" />
                  </RadioGroup>
                </FormControl>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Check-In Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={bookingDetails.checkInDate}
                      onChange={(e) => setBookingDetails({...bookingDetails, checkInDate: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Check-Out Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={bookingDetails.checkOutDate}
                      onChange={(e) => setBookingDetails({...bookingDetails, checkOutDate: e.target.value})}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Adults"
                      type="number"
                      fullWidth
                      value={bookingDetails.adults}
                      onChange={(e) => setBookingDetails({...bookingDetails, adults: parseInt(e.target.value) || 0})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Children"
                      type="number"
                      fullWidth
                      value={bookingDetails.children}
                      onChange={(e) => setBookingDetails({...bookingDetails, children: parseInt(e.target.value) || 0})}
                    />
                  </Grid>
                </Grid>

                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  
                >
                  Book Selected Rooms ({selectedRooms.length})
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeStep === 2 && (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h4" gutterBottom>Booking Confirmed!</Typography>
          <Typography variant="body1" gutterBottom>
            Your booking has been successfully created.
          </Typography>
          <Typography variant="body1" gutterBottom>
            Rooms booked: {selectedRooms.length}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 3 }}
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default UserDashboard;