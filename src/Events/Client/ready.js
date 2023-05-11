const { Client, ModalBuilder } = require("discord.js");
const mongoose = require("mongoose");
const config = require("../../Utils/config")

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    await mongoose.connect(config.mongodb || "", {
      keepAlive: true,
    });

    if (mongoose.connect) {
      console.log("MongoDB connection successful.");
    }

    console.log(`Logged in as ${client.user.username} is now online.`);
  },
};
