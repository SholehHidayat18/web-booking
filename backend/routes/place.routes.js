const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/places", (req, res) => {
  const query = "SELECT * FROM places";

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ 
        status: "error", 
        message: "Database error" 
      });
    }

    res.json({
      status: "success",
      data: results,
    });
  });
});

module.exports = router;