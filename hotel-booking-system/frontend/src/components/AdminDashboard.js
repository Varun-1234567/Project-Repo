import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Tabs, Tab, Card, CardContent,
  Grid
} from '@mui/material';
import { Logout } from '@mui/icons-material';

function AdminDashboard({ setIsAdminAuthenticated }) {
  const [activeTab, setActiveTab] = useState(0);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 0) {
      fetchDashboardStats();
    } else if (activeTab === 1) {
      fetchGuests();
    } else if (activeTab === 2) {
      fetchRooms();
    } else if (activeTab === 3) {
      fetchReservations();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/guests');
      setGuests(response.data);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" />
        <Tab label="Guests" />
        <Tab label="Rooms" />
        <Tab label="Reservations" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Guests</Typography>
                <Typography variant="h4">{stats.totalGuests || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Available Rooms</Typography>
                <Typography variant="h4">{stats.availableRooms || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Occupied Rooms</Typography>
                <Typography variant="h4">{stats.occupiedRooms || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Active Reservations</Typography>
                <Typography variant="h4">{stats.activeReservations || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>ID Proof</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.guest_id}>
                  <TableCell>{guest.guest_id}</TableCell>
                  <TableCell>{guest.first_name}</TableCell>
                  <TableCell>{guest.last_name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>{guest.id_proof}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Room No</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.room_id}>
                  <TableCell>{room.room_id}</TableCell>
                  <TableCell>{room.room_number}</TableCell>
                  <TableCell>{room.room_type}</TableCell>
                  <TableCell>{room.room_category}</TableCell>
                  <TableCell>₹{room.price_per_night}</TableCell>
                  <TableCell>
                    <Box 
                      sx={{
                        display: 'inline-block',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: 
                          room.status === 'Occupied' ? 'lightgreen' :
                          room.status === 'Maintenance' ? 'orange' : 'white',
                        color: 'black'
                      }}
                    >
                      {room.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-In</TableCell>
                <TableCell>Check-Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.reservation_id}>
                  <TableCell>{reservation.reservation_id}</TableCell>
                  <TableCell>{reservation.first_name} {reservation.last_name}</TableCell>
                  <TableCell>{reservation.room_number}</TableCell>
                  <TableCell>{new Date(reservation.check_in_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(reservation.check_out_date).toLocaleDateString()}</TableCell>
                  <TableCell>{reservation.status}</TableCell>
                  <TableCell>₹{reservation.total_amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AdminDashboard;