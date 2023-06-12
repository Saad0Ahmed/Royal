const { CommandInteraction } = require("discord.js");
const { ticketActions, ticketResponse } = require("../../Handlers/tickets");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    const { customId, values, guild, member } = interaction;
    await ticketActions(interaction);
    await ticketResponse(interaction);

    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        interaction.reply({ content: "outdated command" });
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        interaction.reply({
          content: "An error occurred while executing this command.",
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      if (customId === "verify") {
        const role = await interaction.guild.roles.fetch("1103526715449409656");
        if (!role) {
          interaction.reply({
            content: "The specified role could not be found.",
            ephemeral: true,
          });
          return;
        }
        try {
          await interaction.member.roles.add(role);
          interaction.reply({
            content: `${role} has been assigned to you.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(error);
          interaction.reply({
            content: "An error occurred while assigning the role.",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isSelectMenu()) {
      if (customId === "reaction-roles") {
        for (let i = 0; i < values.length; i++) {
          const roleId = values[i];

          const role = await guild.roles.fetch(roleId);
          if (!role) continue;

          const hasRole = await member.roles.fetch(roleId);

          try {
            if (hasRole) {
              await member.roles.remove(roleId);
            } else {
              await member.roles.add(roleId);
            }
          } catch (error) {
            console.error(error);
          }
        }

        interaction.reply({
          content: "Roles updated.",
          ephemeral: true,
        });
      }
    } else {
      return;
    }
  },
};
