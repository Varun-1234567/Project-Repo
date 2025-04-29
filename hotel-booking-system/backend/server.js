require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Varun123',
  database: process.env.DB_NAME || 'hotel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Guests (
        guest_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        id_proof VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Rooms (
        room_id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        room_category VARCHAR(20) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        max_occupancy INT NOT NULL,
        status ENUM('Available','Occupied','Maintenance') DEFAULT 'Available'
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Reservations (
        reservation_id INT AUTO_INCREMENT PRIMARY KEY,
        guest_id INT NOT NULL,
        room_id INT NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        adults INT NOT NULL DEFAULT 1,
        children INT DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('Confirmed','Cancelled','Checked-in','Checked-out') DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guest_id) REFERENCES Guests(guest_id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role ENUM('Admin','Staff') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert admin user if not exists
    await connection.query(`
      INSERT IGNORE INTO Users (username, password, role) 
      VALUES ('Varun', '12345', 'Admin')
    `);
    
    // Check if rooms exist, if not insert initial data
    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM Rooms');
    if (rows[0].count === 0) {
      await insertInitialRooms(connection);
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

async function insertInitialRooms(connection) {
  try {
    // Insert single rooms (15 regular, 5 premium)
    for (let i = 1; i <= 20; i++) {
      const category = i <= 15 ? 'Regular' : 'Premium';
      const price = i <= 15 ? 1500.00 : 2500.00;
      await connection.query(
        'INSERT INTO Rooms (room_number, room_type, room_category, price_per_night, max_occupancy) VALUES (?, ?, ?, ?, ?)',
        [`S${i}`, 'Single Room', category, price, 1]
      );
    }
    
    // Insert couple rooms (20 regular, 10 premium)
    for (let i = 1; i <= 30; i++) {
      const category = i <= 20 ? 'Regular' : 'Premium';
      const price = i <= 20 ? 2500.00 : 3500.00;
      await connection.query(
        'INSERT INTO Rooms (room_number, room_type, room_category, price_per_night, max_occupancy) VALUES (?, ?, ?, ?, ?)',
        [`D${i}`, 'Couple Room', category, price, 2]
      );
    }
    
    // Insert family rooms (35 regular, 15 premium)
    for (let i = 1; i <= 50; i++) {
      const category = i <= 35 ? 'Regular' : 'Premium';
      const price = i <= 35 ? 4000.00 : 6000.00;
      await connection.query(
        'INSERT INTO Rooms (room_number, room_type, room_category, price_per_night, max_occupancy) VALUES (?, ?, ?, ?, ?)',
        [`F${i}`, 'Family Room', category, price, 4]
      );
    }
    
    console.log('Initial rooms inserted successfully');
  } catch (error) {
    console.error('Error inserting initial rooms:', error);
    throw error;
  }
}

// API Routes

// Admin login
// Replace your admin login endpoint with:
app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', username); // Add logging
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
      }
  
      const [rows] = await pool.query(
        'SELECT * FROM Users WHERE username = ? AND password = ? AND role = "Admin"',
        [username, password]
      );
      
      console.log('Query results:', rows); // Add logging
      
      if (rows.length > 0) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error.message 
      });
    }
  });
// Guest registration
app.post('/api/guests', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, idProof } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Guests (first_name, last_name, email, phone, id_proof) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone, idProof]
    );
    
    res.json({ success: true, guestId: result.insertId });
  } catch (error) {
    console.error('Guest registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get available rooms by type
app.get('/api/rooms/available/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM Rooms WHERE room_type = ? AND status = "Available"',
      [type]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create reservation
app.post('/api/reservations', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { guestId, roomIds, checkInDate, checkOutDate, adults, children } = req.body;
    
    // Calculate number of nights
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    
    // Create reservations for each room
    for (const roomId of roomIds) {
      // Get room price
      const [room] = await connection.query(
        'SELECT price_per_night FROM Rooms WHERE room_id = ?',
        [roomId]
      );
      
      const totalAmount = room[0].price_per_night * nights;
      
      // Create reservation
      await connection.query(
        'INSERT INTO Reservations (guest_id, room_id, check_in_date, check_out_date, adults, children, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [guestId, roomId, checkInDate, checkOutDate, adults, children, totalAmount]
      );
      
      // Update room status
      await connection.query(
        'UPDATE Rooms SET status = "Occupied" WHERE room_id = ?',
        [roomId]
      );
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Reservation created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Create reservation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get all guests
app.get('/api/guests', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Guests ORDER BY last_name, first_name');
    res.json(rows);
  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Rooms ORDER BY room_number');
    res.json(rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all reservations
app.get('/api/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.reservation_id, g.first_name, g.last_name, rm.room_number, 
        r.check_in_date, r.check_out_date, r.status, r.total_amount 
      FROM Reservations r 
      JOIN Guests g ON r.guest_id = g.guest_id 
      JOIN Rooms rm ON r.room_id = rm.room_id 
      ORDER BY r.check_in_date
    `);
    res.json(rows);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [guests] = await pool.query('SELECT COUNT(*) AS count FROM Guests');
    const [availableRooms] = await pool.query('SELECT COUNT(*) AS count FROM Rooms WHERE status = "Available"');
    const [occupiedRooms] = await pool.query('SELECT COUNT(*) AS count FROM Rooms WHERE status = "Occupied"');
    const [activeReservations] = await pool.query(`
      SELECT COUNT(*) AS count FROM Reservations WHERE status IN ('Confirmed', 'Checked-in')
    `);
    
    res.json({
      totalGuests: guests[0].count,
      availableRooms: availableRooms[0].count,
      occupiedRooms: occupiedRooms[0].count,
      activeReservations: activeReservations[0].count
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});