const { WebhookClient, EmbedBuilder } = require("discord.js");

function logger(message, error) {
  const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1122599583395086376/7fEqX-9XPpeZVqsfdPkYEQwugoOu7j5VrpHYnJFXpE1TcQ6grFPHHUqVVS9OkG9NWDHY" });
  console.log(message, error)
      if (!message && !error) return;
      const ERROR = error?.stack || error;
      const errEmbed = new EmbedBuilder()
      .setColor("Red")
      .setAuthor({ name: ERROR?.name ?? "Error:" })
      .addFields(
        { name: "Description", value: message || ERROR?.message || "Unknow" }
        )
      .setDescription(
        "\`\`\`js\n" + (ERROR.length > 4096 ? `${ERROR.substr(0, 4000)}...` : ERROR) + "\n\`\`\`"
      );

      webhook.send({
        username: "BotLogs",
        embeds: [errEmbed]
      }).catch((e) => {})
}

module.exports = { logger };