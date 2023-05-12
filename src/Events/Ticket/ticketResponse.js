const { ChannelType, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const ticketSchema = require("../../Models/Ticket");
const { ticketParent, everyone } = require("../../Utils/config");

module.exports = {
    name: "interactionCreate",

    async execute(interaction) {
        const { guild, member, customId, channel } = interaction;
        const { ViewChannel, SendMessages, ManageChannels, ReadMessageHistory } = PermissionFlagsBits;
        const ticketId = Math.floor(Math.random() * 9000) + 10000;

        if (!interaction.isButton()) return;

        if (!["member", "bug", "coding", "other"].includes(customId)) return;

        if (!guild.members.me.permissions.has(ManageChannels))
            interaction.reply({
                content: "I don't have permission for this.",
                ephemeral: true
            });

        try {
            await guild.channels.create({
                name: `${member.user.username}-ticket${ticketId}`,
                type: ChannelType.GuildText,
                parent: ticketParent,
                permissionOverwrites: [
                    {
                        id: everyone,
                        deny: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                    {
                        id: member.id,
                        allow: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                ],
            }).then(async (response) => {
                const newTicketSchema = await ticketSchema.create({
                    GuildID: guild.id,
                    MemberID: member.id,
                    TicketID: ticketId,
                    ChannelID: channel.id,
                    Closed: false,
                    Locked: false,
                    Type: customId,
                });

                const embed = new EmbedBuilder()
                    .setTitle(`${guild.name} - Ticket: ${customId}`)
                    .setDescription("Our team will contact you shortly. Please describe your issue.")
                    .setFooter({
                        text: `${ticketId}`,
                        iconURL: member.displayAvatarURL({
                            dynamic: true
                        })
                    })
                    .setTimestamp();

                const button = new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId('close').setLabel('Close ticket').setStyle(ButtonStyle.Primary).setEmoji('❌'),
                    new ButtonBuilder().setCustomId('lock').setLabel('Lock the ticket').setStyle(ButtonStyle.Secondary).setEmoji('🔐'),
                    new ButtonBuilder().setCustomId('unlock').setLabel('Unlock the ticket').setStyle(ButtonStyle.Success).setEmoji('🔓'),
                );

                channel.send({
                    embed: ([embed]),
                    components: [
                        button
                    ]
                });

                interaction.reply({
                    content: "Successfully created a ticket",
                    ephemeral: true
                });
            });
        } catch (err) {
            return console.log(err);
        };
    },
};