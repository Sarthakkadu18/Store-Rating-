const express = require("express")
const { body, validationResult } = require("express-validator")
const pool = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const ratingValidation = [body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")]

// Submit or update rating for a store
router.post("/stores/:storeId", authenticateToken, requireRole(["normal_user"]), ratingValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { storeId } = req.params
    const { rating } = req.body
    const userId = req.user.id

    // Check if store exists
    const storeResult = await pool.query("SELECT id FROM stores WHERE id = $1", [storeId])
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" })
    }

    // Check if user has already rated this store
    const existingRating = await pool.query("SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2", [
      userId,
      storeId,
    ])

    let result
    let message

    if (existingRating.rows.length > 0) {
      // Update existing rating
      result = await pool.query(
        "UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3 RETURNING *",
        [rating, userId, storeId],
      )
      message = "Rating updated successfully"
    } else {
      // Create new rating
      result = await pool.query("INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *", [
        userId,
        storeId,
        rating,
      ])
      message = "Rating submitted successfully"
    }

    res.json({
      message,
      rating: result.rows[0],
    })
  } catch (error) {
    console.error("Submit rating error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get ratings for a store (Store Owner only)
router.get("/stores/:storeId", authenticateToken, requireRole(["store_owner"]), async (req, res) => {
  try {
    const { storeId } = req.params
    const userId = req.user.id

    // Verify that the user owns this store
    const storeResult = await pool.query("SELECT id FROM stores WHERE id = $1 AND owner_id = $2", [storeId, userId])
    if (storeResult.rows.length === 0) {
      return res.status(403).json({ message: "You can only view ratings for your own store" })
    }

    const query = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `

    const result = await pool.query(query, [storeId])

    // Get average rating
    const avgResult = await pool.query("SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = $1", [
      storeId,
    ])

    res.json({
      ratings: result.rows,
      averageRating: Number.parseFloat(avgResult.rows[0].average_rating) || 0,
      totalRatings: result.rows.length,
    })
  } catch (error) {
    console.error("Get store ratings error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Delete rating (Normal User only - their own rating)
router.delete("/stores/:storeId", authenticateToken, requireRole(["normal_user"]), async (req, res) => {
  try {
    const { storeId } = req.params
    const userId = req.user.id

    const result = await pool.query("DELETE FROM ratings WHERE user_id = $1 AND store_id = $2 RETURNING *", [
      userId,
      storeId,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" })
    }

    res.json({ message: "Rating deleted successfully" })
  } catch (error) {
    console.error("Delete rating error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
