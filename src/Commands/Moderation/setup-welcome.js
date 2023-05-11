const {
    Message,
    Client,
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-welcome")
        .setDescription("Set up your welcome message for the discord bot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("channel for welcome messages.")
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName("welcome-role")
                .setDescription("Enter your welcome role.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const { options } = interaction;

        const welcomeChannel = options.getChannel("channel");
        const role = options.getRole("welcome-role");

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

        const exists = await welcomeSchema.findOne({
            guildId: interaction.guild.id,
        });
        if (!exists) {
            const welcome = new welcomeSchema({
                guildId: interaction.guild.id,
                channelId: welcomeChannel.id,
                roleId: role.id,
            });
            await welcome.save();
            interaction.reply({
                content: "Successfully created a welcome message",
                ephemeral: true,
            });
        } else {
            interaction.reply({
                content: "Welcome message is already setup.",
                ephemeral: true,
            });
        }
    },
};
