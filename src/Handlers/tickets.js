const { ButtonInteraction, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const { transcripts, everyone, ticketParent } = require("../../config.json");
const ticketSchema = require("../Models/Ticket");

module.exports = {
  /**@param {import("discord.js").Interaction} interaction */
  async ticketActions(interaction) {
      const { guild, member, customId, channel } = interaction;
      const { ManageChannels } = PermissionFlagsBits;

      if (!interaction.isButton()) return;
      if (!["close", "lock", "unlock"].includes(customId)) return;

      if (!guild.members.me.permissions.has(ManageChannels))
          return interaction.reply({
              content: "I don't have permission for this.",
              ephemeral: true
          });

      try {
        const embed = new EmbedBuilder()
          .setColor("Aqua");

      const data = await ticketSchema.findOne({ ChannelID: channel.id })
      if (!data) return
      const fetchMember = await guild.members.fetch(data.MemberID);
      switch (customId) {
          case "close":
              if (data.Closed === true){
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

                const res = await guild.channels.fetch(transcripts)
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
            await ticketSchema.create({
                GuildID: guild.id,
                MemberID: member.id,
                TicketID: ticketId,
                ChannelID: response.id,
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