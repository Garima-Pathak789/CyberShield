const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
   message: {
  type: String,
  default: ""
},
url: {
  type: String,
  default: ""
},

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Invalid"],
      required: true
    },

    warnings: {
      type: [String],
      default: []
    },

    recommendation: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);