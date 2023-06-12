const { EmbedBuilder } = require("@discordjs/builders");
const { GuildMember, Embed, InteractionCollector } = require("discord.js");
const welcomeSchema = require("../../Models/Welcome");
const WelcomeCard = require("../../Utils/WelcomeCard");
/**
 * Listen for the guildMemberAdd event and send a welcome message with an image
 * @param {GuildMember} member - The member who joined the server
 * @return {Promise<void>}
 */
const execute = async (member, interaction) => {
  if (member.user.bot) return;
  const welcomeDocument = await welcomeSchema.findOne({
    guildId: member.guild.id,
  });
  if (!welcomeDocument) return;
  // Get the welcome channel and check if it's a text channel
  const welcomeChannel = member.guild.channels.cache.get(
    welcomeDocument.channelId
  );
  if (!welcomeChannel || !welcomeChannel.isTextBased) {
    // Create a new WelcomeCard and set its properties
    const welcomeCard = new WelcomeCard();
    welcomeCard
      .setAvatarUrl(member.user.avatarURL({ extension: "png", size: 1024 }))
      .setMemberCount(member.guild.memberCount)
      .setTag(member.user.tag);

    // Draw the welcome image and create a new Discord attachment from the buffer
    const attachment = await welcomeCard.draw();

    try {
      // Send the welcome message with the image attachment
      welcomeChannel.send({
        content: `:wave: Hello ${member}, Welcome to ${member.guild.name}`,
        files: [attachment],
      });
      if (welcomeDocument.roleId && member.guild.roles.cache.has(welcomeDocument.roleId)) {
        member.roles.add(welcomeDocument.roleId);
      }
    } catch (error) {
      console.error(error);
    }
  }
};
module.exports = {
  name: "guildMemberAdd",
  execute,
};
