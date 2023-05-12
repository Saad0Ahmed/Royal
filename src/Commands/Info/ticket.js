const { Client, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { openticket } = require("../../Utils/config")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Create a ticket message.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const { guild } = interaction;

        const embed = new EmbedBuilder()
            .setDescription("Open a ticket in the discord server.")

        const button = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId('member').setLabel('Report member').setStyle(ButtonStyle.Danger).setEmoji('⚙️'),
            new ButtonBuilder().setCustomId('bug').setLabel('Report bug').setStyle(ButtonStyle.Secondary).setEmoji('🪲'),
            new ButtonBuilder().setCustomId('coding').setLabel('Code support').setStyle(ButtonStyle.Primary).setEmoji('🗒️'),
            new ButtonBuilder().setCustomId('other').setLabel('Other support').setStyle(ButtonStyle.Success).setEmoji('🎫'),
        );

        const channel = await guild.channels.fetch(openticket);
        if (!channel || channel.type !== 0) return
        await channel.send({
            embeds: [embed],
            components: [button]
        });

        interaction.reply({
            content: "Ticket message has been sent.",
            ephemeral: true
        });
    },
};