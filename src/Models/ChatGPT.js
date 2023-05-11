const { model, Schema } = require("mongoose");

const chatGPTSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
});

module.exports = model("chatgpt", chatGPTSchema);
