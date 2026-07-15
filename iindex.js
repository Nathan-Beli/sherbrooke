// 1. DÉTECTION DU BUILD (Sécurité absolue)
// Si on est en phase de build, on quitte immédiatement pour éviter le timeout
if (process.env.BUILD_COMMAND || process.env.NODE_ENV === 'production' && !process.env.START_COMMAND) {
    console.log("Phase de build détectée, arrêt immédiat pour éviter le timeout.");
    process.exit(0);
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const http = require('http');

// Serveur de santé (pour Canner)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
}).listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Ton système de démission...
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

const SALON_DEMISSION_ID = "1478907385333420228";

client.once('ready', async () => {
    console.log('Bot opérationnel.');
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton() || i.customId !== 'btn_demission') return;
    try {
        await i.member.roles.remove(rolesToDelete);
        await i.reply({ content: "✅ Vos rôles ont été retirés.", flags: [MessageFlags.Ephemeral] });
    } catch (e) {
        await i.reply({ content: "❌ Erreur.", flags: [MessageFlags.Ephemeral] });
    }
});

client.login(process.env.TOKEN);
