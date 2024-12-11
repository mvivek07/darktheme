const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Database Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',     // Replace with your MySQL Workbench username
    password: 'Vil100sr', // Replace with your MySQL Workbench password
    database: 'servicehub'
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database successfully');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Customer Registration Route
app.post('/api/customer-register', (req, res) => {
    const { name, email, password, phone } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Password hashing failed' });
        }

        const query = 'INSERT INTO customers (name, email, password, phone) VALUES (?, ?, ?, ?)';
        connection.query(query, [name, email, hashedPassword, phone], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Registration failed', details: error });
            }
            res.status(201).json({ message: 'Customer registered successfully', customerId: results.insertId });
        });
    });
});

// Service Provider Registration Route
app.post('/api/provider-register', (req, res) => {
    const { name, email, password, serviceType, phone } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Password hashing failed' });
        }

        const query = 'INSERT INTO service_providers (name, email, password, service_type, phone) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [name, email, hashedPassword, serviceType, phone], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Registration failed', details: error });
            }
            res.status(201).json({ message: 'Service Provider registered successfully', providerId: results.insertId });
        });
    });
});

// Customer Login Route
app.post('/api/customer-login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM customers WHERE email = ?';
    connection.query(query, [email], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Login failed' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = results[0];
        
        // Compare passwords
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                res.json({ 
                    message: 'Login successful', 
                    customerId: user.id,
                    name: user.name 
                });
            } else {
                res.status(400).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Service Provider Login Route
app.post('/api/provider-login', (req, res) => {
    const { email, password, serviceType } = req.body;

    const query = 'SELECT * FROM service_providers WHERE email = ? AND service_type = ?';
    connection.query(query, [email, serviceType], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Login failed' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Provider not found' });
        }

        const provider = results[0];
        
        // Compare passwords
        bcrypt.compare(password, provider.password, (err, result) => {
            if (result) {
                res.json({ 
                    message: 'Login successful', 
                    providerId: provider.id,
                    name: provider.name 
                });
            } else {
                res.status(400).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});