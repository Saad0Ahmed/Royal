const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only allowed for admin users
  async execute(interaction) {
    const pingMessage = await interaction.reply({ content: "Pinging...", ephemeral: true });
    const ping = pingMessage.createdTimestamp - interaction.createdTimestamp;
    const latency = `Bot latency: ${ping}ms\nAPI latency: ${Math.round(interaction.client.ws.ping)}ms`;
    const uptime = `Uptime: ${ms(interaction.client.uptime, { long: true })}`;
    interaction.editReply({ content: `${latency}\n${uptime}`, ephemeral: true });
  },
};