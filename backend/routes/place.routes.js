const express = require("express");
const router = express.Router();
const connection = require("../config/db");

// Endpoint untuk ambil semua tempat
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

// Endpoint untuk ambil detail tempat by ID
router.get("/places/:id", (req, res) => {
  const { id } = req.params;
  const placeQuery = "SELECT * FROM places WHERE id = ?";
  const imagesQuery = "SELECT * FROM place_images WHERE place_id = ?";

  connection.query(placeQuery, [id], (err, placeResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ 
        status: "error", 
        message: "Database error" 
      });
    }

    if (placeResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Place not found",
      });
    }

    // Ambil images
    connection.query(imagesQuery, [id], (err, imageResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ 
          status: "error", 
          message: "Database error" 
        });
      }

      const place = placeResults[0];
      place.images = imageResults; // tambahkan array images ke place

      res.json({
        status: "success",
        data: place,
      });
    });
  });
});

module.exports = router;
