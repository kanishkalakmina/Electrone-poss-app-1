const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./category.db');

// Create a new category
const createCategory = (name) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO categories (name) VALUES (?)`, [name], function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ id: this.lastID, name });
        });
    });
};

// Get all categories
const getAllCategories = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM categories`, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

// Update a category
const updateCategory = (id, name) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE categories SET name = ? WHERE id = ?`, [name, id], function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ id, name });
        });
    });
};

// Delete a category
const deleteCategory = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM categories WHERE id = ?`, id, function(err) {
            if (err) {
                return reject(err);
            }
            resolve({ id });
        });
    });
};

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };
