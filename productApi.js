const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

const db = new sqlite3.Database('./products.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the products database.');
});

// Set up Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/uploads/'); // Folder where images will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // File naming convention
    }
});
const upload = multer({ storage: storage });

// Create products table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, stock TEXT, category TEXT, image BLOB)`);

// POST route for uploading products with an image
router.post('/products', upload.single('image'), (req, res) => {
    const { name, price, stock, category } = req.body;
    const imagePath = req.file ? req.file.path : null; // Get the file path if an image was uploaded

    const sql = `INSERT INTO products (name, price, stock, category, image) VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [name, price, stock, category, imagePath], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// API endpoint to get all products
router.get('/products', (req, res) => {
    const sql = `SELECT * FROM products`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API endpoint to update a product
router.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, stock, category, image } = req.body;
    const sql = `UPDATE products SET name = ?, price = ?, stock = ?, category = ?, image = ? WHERE id = ?`;
    db.run(sql, [name, price, stock, category, image, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ updatedID: id });
    });
});

// API endpoint to delete a product
router.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM products WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedID: id });
    });
});

module.exports = router;
