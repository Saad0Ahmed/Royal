const { CommandInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        interaction.reply({ content: "outdated command" });
      }

      command.execute(interaction);
    } else if (interaction.isButton()) {
      const role = interaction.guild.roles.fetch("1103526715449409656");
      return interaction.member.roles.add(role).then((member) =>
        interaction.reply({
          content: `${role} has been assigned to you.`,
          ephermeral: true,
        })
      );
    } else {
      return;
    }
  },
};
