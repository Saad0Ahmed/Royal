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

client.login(client.config.token).then(() => {
  loadEvents(client);
  loadCommands(client);
});

const proocess = require('node:process');

process.on*('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at: ', promise, 'reason', reason);
});

module.exports = { client, openai };