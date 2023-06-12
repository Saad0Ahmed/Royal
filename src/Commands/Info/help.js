const { ComponentType, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a list of all the commands form the discord bot."),

  async execute(interaction, client) {
    const emojis = {
      info: "📝",
      moderation: "🛠️",
      general: "⚙️",
    };

    const directories = [
      ...new Set(interaction.client.commands.map((cmd) => cmd.folder)),
    ];

    const formatString = (str) =>
      `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

    const categories = directories.map((dir) => {
      const getCommands = interaction.client.commands
        .filter((cmd) => cmd.folder === dir)
        .map((cmd) => {
          return {
            name: cmd.data.name,
            Description:
              cmd.data.description ||
              "There is no description for this command.",
          };
        });

      return {
        directory: formatString(dir),
        commands: getCommands,
      };
    });

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setAuthor({ name: "Versa Bot" })
      .setDescription(`My Help Menu\nHello, my name is *__Royal__*\nNice to meet you\n\n<a:Caution:1117699816269561917> | ***Status***\n**Server:** ${client.guilds.cache.size}\n**Channel:** ${client.channels.cache.size}\n**User:** ${client.guilds.cache
        .map((g) => g.memberCount)
        .reduce((partial_sum, a) => partial_sum + a, 0)}`)
    //.setImage("add bannerURL here for mek like advance")
      .setThumbnail(client.user.displayAvatarURL());

    const components = (state) => [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Please select a category")
          .setDisabled(state)
          .addOptions(
            categories.map((cmd) => {
              return {
                label: cmd.directory,
                value: cmd.directory.toLowerCase(),
                description: `Commands from ${cmd.directory} category.`,
                emoji: emojis[cmd.directory.toLowerCase() || null],
              };
            })
          )
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setEmoji("<a:nc_owner:1117700334383542282>")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.gg/WYG5xKK8sv")
      ),
    ];

    const initialMessage = await interaction.reply({
      embeds: [embed],
      components: components(false),
    });

    const filter = (interaction) =>
      interaction.user.id === interaction.member.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.SELECT_MENU,
    });

    collector.on("collect", (interaction) => {
      const [directory] = interaction.values;
      const category = categories.find(
        (x) => x.directory.toLowerCase() === directory
      );

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`${formatString(directory)} commands`)
        .setDescription(
          `A list of all the commands categorized under ${directory}`
        )
        .addFields(
          category.commands.map((cmd) => {
            return {
              name: `\`${cmd.name}\``,
              value: cmd.Description,
              inline: true,
            };
          })
        );

      interaction.update({ embeds: [categoryEmbed] });
    });

    collector.on("end", () => {
      initialMessage.edit({ components: components(true) });
    });
  },
};

// edited by Omen_op
