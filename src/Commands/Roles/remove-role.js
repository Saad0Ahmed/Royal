const rrSchema = require("../../Models/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removerole")
        .setDescription("Removes custom reaction role.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to be removed.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { options, guildId, member, filter } = interaction;

        const role = options.getRole("role");

        try {

            const data = await rrSchema.findOne({
                GuildID: guildId
            });

            if (!data)
            return interaction.reply({
                content: "This server does not have any data.",
                ephemeral: true
            });

            const roles = data.roles;
            const findRole = roles.find((r) => r.roleId === role.id);
            const filter = (r) => r.roleId !== role.id;

            if (!findRole)
            return interaction.reply({
                content: "This role does not exist.",
                ephemeral: true
            });

            const filteredRoles = await filter((r) => r.roleId !== role.id);
            data.roles = filteredRoles;

            await data.save();

            return interaction.reply({
                content: `Removed new role **${role.name}**`
            });

        } catch (err) {
            console.log(err)
        }
    }
}