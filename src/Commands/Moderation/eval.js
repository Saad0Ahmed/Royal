const { ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('(Dev Command) Evaluate snippets.'),
  
    async execute(interaction) {

        if (interaction.user.id !== "Y728675526004178976") return;
        
        const modal = new ModalBuilder()
        .setCustomId('eval_modal')
        .setTitle('(Dev) Evaluate JS');
        
        const text = new TextInputBuilder()
        .setCustomId('eval_code')
        .setLabel("Enter code here.")
        .setStyle(TextInputStyle.Paragraph);
        
        const secondActionRow = new ActionRowBuilder().addComponents(text);
        
        modal.addComponents(secondActionRow);
        interaction.showModal(modal);

    }
}