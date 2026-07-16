// 1. SÉCURITÉ : Installation automatique des modules s'ils sont manquants
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    require.resolve('discord.js');
    require.resolve('dotenv');
} catch (e) {
    console.log("Modules manquants détectés, installation en cours...");
    execSync('npm install discord.js dotenv', { stdio: 'inherit' });
}

// 2. CONFIGURATION ET SERVEUR HTTP
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const http = require('http');

// Serveur minimal pour satisfaire le Health Check de Canner
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot Sherbrooke RP en ligne');
}).listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rolesToDelete = [
    "1469135660395921489", "1469135847969394832", "1469136018916638821", "1469136122926862426", 
    "1469136454889246873", "1469136630660075687", "1469837682057412720", "1469136881609605224", 
    "1469136986747961575", "1469137106763911310", "1469471355828310111", "1469468991817912518",
    "1472427560389578793", "1475602803077677076", "1472428526694043800", "1469471404016537859", 
    "1469135249794535496", "1452071287924195328", "1452416169700098098", "1452416316873900164", 
    "1452416385912275075", "1452416460390531172", "1452416559703261335", "1452457097261223979", 
    "1482519730400137237", "1452416732441612462", "1452416863203233967", "1453084444016775360", 
    "1467319731181846721", "1472601178952040458", "1472720308807925853", "1465510761857286218", 
    "1479611200596606987", "1479611241881403522", "1472231552145559715"
];

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Gestion du bouton de démission
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    
    if (i.customId === 'btn_demission') {
        try {
            await i.member.roles.remove(rolesToDelete);
            await i.reply({ content: "✅ Vos rôles ont été retirés.", flags: [MessageFlags.Ephemeral] });
        } catch (e) {
            console.error(e);
            await i.reply({ content: "❌ Une erreur est survenue lors du retrait des rôles.", flags: [MessageFlags.Ephemeral] });
        }
    }
});

client.login(process.env.TOKEN);
