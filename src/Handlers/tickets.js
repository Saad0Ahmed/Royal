const { ButtonInteraction, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const ticketSchema = require("../Models/Ticket");
const TicketSetup = require("../Models/TicketSetup");

module.exports = {
    /**@param {import("discord.js").Interaction} interaction */
    async ticketActions(interaction) {
        const { guild, member, customId, channel } = interaction;
        const { ManageChannels, SendMessages } = PermissionFlagsBits;

        if (!interaction.isButton()) return;

        if (!["close", "lock", "unlock", "claim"].includes(customId)) return;

        const docs = await TicketSetup.findOne({ GuildID: guild.id });

        if (!docs) return;

        if (!guild.members.me.permissions.has((r) => r.id === docs.Handlers))
            return interaction.reply({
                content: "I don't have permission for this.",
                ephemeral: true
            });

        try {
            const embed = new EmbedBuilder()
                .setColor("Aqua");

            const data = await ticketSchema.findOne({ ChannelID: channel.id })
            if (!data) return
            const fetchMember = await guild.members.fetch(data.MembersID);
            switch (customId) {
                case "close":
                    if (data.Closed === true) {
                        return interaction.reply({
                            content: "Ticket is already getting deleted...",
                            ephemeral: true
                        })
                    }

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

                    const res = await guild.channels.fetch(docs.Transcripts)
                    await res.send({
                        embeds: [transcriptEmbed],
                        files: [transcript],
                    });

                    await channel.send({
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

                    data.MembersID.forEach((m) => {
                        channel.permissionOverwrites.edit(m,
                            {
                                SendMessages: false
                            });
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
                        Locked: false
                    });
                    embed.setDescription("Ticket was unlocked successfully 🔓");

                    data.MembersID.forEach((m) => {
                        channel.permissionOverwrites.edit(m,
                            {
                                SendMessages: true
                            });
                    });

                    return interaction.reply({
                        embeds: [embed]
                    });

                case "claim":
                    if (!member.permissions.has(ManageChannels))
                        return interaction.reply({
                            content: "You don't have permission for that.",
                            ephemeral: true
                        });

                    if (data.Claimed === true)
                        return interaction.reply({
                            content: `Ticket is already claimed by <@${data.ClaimedBy}>`,
                            ephemeral: true
                        });

                    await ticketSchema.updateOne({
                        ChannelID: channel.id
                    }, {
                        Claimed: true,
                        ClaimedBy: member.id
                    });

                    embed.setDescription(`Ticket is already claimed by ${member}`);

                    interaction.reply({
                        embeds: [embed]
                    });

                    break;
            };

        } catch (error) {
            console.log(error)
        }
    },
    /**
     * @param {import("discord.js").Interaction} interaction 
     */
    async ticketResponse(interaction) {

        const { guild, member, customId, channel } = interaction;
        const { ViewChannel, SendMessages, ManageChannels, ReadMessageHistory } = PermissionFlagsBits;
        const ticketId = Math.floor(Math.random() * 9000) + 10000;

        if (!interaction.isButton()) return;

        const data = await TicketSetup.findOne({ GuildID: guild.id });

        if (!data)
            return;

        if (!data.Buttons.includes(customId))
            return;

        if (!guild.members.me.permissions.has(ManageChannels))
            interaction.reply({
                content: "I don't have permission for this.",
                ephemeral: true
            });

        try {
            await guild.channels.create({
                name: `${member.user.username}-ticket${ticketId}`,
                type: ChannelType.GuildText,
                parent: data.Category,
                permissionOverwrites: [
                    {
                        id: data.Everyone,
                        deny: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                    {
                        id: member.id,
                        allow: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                ],
            }).then(async (response) => {
                await ticketSchema.create({
                    GuildID: guild.id,
                    MembersID: member.id,
                    TicketID: ticketId,
                    ChannelID: response.id,
                    Closed: false,
                    Locked: false,
                    Type: customId,
                    Claimed: false,
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
                    new ButtonBuilder().setCustomId('claim').setLabel('Claim').setStyle(ButtonStyle.Secondary).setEmoji('🛄'),
                );

                response.send({
                    embed: ([embed]),
                    components: [
                        button
                    ]
                });

                interaction.reply({
                    content: `Successfully created a ticket ${response}`,
                    ephemeral: true
                });
            });
        } catch (err) {
            return console.log(err);
        };

    }
}
