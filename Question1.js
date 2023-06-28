const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Add Customer API endpoint
app.post('/api/customers', (req, res) => {
  const { name, phoneNumber, email } = req.body;

  // Input validation
  if (!name || !phoneNumber || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for duplicates
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    connection.query(
      'SELECT * FROM customers WHERE phone_number = ?',
      [phoneNumber],
      (error, results) => {
        if (error) {
          console.error('Error executing database query:', error);
          connection.release();
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
          connection.release();
          return res.status(409).json({ error: 'Phone number already exists' });
        }

        // Insert the customer into the database
        connection.query(
          'INSERT INTO customers (name, phone_number, email) VALUES (?, ?, ?)',
          [name, phoneNumber, email],
          (insertError) => {
            connection.release();
            if (insertError) {
              console.error('Error inserting customer:', insertError);
              return res.status(500).json({ error: 'Internal server error' });
            }
            return res.status(201).json({ message: 'Customer added successfully' });
          }
        );
      }
    );
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app