const chatGPTSchema = require('../../Models/ChatGPT')
const { openai } = require('../../index');
module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
			if (message.author.bot) return;
			if (message.content.startsWith("-")) return;
			const database = await chatGPTSchema.findOne({ guildId: message.guild.id });
			if (!database) return;
			const channel = await client.channels.fetch(database.channelId);
			if (!channel || message.author.bot || !message.guild) return;
			if (message.channel.id !== channel.id) return;
			// here create response for chatgpt
	
			let conversationLog = [
					{ role: "system", content: "You are a friendly chatbot." },
			];
	
			await message.channel.sendTyping();
	
			let prevMessages = await message.channel.messages.fetch({ limit: 15 });
			prevMessages.reverse();
	
			prevMessages.forEach((msg) => {
					if (message.content.startsWith("-")) return;
					if (msg.author.id !== client.user.id && message.author.bot) return;
					if (msg.author.id !== message.author.id) return;
	
					conversationLog.push({
							role: "user",
							content: msg.content,
					});
			});
	
			const result = await openai.createChatCompletion({
					model: "gpt-3.5-turbo",
					messages: conversationLog,
			});
	
			message.reply(result.data.choices[0].message);
	}
}