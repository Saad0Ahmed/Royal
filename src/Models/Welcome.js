const { model, Schema } = require("mongoose");

const welcomeSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    roleId: {
        type: String,
        required: false,
    },
});

module.exports = model("welcome", welcomeSchema);
