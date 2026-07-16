const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupde') // Nom de la commande Slash
        .setDescription('Envoie le message de démission (Admin uniquement)'),

    async execute(interaction) {
        // Vérification de l'ID utilisateur
        if (interaction.user.id !== '1016479613297369139') {
            return interaction.reply({ content: "❌ Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Démission du Sûreté du Québec')
            .setDescription('Cliquez sur le bouton ci-dessous pour démissionner et retirer vos rôles automatiquement.')
            .setColor(0xFF0000);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_demission')
                    .setLabel('Démissionner')
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.reply({ content: 'Message envoyé avec succès.', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    },
};
