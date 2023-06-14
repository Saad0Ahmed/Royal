const rrSchema = require("../../Models/ReactionRoles");
const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Adds custom reaction role.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to be assigned.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("description")
                .setDescription("Description of the role.")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("emoji")
                .setDescription("Emoji for the role.")
                .setRequired(false)
        ),
        /**
         * 
         * @param {ChatInputCommandInteraction} interaction 
         * @returns 
         */
    async execute(interaction) {
        const { options, member } = interaction;

        const role = options.getRole("role");
        const description = options.getString("description");
        const emoji = options.getString("emoji");

        try {
            
            if (role.position >= member.roles.highest.position)
            return interaction.reply({
                content: "I don't have permissions for that.",
                ephemeral: true
            });

            const data = await rrSchema.findOne({
                GuildID: interaction.guild.id
            }).catch((e)=>{null});

            const newRole = {
                roleId: role.id,
                roleDescription: description || "No description.",
                roleEmoji: emoji || "",
            }
            if (data) {
                let roleData = data.roles.find((x) => x.roleId === role.id);

                if (roleData) {
                    return interaction.reply("Role already in database")
                } else {
                    data.roles = [...data.roles, newRole]
                }
                try {
                    await data.save();
                } catch {
                    console.log();
                }
                
            } else {
                await rrSchema.create({
                    GuildID: interaction.guild.id,
                    roles:[newRole],
                });
            }
            return interaction.reply({
              content: `Created new role **${role.name}**`
          });

        } catch (err) {
            console.log(err)
        }
    }
}