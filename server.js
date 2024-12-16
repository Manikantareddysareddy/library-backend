const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./library.db');

// Middleware to parse JSON request body
app.use(bodyParser.json());
app.use(cors());

// Create books table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      BookID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Author TEXT NOT NULL,
      Genre TEXT,
      Pages INTEGER,
      PublishedDate TEXT
    );
  `);
});

// GET /books - Fetch all books
app.get('/books', (req, res) => {
  const query = 'SELECT * FROM books';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /books - Add a new book
app.post('/books', (req, res) => {
  const { Title, Author, Genre, Pages, PublishedDate } = req.body;

  if (!Title || !Author || !Genre || !Pages || !PublishedDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `INSERT INTO books (Title, Author, Genre, Pages, PublishedDate) VALUES (?, ?, ?, ?, ?)`;
  const params = [Title, Author, Genre, Pages, PublishedDate];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ BookID: this.lastID, message: 'Book added successfully' });
  });
});


// PUT /books/:id - Update an existing book
app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const { Title, Author, Genre, Pages, PublishedDate } = req.body;

  const query = `UPDATE books SET Title = ?, Author = ?, Genre = ?, Pages = ?, PublishedDate = ? WHERE BookID = ?`;
  const params = [Title, Author, Genre, Pages, PublishedDate, id];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book updated successfully' });
  });
});

// DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM books WHERE BookID = ?`;
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
