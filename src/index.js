const {
  Discord
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

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at: ', promise, 'reason', reason);
});

client.login(client.config.token).then(() => {
  loadEvents(client);
  loadCommands(client);
});

client.on('error', (error) => {
  const channel = client.channels.get('1121365088490758297');
  channel.send(error);
});

module.exports = { client, openai };