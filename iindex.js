require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, MessageFlags } = require('discord.js');
const http = require('http');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const CLIENT_ID = '1526945869822300305';

// Configuration (Assure-toi que les IDs sont bien tous en chaîne de caractères)
const CONFIG = {
    "1469135249794535496": { gerables: ["1469135660395921489", "1469135847969394832", "1469136018916638821", "1469136122926862426", "1469136454889246873", "1469136630660075687", "1469837682057412720", "1469136881609605224", "1469136986747961575", "1469137106763911310", "1469471355828310111", "1469468991817912518"], section: "1464023125699198976" },
    "1452071287924195328": { gerables: ["1452416169700098098", "1452416316873900164", "1452416385912275075", "1452416460390531172", "1452416559703261335", "1452457097261223979", "1482519730400137237", "1452416732441612462", "1452416863203233967", "1453084444016775360", "1479611200596606987", "1472601178952040458", "1467319731181846721"], section: "1452070645348171876" },
    "1493007951168798720": { gerables: ["1493007845514416138"], section: "1465539316896891117" }
};

// 1. Démarrage immédiat du serveur HTTP pour Canner
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot en ligne');
}).listen(PORT, () => console.log(`Health check prêt sur port ${PORT}`));

// 2. Enregistrement des commandes
client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [{
            name: 'promotion',
            description: 'Gérer une promotion',
            options: [
                { name: 'action', type: 3, description: 'Ajouter ou enlever', required: true, choices: [{name: 'Ajouter', value: 'add'}, {name: 'Enlever', value: 'remove'}] },
                { name: 'membre', type: 6, description: 'Membre concerné', required: true },
                { name: 'role', type: 8, description: 'Rôle à gérer', required: true }
            ]
        }]});
        console.log('Commandes déployées !');
    } catch (err) { console.error(err); }
});

// 3. Logique de promotion
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'promotion') return;

    const membre = interaction.options.getMember('membre');
    const roleCible = interaction.options.getRole('role');
    const action = interaction.options.getString('action');

    const config = Object.entries(CONFIG).find(([idRole, cfg]) => 
        interaction.member.roles.cache.has(idRole) && cfg.gerables.includes(roleCible.id)
    )?.[1];

    if (!config) return await interaction.reply({ content: "❌ Permission refusée ou rôle non gérable.", flags: [MessageFlags.Ephemeral] });

    try {
        if (action === 'add') {
            await membre.roles.add([roleCible, config.section]);
            await interaction.reply({ content: `✅ Ajouté avec succès.`, flags: [MessageFlags.Ephemeral] });
        } else {
            await membre.roles.remove([roleCible, config.section]);
            await interaction.reply({ content: `✅ Retiré avec succès.`, flags: [MessageFlags.Ephemeral] });
        }
    } catch {
        await interaction.reply({ content: "❌ Erreur : Vérifiez que le rôle du bot est bien au-dessus du rôle cible.", flags: [MessageFlags.Ephemeral] });
    }
});

// 4. Connexion
if (!process.env.TOKEN) process.exit(1);
client.login(process.env.TOKEN.trim());
