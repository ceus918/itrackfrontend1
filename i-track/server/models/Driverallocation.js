const mongoose = require('mongoose');

const DriverallocationSchema = new mongoose.Schema({
  unitName: String,
  unitId: String,
  bodyColor: String,
  variation: String,
  assignedDriver: String,
  status: String,
  date: Date,
  allocatedBy: String // New field for tracking who allocated
});

const DriverallocationModel = mongoose.model("driverallocation", DriverallocationSchema);
module.exports = DriverallocationModel;
