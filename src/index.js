const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

const { Guilds, GuildMembers, GuildMessages, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel } = Partials;

const { Configuration, OpenAIApi } = require("openai")
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { logger } = require("./Logs/Logger");
const config = require("./Utils/config")

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, MessageContent],
  partials: [User, Message, GuildMember, ThreadMember],
});

const configuration = new Configuration({
  apiKey: config.API_KEY,
});

const openai = new OpenAIApi(configuration);

client.commands = new Collection();
client.config = config;

process.on("unhandledRejection", (err) =>
  logger(`Unhandled Rejection`, err));

client.login(client.config.token).then(() => {
  loadEvents(client);
  loadCommands(client);
});

module.exports = { client, openai };