const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  unitName: { type: String },
  unitId: { type: String },
  bodyColor: { type: String },
  variation: { type: String },
  quantity: { type: Number, default: 1 }
}, {
  timestamps: true // ✅ This ensures createdAt & updatedAt are auto-added
});


const InventoryModel = mongoose.model("Inventory", InventorySchema);
module.exports = InventoryModel;
