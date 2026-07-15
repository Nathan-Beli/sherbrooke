const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Liste complète et unifiée des rôles à retirer
const rolesToDelete = [
    // Rôles originaux
    "1469135660395921489", "1469135847969394832", "1469136018916638821", 
    "1469136122926862426", "1469136454889246873", "1469136630660075687", 
    "1469837682057412720", "1469136881609605224", "1469136986747961575", 
    "1469137106763911310", "1469471355828310111", "1469468991817912518",
    "1472427560389578793", "1475602803077677076", "1472428526694043800", 
    "1469471404016537859", "1469135249794535496",
    // Nouveaux rôles SPS
    "1452071287924195328", "1452416169700098098", "1452416316873900164", 
    "1452416385912275075", "1452416460390531172", "1452416559703261335", 
    "1452457097261223979", "1482519730400137237", "1452416732441612462", 
    "1452416863203233967", "1453084444016775360", "1467319731181846721",
    // Nouveaux rôles GI / GEC
    "1472601178952040458", "1472720308807925853", "1465510761857286218", 
    "1479611200596606987", "1479611241881403522", "1472231552145559715"
];

const SALON_DEMISSION_ID = "1478907385333420228";

client.on('ready', async () => {
    const channel = await client.channels.fetch(SALON_DEMISSION_ID);
    if (!channel) return;

    // Suppression de la vérification de messages pour s'assurer que l'embed soit toujours là
    // Ou si tu veux garder la vérification, voici le nouveau texte :
    const messages = await channel.messages.fetch({ limit: 1 });
    if (messages.size === 0) {
        const embed = new EmbedBuilder()
            .setTitle('📂 Procédure de démission')
            .setDescription('Cliquez sur le bouton ci-dessous pour retirer tous vos rôles de votre département. ATTENTION, cette action est irréversible')
            .setColor('#2b2d31');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_demission')
                .setLabel('Démissionner')
                .setStyle(ButtonStyle.Danger)
        );

        channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton() || i.customId !== 'btn_demission') return;

    try {
        await i.member.roles.remove(rolesToDelete);
        await i.reply({ content: "✅ Vos rôles ont été retirés avec succès.", ephemeral: true });
    } catch (e) {
        await i.reply({ content: "❌ Une erreur est survenue. Vérifiez que le bot a la permission de gérer les rôles.", ephemeral: true });
    }
});

client.login(process.env.TOKEN);
