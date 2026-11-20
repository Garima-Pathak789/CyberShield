const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Scan = require("./models/Scan");
const detectScam = require("./utils/detectScam");
const detectURL = require("./utils/detectURL");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((error) => console.log("MongoDB Error:", error.message));


// Home Route
app.get("/", (req, res) => {
  res.send("CyberShield Backend is Running!");
});


// Health Route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CyberShield API is working successfully!",
    status: "Active"
  });
});


// Scan API
app.post("/api/scan", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message to scan."
      });
    }

    const result = detectScam(message);

    const newScan = await Scan.create({
      message,
      ...result
    });

    res.status(201).json({
      success: true,
      message: "Scan completed successfully!",
      scan: newScan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Scan failed.",
      error: error.message
    });
  }
});

// URL Scanner API
app.post("/api/scan-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid URL."
      });
    }

    const result = detectURL(url.trim());

    const newScan = await Scan.create({
      url: url.trim(),
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      warnings: result.warnings,
      recommendation: result.recommendation
    });

    res.status(201).json({
      success: true,
      message: "URL analysis completed and saved!",
      result,
      scan: newScan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "URL analysis failed.",
      error: error.message
    });
  }
});

// Get Scan History API
app.get("/api/scans", async (req, res) => {
  try {
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: scans.length,
      scans
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch scan history.",
      error: error.message
    });
  }
});
// Dashboard Statistics API
app.get("/api/statistics", async (req, res) => {
  try {
    const totalScans = await Scan.countDocuments();
    const messageScans = await Scan.countDocuments({
  message: { $ne: "" }
});
const urlScans = await Scan.countDocuments({
  url: { $ne: "" }
});

    const highRisk = await Scan.countDocuments({
      riskLevel: "High"
    });

    const mediumRisk = await Scan.countDocuments({
      riskLevel: "Medium"
    });

    const lowRisk = await Scan.countDocuments({
      riskLevel: "Low"
    });

    const invalidScans = await Scan.countDocuments({
      riskLevel: "Invalid"
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalScans,
        messageScans,
        urlScans,
        highRisk,
        mediumRisk,
        lowRisk,
        invalidScans
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics."
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CyberShield server running on port ${PORT}`);
});