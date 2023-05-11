const {
  Client,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a member from the guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Select the user you wish to unmute.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { guild, options } = interaction;

    const user = options.getUser("target");
    const member = await interaction.guild.members.fetch(user.id);

    const errEmbed = new EmbedBuilder()
      .setDescription("Something went wrong. Please try again later.")
      .setColor(0xc72c3b);

    const successEmbed = new EmbedBuilder()
      .setTitle("**:white_check_mark: Unmuted**")
      .setDescription(`Successfully unmuted ${user}.`)
      .setColor(0x5fb041)
      .setTimestamp();

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    )
      return interaction.reply({ embeds: { errEmbed }, emphemeral: true }); //this if statement is optional (but recommended)

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ModerateMembers
      )
    )
      return interaction.followUp({ embeds: [errEmbed], ephermeral: true });

    try {
      await member.timeout(null);

      interaction.reply({ embeds: [successEmbed], ephermeral: true });
    } catch (err) {
      console.log(err);
    }
  },
};
