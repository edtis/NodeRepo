const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema({
  admin: {
    broadcastAlerts: Object,
    websiteAlerts: Object
  }
});

module.exports = mongoose.model("Admin", AdminSchema);
