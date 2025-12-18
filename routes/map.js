const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET city & state by pincode
router.get("/:pincode", async (req, res) => {
  const { pincode } = req.params;

  // Validate pincode
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid pincode"
    });
  }

  try {
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`
    );

    const result = response.data[0];

    if (result.Status !== "Success" || !result.PostOffice) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found"
      });
    }

    const postOffice = result.PostOffice[0];

    return res.json({
      success: true,
      pincode: pincode,
      city: postOffice.District,
      state: postOffice.State,
      country: postOffice.Country
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
