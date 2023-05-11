const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the discord server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("userid")
        .setDescription("Discord ID of the user you want to unban.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { channel, options } = interaction;

    const userId = options.getUser("userid");

    try {
      await interaction.guild.members.unban(userId);

      const embed = new EmbedBuilder()
        .setDescription(`Successfully unbanned id ${userId} from the guild.`)
        .setColor(0x5fb041)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);

      const errEmbed = new EmbedBuilder()
        .setDescription(`Please provide a valid members ID.`)
        .setColor(0xc72c3b);

      await interaction.reply({
        embeds: [errEmbed],
        ephemeral: true,
      });
    }
  },
};
