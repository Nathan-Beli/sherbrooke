require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, MessageFlags } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const CLIENT_ID = '1526945869822300305';

// CONFIGURATION : ID_ROLE_STAFF : { label: "Nom", roleId: "ID_ROLE_CIBLE", sectionId: "ID_SECTION" }
const GRADES = {
    "1469135249794535496": { label: "Grade SQ", roleId: "1469135660395921489", sectionId: "1464023125699198976" },
    "1452071287924195328": { label: "Grade SPVB", roleId: "1452416169700098098", sectionId: "1452070645348171876" }
};

// Serveur Health Check pour Canner
const http = require('http');
http.createServer((req, res) => res.end('OK')).listen(process.env.PORT || 3000);

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [{ name: 'panel', description: 'Afficher le panel de promotion' }] });
    console.log('Bot prêt et commandes déployées !');
});

client.on('interactionCreate', async interaction => {
    // Affiche le panel
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        const rows = Object.entries(GRADES).map(([staffRoleId, data]) => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`promo_${staffRoleId}`).setLabel(data.label).setStyle(ButtonStyle.Primary)
        ));
        await interaction.reply({ content: "### 🏢 Panel de Promotions\nCliquez sur un grade pour promouvoir :", components: rows, flags: [MessageFlags.Ephemeral] });
    }

    // Ouvre le formulaire
    if (interaction.isButton() && interaction.customId.startsWith('promo_')) {
        const modal = new ModalBuilder().setCustomId('modal_promo').setTitle('Gestion Promotion');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('member_id').setLabel('ID du membre').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('action').setLabel('Action (add/remove)').setStyle(TextInputStyle.Short).setRequired(true))
        );
        // On stocke l'ID du grade cliqué dans le customId du modal pour le retrouver après
        modal.setCustomId(`modal_${interaction.customId}`);
        await interaction.showModal(modal);
    }

    // Traite le formulaire
    if (interaction.type === InteractionType.ModalSubmit) {
        const [_, __, staffRoleId] = interaction.customId.split('_');
        const memberId = interaction.fields.getTextInputValue('member_id');
        const action = interaction.fields.getTextInputValue('action');
        const data = GRADES[staffRoleId];

        try {
            const member = await interaction.guild.members.fetch(memberId);
            if (action === 'add') await member.roles.add([data.roleId, data.sectionId]);
            else await member.roles.remove([data.roleId, data.sectionId]);
            await interaction.reply({ content: `✅ Action '${action}' effectuée pour ${member.displayName}.`, flags: [MessageFlags.Ephemeral] });
        } catch (e) {
            await interaction.reply({ content: "❌ Erreur : Vérifiez l'ID du membre ou les permissions du bot.", flags: [MessageFlags.Ephemeral] });
        }
    }
});

client.login(process.env.TOKEN.trim());
