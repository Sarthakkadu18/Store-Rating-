const express = require("express")
const { body, validationResult } = require("express-validator")
const pool = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const createStoreValidation = [
  body("name").notEmpty().withMessage("Store name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
]

// Get all stores
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = req.query
    const userId = req.user.id

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
      WHERE 1=1
    `
    const queryParams = [userId]
    let paramCount = 1

    // Add search filter
    if (search) {
      paramCount++
      query += ` AND (s.name ILIKE $${paramCount} OR s.address ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
    }

    query += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating`

    // Add sorting
    const validSortFields = ["name", "address", "average_rating", "created_at"]
    const sortField = validSortFields.includes(sortBy) ? sortBy : "name"
    const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC"

    if (sortField === "average_rating") {
      query += ` ORDER BY COALESCE(AVG(r.rating), 0) ${order}`
    } else {
      query += ` ORDER BY s.${sortField} ${order}`
    }

    // Add pagination
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    paramCount++
    query += ` LIMIT $${paramCount}`
    queryParams.push(Number.parseInt(limit))
    paramCount++
    query += ` OFFSET $${paramCount}`
    queryParams.push(offset)

    const result = await pool.query(query, queryParams)

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM stores WHERE 1=1"
    const countParams = []
    let countParamCount = 0

    if (search) {
      countParamCount++
      countQuery += ` AND (name ILIKE $${countParamCount} OR address ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalStores = Number.parseInt(countResult.rows[0].count)

    res.json({
      stores: result.rows.map((store) => ({
        ...store,
        average_rating: Number.parseFloat(store.average_rating) || 0,
        total_ratings: Number.parseInt(store.total_ratings) || 0,
        user_rating: store.user_rating ? Number.parseInt(store.user_rating) : null,
      })),
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalStores / Number.parseInt(limit)),
        totalStores,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Get stores error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get store by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
      WHERE s.id = $2
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating
    `

    const result = await pool.query(query, [userId, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" })
    }

    const store = result.rows[0]
    res.json({
      store: {
        ...store,
        average_rating: Number.parseFloat(store.average_rating) || 0,
        total_ratings: Number.parseInt(store.total_ratings) || 0,
        user_rating: store.user_rating ? Number.parseInt(store.user_rating) : null,
      },
    })
  } catch (error) {
    console.error("Get store error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Create new store (Admin only)
router.post("/", authenticateToken, requireRole(["system_administrator"]), createStoreValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, address, ownerId } = req.body

    // Check if store already exists
    const existingStore = await pool.query("SELECT id FROM stores WHERE email = $1", [email])

    if (existingStore.rows.length > 0) {
      return res.status(400).json({ message: "Store already exists with this email" })
    }

    // If ownerId is provided, verify the user exists and is a store owner
    if (ownerId) {
      const ownerResult = await pool.query("SELECT id, role FROM users WHERE id = $1", [ownerId])
      if (ownerResult.rows.length === 0) {
        return res.status(400).json({ message: "Owner not found" })
      }
      if (ownerResult.rows[0].role !== "store_owner") {
        return res.status(400).json({ message: "User must be a store owner" })
      }
    }

    // Create store
    const result = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id, created_at",
      [name, email, address, ownerId || null],
    )

    const store = result.rows[0]

    res.status(201).json({
      message: "Store created successfully",
      store,
    })
  } catch (error) {
    console.error("Create store error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
