const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./category.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the category database.");
});
db.run(
  `CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`
);
// Get all categories
const getAllCategories = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM category`, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

// Create a new category
const createCategory = (name) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO category (name) VALUES (?)`, [name], function (err) {
      if (err) {
        return reject(err);
      }
      resolve({
        id: this.lastID,
        name,
      });
    });
  });
};

// Update a category
const updateCategory = (id, name) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE category SET name = ? WHERE id = ?`,
      [name, id],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve({
          id,
          name,
        });
      }
    );
  });
};

// Delete a category
const deleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM category WHERE id = ?`, [id], function (err) {
      if (err) {
        return reject(err);
      }
      resolve({
        deletedID: id,
      });
    });
  });
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
