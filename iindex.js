require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, MessageFlags, PermissionsBitField } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const CLIENT_ID = '1526945869822300305';

// Configuration des permissions et sections
const CONFIG = {
    // "ID_ROLE_AUTORISE": { gerables: ["ID_ROLE1", "ID_ROLE2"], section: "ID_SECTION" }
    "1469135249794535496": { gerables: ["1469135660395921489", "1469135847969394832", "1469136018916638821", "1469136122926862426", "1469136454889246873", "1469136630660075687", "1469837682057412720", "1469136881609605224", "1469136986747961575", "1469137106763911310", "1469471355828310111", "1469468991817912518"], section: "1464023125699198976" },
    "1452071287924195328": { gerables: ["1452416169700098098", "1452416316873900164", "1452416385912275075", "1452416460390531172", "1452416559703261335", "1452457097261223979", "1482519730400137237", "1452416732441612462", "1452416863203233967", "1453084444016775360", "1479611200596606987", "1472601178952040458", "1467319731181846721"], section: "1452070645348171876" },
    "1493007951168798720": { gerables: ["1493007845514416138"], section: "1465539316896891117" },
    // Ajoute le reste de tes configs ici sur le même modèle
};

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const commands = [{
        name: 'promotion',
        description: 'Gérer une promotion',
        options: [
            { name: 'action', type: 3, description: 'ajouter ou enlever', required: true, choices: [{name: 'Ajouter', value: 'add'}, {name: 'Enlever', value: 'remove'}] },
            { name: 'membre', type: 6, description: 'Membre concerné', required: true },
            { name: 'role', type: 8, description: 'Rôle à donner/enlever', required: true }
        ]
    }];
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Bot en ligne et commandes déployées !');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'promotion') {
        const membre = interaction.options.getMember('membre');
        const roleCible = interaction.options.getRole('role');
        const action = interaction.options.getString('action');

        let config = null;
        for (const [idRoleAutorise, cfg] of Object.entries(CONFIG)) {
            if (interaction.member.roles.cache.has(idRoleAutorise) && cfg.gerables.includes(roleCible.id)) {
                config = cfg;
                break;
            }
        }

        if (!config) {
            return await interaction.reply({ content: "❌ Vous n'avez pas la permission de gérer ce rôle.", flags: [MessageFlags.Ephemeral] });
        }

        try {
            if (action === 'add') {
                await membre.roles.add([roleCible, config.section]);
                await interaction.reply({ content: `✅ Rôle et section ajoutés à ${membre.displayName}.`, flags: [MessageFlags.Ephemeral] });
            } else {
                await membre.roles.remove([roleCible, config.section]);
                await interaction.reply({ content: `✅ Rôle et section retirés à ${membre.displayName}.`, flags: [MessageFlags.Ephemeral] });
            }
        } catch (e) {
            await interaction.reply({ content: "❌ Erreur : Vérifiez les permissions du bot (le rôle du bot doit être au-dessus des autres).", flags: [MessageFlags.Ephemeral] });
        }
    }
});

client.login(process.env.TOKEN);
