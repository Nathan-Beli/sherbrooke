require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, MessageFlags } = require('discord.js');

// 1. SERVEUR DE SANTÉ LIGHT (Réponse instantanée)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
}).listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// 2. CONFIGURATION DES RÔLES (Optimisée pour la vitesse)
const CONFIG = {
    "1469135249794535496": { section: "1464023125699198976", gerables: ["1469135660395921489", "1469135847969394832", "1469136018916638821", "1469136122926862426", "1469136454889246873", "1469136630660075687", "1469837682057412720", "1469136881609605224", "1469136986747961575", "1469137106763911310", "1469471355828310111", "1469468991817912518"] },
    "1452071287924195328": { section: "1452070645348171876", gerables: ["1452416169700098098", "1452416316873900164", "1452416385912275075", "1452416460390531172", "1452416559703261335", "1452457097261223979", "1482519730400137237", "1452416732441612462", "1452416863203233967", "1453084444016775360", "1479611200596606987", "1472601178952040458", "1467319731181846721"] }
    // Ajoute les autres ici si besoin, mais garde le dictionnaire compact
};

client.once('ready', async () => {
    console.log('Bot OK.');
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { 
        body: [{ name: 'panel', description: 'Panel de gestion' }] 
    });
});

client.on('interactionCreate', async i => {
    if (i.isChatInputCommand() && i.commandName === 'panel') {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn').setLabel('Gérer').setStyle(ButtonStyle.Primary));
        return i.reply({ content: "Panel de gestion", components: [row], flags: [MessageFlags.Ephemeral] });
    }

    if (i.isButton() && i.customId === 'btn') {
        const modal = new ModalBuilder().setCustomId('mod').setTitle('Gestion');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('uid').setLabel('ID Membre').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rid').setLabel('ID Rôle').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('act').setLabel('Action (add/remove)').setStyle(TextInputStyle.Short).setRequired(true))
        );
        return i.showModal(modal);
    }

    if (i.type === InteractionType.ModalSubmit && i.customId === 'mod') {
        const uid = i.fields.getTextInputValue('uid');
        const rid = i.fields.getTextInputValue('rid');
        const act = i.fields.getTextInputValue('act');

        const staffId = Object.keys(CONFIG).find(id => i.member.roles.cache.has(id) && CONFIG[id].gerables.includes(rid));
        if (!staffId) return i.reply({ content: "❌ Accès refusé ou rôle invalide.", flags: [MessageFlags.Ephemeral] });

        try {
            const member = await i.guild.members.fetch(uid);
            if (act === 'add') await member.roles.add([rid, CONFIG[staffId].section]);
            else await member.roles.remove([rid, CONFIG[staffId].section]);
            i.reply({ content: "✅ Action effectuée.", flags: [MessageFlags.Ephemeral] });
        } catch (e) {
            i.reply({ content: "❌ Erreur : Membre introuvable ou rôle trop haut.", flags: [MessageFlags.Ephemeral] });
        }
    }
});

client.login(process.env.TOKEN.trim());
