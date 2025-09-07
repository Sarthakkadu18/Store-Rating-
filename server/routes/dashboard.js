const express = require("express")
const pool = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()

// Admin dashboard stats
router.get("/admin", authenticateToken, requireRole(["system_administrator"]), async (req, res) => {
  try {
    // Get total counts
    const usersResult = await pool.query("SELECT COUNT(*) as total FROM users")
    const storesResult = await pool.query("SELECT COUNT(*) as total FROM stores")
    const ratingsResult = await pool.query("SELECT COUNT(*) as total FROM ratings")

    // Get user role distribution
    const roleDistribution = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY count DESC
    `)

    // Get recent activity (last 30 days)
    const recentUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `)

    const recentRatings = await pool.query(`
      SELECT COUNT(*) as count 
      FROM ratings 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `)

    // Get top rated stores
    const topStores = await pool.query(`
      SELECT s.name, s.address, AVG(r.rating) as average_rating, COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name, s.address
      HAVING COUNT(r.id) > 0
      ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
      LIMIT 5
    `)

    // Get rating distribution
    const ratingDistribution = await pool.query(`
      SELECT rating, COUNT(*) as count
      FROM ratings
      GROUP BY rating
      ORDER BY rating
    `)

    res.json({
      totalUsers: Number.parseInt(usersResult.rows[0].total),
      totalStores: Number.parseInt(storesResult.rows[0].total),
      totalRatings: Number.parseInt(ratingsResult.rows[0].total),
      roleDistribution: roleDistribution.rows,
      recentActivity: {
        newUsers: Number.parseInt(recentUsers.rows[0].count),
        newRatings: Number.parseInt(recentRatings.rows[0].count),
      },
      topStores: topStores.rows.map((store) => ({
        ...store,
        average_rating: Number.parseFloat(store.average_rating),
        total_ratings: Number.parseInt(store.total_ratings),
      })),
      ratingDistribution: ratingDistribution.rows.map((item) => ({
        rating: Number.parseInt(item.rating),
        count: Number.parseInt(item.count),
      })),
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Store owner dashboard stats
router.get("/store-owner", authenticateToken, requireRole(["store_owner"]), async (req, res) => {
  try {
    const userId = req.user.id

    // Get store owned by this user
    const storeResult = await pool.query("SELECT id, name FROM stores WHERE owner_id = $1", [userId])

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: "No store found for this owner" })
    }

    const store = storeResult.rows[0]
    const storeId = store.id

    // Get store ratings stats
    const ratingsStats = await pool.query(
      `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_ratings,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_ratings
      FROM ratings 
      WHERE store_id = $1
    `,
      [storeId],
    )

    // Get rating distribution for this store
    const ratingDistribution = await pool.query(
      `
      SELECT rating, COUNT(*) as count
      FROM ratings
      WHERE store_id = $1
      GROUP BY rating
      ORDER BY rating
    `,
      [storeId],
    )

    // Get recent ratings with user details
    const recentRatings = await pool.query(
      `
      SELECT r.rating, r.created_at, u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `,
      [storeId],
    )

    // Get monthly rating trends (last 6 months)
    const monthlyTrends = await pool.query(
      `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        AVG(rating) as average_rating,
        COUNT(*) as total_ratings
      FROM ratings
      WHERE store_id = $1 
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `,
      [storeId],
    )

    const stats = ratingsStats.rows[0]

    res.json({
      store: {
        id: store.id,
        name: store.name,
      },
      averageRating: Number.parseFloat(stats.average_rating) || 0,
      totalRatings: Number.parseInt(stats.total_ratings) || 0,
      recentRatings: Number.parseInt(stats.recent_ratings) || 0,
      ratingDistribution: ratingDistribution.rows.map((item) => ({
        rating: Number.parseInt(item.rating),
        count: Number.parseInt(item.count),
      })),
      recentRatingsList: recentRatings.rows,
      monthlyTrends: monthlyTrends.rows.map((item) => ({
        month: item.month,
        average_rating: Number.parseFloat(item.average_rating),
        total_ratings: Number.parseInt(item.total_ratings),
      })),
    })
  } catch (error) {
    console.error("Store owner dashboard error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
