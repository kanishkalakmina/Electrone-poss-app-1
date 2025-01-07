const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./categoryApi");

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Create a new category
router.post("/categories", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      error: "Category name is required",
    });
  }

  try {
    const newCategory = await createCategory(name);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Update a category
router.put("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Category name is required",
    });
  }

  try {
    const updatedCategory = await updateCategory(id, name);
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Delete a category
router.delete("/categories/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await deleteCategory(id);
    res.json(deletedCategory);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
