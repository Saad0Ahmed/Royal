const {
    Message,
    Client,
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const chatGPTSchema = require("../../Models/ChatGPT");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-chatgpt")
        .setDescription("Set up your chatgpt channel for your server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("channel for chatgpt.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const { options } = interaction;

        const ChatGPTChannel = options.getChannel("channel");

        if (
            !interaction.guild.members.me.permissions.has(
                PermissionFlagsBits.SendMessages
            )
        ) {
            interaction.reply({
                content: "I don't have permission for this.",
                ephemeral: true,
            });
        }

        const exists = await chatGPTSchema.findOne({
            guildId: interaction.guild.id,
        });
        if (!exists) {
            const ChatGPT = new chatGPTSchema({
                guildId: interaction.guild.id,
                channelId: ChatGPTChannel.id,
            });
            await ChatGPT.save();
            interaction.reply({
                content: "Successfully created a chatgpt channel.",
                ephemeral: true,
            });
        } else {
            interaction.reply({
                content: "chatgpt channel is already setup.",
                ephemeral: true,
            });
        }
    },
};
