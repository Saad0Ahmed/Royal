const { CommandInteraction } = require("discord.js");
const { ticketActions, ticketResponse } = require("../../Handlers/tickets");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {

    const { customId, values, guild, member } = interaction; // you need to destructure values from interactions first to use it below
    await ticketActions(interaction);
    await ticketResponse(interaction);
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        interaction.reply({ content: "outdated command" });
      }

      command.execute(interaction);
    } else if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId == "verify") {
        const role = interaction.guild.roles.fetch("1103526715449409656");
        return interaction.member.roles.add(role).then((member) =>
          interaction.reply({
            content: `${role} has been assigned to you.`,
            ephermeral: true,
          })
        );
      }
    } else if (interaction.isSelectMenu()) {
      if (customId == "reaction-roles") {
        for (let i = 0; i < values.length; i++) {
          const roleId = values[i];

          const role = guild.roles.fetch(roleId);
          const hasRole = member.roles.fetch(roleId);

          switch (hasRole) {
            case true:
              member.roles.remove(roleId);
              break;
            case false:
              member.roles.add(roleId);
              break;
          }
        }

        interaction.reply({
          content: "Roles updated.",
          ephermeral: true
        });
      }
    } else {
      return;
    }
  },
};