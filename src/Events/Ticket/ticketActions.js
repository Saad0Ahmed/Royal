const { ButtonInteraction, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const { transcripts } = require("../../Utils/config");
const ticketSchema = require("../../Models/Ticket");

module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {
        const { guild, member, customId, channel } = interaction;
        const { ManageChannels, SendMessages } = PermissionFlagsBits;

        if (!interaction.isButton()) return;

        if (!["close", "lock", "unlock"].includes(customId)) return;

        if (!guild.members.me.permissions.has(ManageChannels))
            return interaction.reply({
                content: "I don't have permission for this.",
                ephemeral: true
            });

        const embed = new EmbedBuilder()
            .setColor("Aqua");

        const data = await ticketSchema.findOne({ ChannelID: channel.id })
        if (!data) return
        const fetchMember = await guild.members.fetch(data.MemberID);
        switch (customId) {
            case "close":
                if (data.closed === true)
                    return interaction.reply({
                        content: "Ticket is already getting deleted...",
                        ephemeral: true
                    });

                const transcript = await createTranscript(channel, {
                    limit: -1,
                    returnBuffer: false,
                    fileName: `${member.user.username}-ticket.${data.Type}-${data.TicketID}.html`,
                });

                await ticketSchema.updateOne({ ChannelID: channel.id }, { Closed: true });

                const transcriptEmbed = new EmbedBuilder()
                    .setTitle(`Transcript Type: ${data.Type}\nId: ${data.TicketID}`)
                    .setFooter({
                        text: member.user.tag,
                        iconURL: member.displayAvatarURL({
                            dynamic: true
                        })
                    })
                    .setTimestamp();

                const transcriptProccesss = new EmbedBuilder()
                    .setTitle('Saving transcript...')
                    .setDescription("Ticket will be closed in 10 seconds, enable DM's for the ticket transcript.")
                    .setColor("Red")
                    .setFooter({
                        text: member.user.tag,
                        iconURL: member.displayAvatarURL({
                            dynamic: true
                        })
                    })
                    .setTimestamp();

                const res = await guild.channels.fetch(transcripts).send({
                    embeds: [transcriptEmbed],
                    files: [transcript],
                });

                channel.send({
                    embeds: [transcriptProccesss],
                });

                setTimeout(function () {
                    member.send({
                        embeds: [transcriptEmbed.setDescription(`Access your ticket transcripts: ${res.url}`)]
                    }).catch(() => channel.send('Couldn\'t send transcript to Direct Messages.'));
                    channel.delete();
                }, 10000);

                break;

            case "lock":
                if (!member.permissions.has(ManageChannels))
                    return interaction.reply({
                        content: "You don't have permission for that.",
                        ephemeral: true
                    });

                if (data.Locked === true)
                    return interaction.reply({
                        content: "Ticket is already set to locked.",
                        ephemeral: true
                    });

                await ticketSchema.updateOne({
                    ChannelID: channel.id
                }, {
                    Locked: true
                });
                embed.setDescription("Ticket was locked successfully 🔐");

                channel.permissionOverwrites.edit(fetchMember, {
                    SendMessages: false
                });

                return interaction.reply({
                    embeds: [embed]
                });

            case "unlock":
                if (!member.permissions.has(ManageChannels))
                    return interaction.reply({
                        content: "You don't have permission for that.",
                        ephemeral: true
                    });

                if (data.Locked === false)
                    return interaction.reply({
                        content: "Ticket is already set to unlocked.",
                        ephemeral: true
                    });

                await ticketSchema.updateOne({
                    ChannelID: channel.id
                }, {
                    Locked: true
                });
                embed.setDescription("Ticket was unlocked successfully 🔓");

                channel.permissionOverwrites.edit(fetchMember, {
                    SendMessages: true
                });

                return interaction.reply({
                    embeds: [embed]
                })
        };
    },
};
