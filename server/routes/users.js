const express = require("express")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const pool = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const createUserValidation = [
  body("name").isLength({ min: 20, max: 60 }).withMessage("Name must be between 20 and 60 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage("Password must be 8-16 characters with at least one uppercase letter and one special character"),
  body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
  body("role").isIn(["system_administrator", "normal_user", "store_owner"]).withMessage("Invalid role"),
]

// Get all users (Admin only)
router.get("/", authenticateToken, requireRole(["system_administrator"]), async (req, res) => {
  try {
    const { search, role, sortBy = "name", sortOrder = "asc", page = 1, limit = 10 } = req.query

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE WHEN u.role = 'store_owner' THEN COALESCE(AVG(r.rating), 0) ELSE NULL END as rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `
    const queryParams = []
    let paramCount = 0

    // Add search filter
    if (search) {
      paramCount++
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.address ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
    }

    // Add role filter
    if (role) {
      paramCount++
      query += ` AND u.role = $${paramCount}`
      queryParams.push(role)
    }

    query += ` GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at`

    // Add sorting
    const validSortFields = ["name", "email", "role", "created_at"]
    const sortField = validSortFields.includes(sortBy) ? sortBy : "name"
    const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC"
    query += ` ORDER BY u.${sortField} ${order}`

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
    let countQuery = "SELECT COUNT(*) FROM users WHERE 1=1"
    const countParams = []
    let countParamCount = 0

    if (search) {
      countParamCount++
      countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount} OR address ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    if (role) {
      countParamCount++
      countQuery += ` AND role = $${countParamCount}`
      countParams.push(role)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalUsers = Number.parseInt(countResult.rows[0].count)

    res.json({
      users: result.rows,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalUsers / Number.parseInt(limit)),
        totalUsers,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get user by ID (Admin only)
router.get("/:id", authenticateToken, requireRole(["system_administrator"]), async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE WHEN u.role = 'store_owner' THEN COALESCE(AVG(r.rating), 0) ELSE NULL END as rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Create new user (Admin only)
router.post("/", authenticateToken, requireRole(["system_administrator"]), createUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, address, role } = req.body

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at",
      [name, email, passwordHash, address, role],
    )

    const user = result.rows[0]

    res.status(201).json({
      message: "User created successfully",
      user,
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
