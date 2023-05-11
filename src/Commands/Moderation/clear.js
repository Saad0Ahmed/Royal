const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription(
      "Clear a specific ammount of messages from a target or channel."
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of messages to clear.")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Select a target to clear their messages.")
    ),
  async execute(interaction) {
    const { channel, options } = interaction;

    const amount = options.getInteger("amount");
    const target = options.getUser("target");

    const messages = await channel.messages.fetch({
      limit: amount + 1,
    });

    const res = new EmbedBuilder()
      .setColor(0x5fb041)
      .setDescription("Successfully cleared the messages");

    await interaction.reply({
      embeds: [res],
      components: [],
      ephemeral: true,
    });

    if (target) {
      let i = 0;
      const filtered = [];

      (await messages).filter((msg) => {
        if (msg.author.id === target.id && amount > i) {
          filtered.push(msg);
          i++;
        }
      });

      await channel.bulkDelete(filtered).then((messages) => {
        res.setDescription(
          `Successfully deleted ${messages.size} messages from ${target}.`
        );
        interaction.reply({ embeds: [res], ephermeral: true }); //you can use ephemeral if you desire
      });
    } else {
      await channel.bulkDelete(amount, true).then((messages) => {
        res.setDescription(
          `Successfully deleted ${messages.size} messages from the channel.`
        );
        interaction.followUp({ embeds: [res], ephermeral: true }); //you can use ephemeral if you desire
      });
    }
  },
};
