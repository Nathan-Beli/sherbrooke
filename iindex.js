require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, MessageFlags } = require('discord.js');

// 1. Démarrage immédiat du serveur HTTP (indispensable pour Canner)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
}).listen(PORT, '0.0.0.0', () => console.log(`Serveur prêt sur port ${PORT}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// CONFIGURATION DES GRADES ET SECTIONS
const CONFIG = {
    "1469135249794535496": { section: "1464023125699198976", gerables: ["1469135660395921489", "1469135847969394832", "1469136018916638821", "1469136122926862426", "1469136454889246873", "1469136630660075687", "1469837682057412720", "1469136881609605224", "1469136986747961575", "1469137106763911310", "1469471355828310111", "1469468991817912518"] },
    "1452071287924195328": { section: "1452070645348171876", gerables: ["1452416169700098098", "1452416316873900164", "1452416385912275075", "1452416460390531172", "1452416559703261335", "1452457097261223979", "1482519730400137237", "1452416732441612462", "1452416863203233967", "1453084444016775360", "1479611200596606987", "1472601178952040458", "1467319731181846721"] }
    // Ajoute tes autres rôles ici...
};

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [{ name: 'panel', description: 'Ouvrir le panel de promotion' }] });
    console.log('Bot en ligne !');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('promo_btn').setLabel('Gérer promotion').setStyle(ButtonStyle.Primary));
        await interaction.reply({ content: "### 🏢 Panel Sherbrooke\nCliquez pour gérer les promotions :", components: [row], flags: [MessageFlags.Ephemeral] });
    }

    if (interaction.isButton() && interaction.customId === 'promo_btn') {
        const modal = new ModalBuilder().setCustomId('promo_modal').setTitle('Promotion Sherbrooke');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('uid').setLabel('ID Membre').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rid').setLabel('ID Rôle').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('action').setLabel('Action (add/remove)').setStyle(TextInputStyle.Short).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'promo_modal') {
        const uid = interaction.fields.getTextInputValue('uid');
        const rid = interaction.fields.getTextInputValue('rid');
        const action = interaction.fields.getTextInputValue('action');

        const staffEntry = Object.entries(CONFIG).find(([roleId, data]) => 
            interaction.member.roles.cache.has(roleId) && data.gerables.includes(rid)
        );

        if (!staffEntry) return await interaction.reply({ content: "❌ Permission refusée.", flags: [MessageFlags.Ephemeral] });

        try {
            const member = await interaction.guild.members.fetch(uid);
            const section = staffEntry[1].section;
            if (action === 'add') await member.roles.add([rid, section]);
            else await member.roles.remove([rid, section]);
            await interaction.reply({ content: "✅ Action réussie.", flags: [MessageFlags.Ephemeral] });
        } catch { await interaction.reply({ content: "❌ Erreur : Vérifiez l'ID et les permissions.", flags: [MessageFlags.Ephemeral] }); }
    }
});

client.login(process.env.TOKEN.trim());
