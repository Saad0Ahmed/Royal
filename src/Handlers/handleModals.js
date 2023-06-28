const { ChannelType, ButtonInteraction, AttachmentBuilder, escapeCodeBlock, codeBlock, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalSubmitFields, ModalSubmitInteraction } = require('discord.js');
const { inspect } = require('util');
const { replaceAll } = require('fallout-utility'); 

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const { customId, options } = interaction;

        const guildID = interaction.guild.id;
        const userID = interaction.user.id;

        if (!guildID) return;

        if (interaction.isModalSubmit()) {

            switch (customId) {
                case "eval_modal":
                    const code = interaction.fields.getTextInputValue('eval_code');

                    let result = '';
                    let error = false;
                    
                    try {
                        result = inspect(eval(code));
                    } catch (err) {
                        result = inspect(err);
                        error = true;
                    }
                    
                    result = replaceAll(result, client.token, '*'.repeat(client.token.length));

                    await interaction.reply({ 
                        embeds: [new EmbedBuilder().setTitle('Evaluated Code').setDescription(`\`\`\`${escapeCodeBlock(result)}\`\`\``).setTimestamp().setColor(client.mainColor)],
                        ephemeral: true
                    });

                    interaction.followUp({
                        files: [new AttachmentBuilder(Buffer.from(result, 'utf-8')).setName('Evaluated Code.txt')],
                        ephemeral: true
                    });
            }

        } else if (!interaction.isModalSubmit()) {
            return;
        }
    }
}