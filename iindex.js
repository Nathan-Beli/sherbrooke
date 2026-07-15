require('dotenv').config();
const http = require('http');

// 1. DÉMARRAGE DU SERVEUR DE SANTÉ EN PRIORITÉ ABSOLUE POUR CANNER
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`[Canner] Serveur de santé HTTP démarré avec succès sur le port ${PORT}`);
});

// 2. IMPORTATION DES PACKAGES ET CONFIGURATION DU BOT DISCORD
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    InteractionType, 
    MessageFlags 
} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const CLIENT_ID = process.env.CLIENT_ID || '1526945869822300305';

// Liste complète de tous les rôles autorisés à utiliser la commande /panel
const ROLES_AUTORISES = [
    "1475187795223118038", // Responsable juridique
    "1475680642992836671", // Juge en chef
    "1475680681773502464", // Juge en chef adjoint
    "1460756034292420832", // Chef de gang Crips
    "1460755664400810247", // Chef de gang Bloods
    "1475978873953976411", // Formateur CGA
    "1475977431696281695", // Direction CGA
    "1475977802057515108", // Directeur adjoint CGA
    "1465908621261930764", // Ministres
    "1465909106576461917", // Direction (mtq)
    "1479856498795610274", // Formateurs Ambulanciers
    "1459942281690874009", // Directeur paramedic
    "1465541475444981882", // Directeur adjoint paramédic
    "1461885996282024058", // Directeur SPCIS
    "1461893820424917084", // Directeur adjoint SPCIS
    "1472601178952040458", // Chef GI SPS
    "1472720308807925853", // Chef Adjoint GI SPS
    "1453084444016775360", // Formateur SPS
    "1479611200596606987", // Directeur GEC
    "1479611241881403522", // Directeur Adjoint GEC
    "1452071287924195328", // Directeur SPS
    "1452416169700098098", // Directeur adjoint SPS
    "1472427560389578793", // Chef GTI
    "1475602803077677076", // Chef adjoint GTI
    "1493007951168798720", // Responsable (Controle Routier)
    "1469135249794535496", // Directeur Général (SQ)
    "1469135660395921489"  // Directeur General Adjoint (SQ)
];

// Configuration dynamique des permissions de promotion et de retrait de grade + section
const CONFIG = {
    // === SÛRETÉ DU QUÉBEC (SQ) ===
    "1469135249794535496": { // Directeur Général
        section: "1464023125699198976", // Section SQ
        gerables: [
            "1469135660395921489", "1469135847969394832", "1469136018916638821", 
            "1469136122926862426", "1469136454889246873", "1469136630660075687", 
            "1469837682057412720", "1469136881609605224", "1469136986747961575", 
            "1469137106763911310", "1469471355828310111", "1469468991817912518"
        ]
    },
    "1469135660395921489": { // Directeur General Adjoint
        section: "1464023125699198976", // Section SQ
        gerables: [
            "1469135660395921489", "1469135847969394832", "1469136018916638821", 
            "1469136122926862426", "1469136454889246873", "1469136630660075687", 
            "1469837682057412720", "1469136881609605224", "1469136986747961575", 
            "1469137106763911310", "1469471355828310111", "1469468991817912518"
        ]
    },
    "1469468991817912518": { // Formateur SQ
        section: "1464023125699198976", // Section SQ
        gerables: ["1469136986747961575"] // Agent
    },

    // === CONTROLE ROUTIER ===
    "1493007951168798720": { // Responsable Controle Routier
        section: "1465539316896891117", // Section MTQ
        gerables: ["1493007845514416138"] // Controle routier
    },

    // === GROUPE TACTIQUE D'INTERVENTION (GTI) ===
    "1472427560389578793": { // Chef GTI
        section: "1452070645348171876", // Section SPS
        gerables: ["1472428526694043800", "1469471404016537859"] // Superviseur GTI, GTI
    },
    "1475602803077677076": { // Chef adjoint GTI
        section: "1452070645348171876", // Section SPS
        gerables: ["1472428526694043800", "1469471404016537859"] // Superviseur GTI, GTI
    },

    // === SERVICE DE POLICE DE SHERBROOKE (SPS) ===
    "1452071287924195328": { // Directeur SPS
        section: "1452070645348171876", // Section SPS
        gerables: [
            "1452416169700098098", "1452416316873900164", "1452416385912275075", 
            "1452416460390531172", "1452416559703261335", "1452457097261223979", 
            "1482519730400137237", "1452416732441612462", "1452416863203233967", 
            "1453084444016775360", "1479611200596606987", "1472601178952040458", 
            "1467319731181846721"
        ]
    },
    "1452416169700098098": { // Directeur adjoint SPS
        section: "1452070645348171876", // Section SPS
        gerables: [
            "1452416169700098098", "1452416316873900164", "1452416385912275075", 
            "1452416460390531172", "1452416559703261335", "1452457097261223979", 
            "1482519730400137237", "1452416732441612462", "1452416863203233967", 
            "1453084444016775360", "1479611200596606987", "1472601178952040458", 
            "1467319731181846721"
        ]
    },
    "1453084444016775360": { // Formateur SPS
        section: "1452070645348171876", // Section SPS
        gerables: ["1452416732441612462"] // Agent SPS
    },

    // === GOUVERNEMENT ENQUÊTE CITOYENNE (GEC) ===
    "1479611200596606987": { // Directeur GEC
        section: "1452070645348171876", // Section SPS
        gerables: ["1472231552145559715"] // GEC
    },
    "1479611241881403522": { // Directeur Adjoint GEC
        section: "1452070645348171876", // Section SPS
        gerables: ["1472231552145559715"] // GEC
    },

    // === ENQUÊTES ET DESCENTES (GI SPS) ===
    "1472601178952040458": { // Chef GI SPS
        section: "1452070645348171876", // Section SPS
        gerables: ["1465510761857286218"] // GI SPS
    },
    "1472720308807925853": { // Chef Adjoint GI SPS
        section: "1452070645348171876", // Section SPS
        gerables: ["1465510761857286218"] // GI SPS
    },

    // === SERVICE DE PROTECTION CONTRE LES INCENDIES (SPCIS) ===
    "1461885996282024058": { // Directeur SPCIS
        section: "1461885316431351953", // Section SPCIS
        gerables: [
            "1461893820424917084", "1471647100839268508", "1471647968791892189", 
            "1471647176454180918", "1471647240060932196", "1471647307010412544", 
            "1471647361070534837", "1471647408738926602", "1471648874400583933", 
            "1479177756813299826"
        ]
    },
    "1461893820424917084": { // Directeur adjoint SPCIS
        section: "1461885316431351953", // Section SPCIS
        gerables: [
            "1461893820424917084", "1471647100839268508", "1471647968791892189", 
            "1471647176454180918", "1471647240060932196", "1471647307010412544", 
            "1471647361070534837", "1471647408738926602", "1471648874400583933", 
            "1479177756813299826"
        ]
    },
    "1471648874400583933": { // Formateur SIS
        section: "1461885316431351953", // Section SPCIS
        gerables: ["1471647361070534837"] // Pompier
    },

    // === PARAMÉDIC (EMS) ===
    "1459942281690874009": { // Directeur Paramedic
        section: "1479983160057008128", // Section Paramedic
        gerables: [
            "1465541475444981882", "1479983057212543077", "1465542187180626153", 
            "1479983160057008128", "1479872090218692689", "1479983261781594265", 
            "1465542252066635859", "1465542334870589674", "1465542413258068079", 
            "1465542509324144802", "1465542557990916119", "1479856498795610274", 
            "1479177635245457620"
        ]
    },
    "1465541475444981882": { // Directeur adjoint Paramedic
        section: "1479983160057008128", // Section Paramedic
        gerables: [
            "1465541475444981882", "1479983057212543077", "1465542187180626153", 
            "1479983160057008128", "1479872090218692689", "1479983261781594265", 
            "1465542252066635859", "1465542334870589674", "1465542413258068079", 
            "1465542509324144802", "1465542557990916119", "1479856498795610274", 
            "1479177635245457620"
        ]
    },
    "1479856498795610274": { // Formateurs Ambulanciers
        section: "1479983160057008128", // Section Paramedic
        gerables: ["1465542509324144802"] // Paramédic soins primaires
    },

    // === MINISTÈRE DES TRANSPORTS (MTQ) ===
    "1465908621261930764": { // Ministres
        section: "1465539316896891117", // Section MTQ
        gerables: ["1465909106576461917", "1465909025529921649", "1465909682647597203"] // Direction, Chefs, Patrouilleurs
    },
    "1465909106576461917": { // Direction MTQ
        section: "1465539316896891117", // Section MTQ
        gerables: ["1465909106576461917", "1465909025529921649", "1465909682647597203"] // Direction, Chefs, Patrouilleurs
    },

    // === CENTRE DE GESTION DES APPELS (CGA) ===
    "1475977431696281695": { // Direction CGA
        section: "1465539316896891117", // Section MTQ (Ou change par l'id de section CGA si différente)
        gerables: [
            "1475977431696281695", "1475977802057515108", "1475978018320023786", 
            "1475977947419508862", "1476064914647814155", "1475978074104529137", 
            "1475978489499877417", "1475978168111333387", "1475978225476833464", 
            "1475978285447118930", "1475978342892306433", "1475978873953976411", 
            "1476058312456933416"
        ]
    },
    "1475977802057515108": { // Directeur adjoint CGA
        section: "1465539316896891117", // Section MTQ
        gerables: [
            "1475977431696281695", "1475977802057515108", "1475978018320023786", 
            "1475977947419508862", "1476064914647814155", "1475978074104529137", 
            "1475978489499877417", "1475978168111333387", "1475978225476833464", 
            "1475978285447118930", "1475978342892306433", "1475978873953976411", 
            "1476058312456933416"
        ]
    },
    "1475978873953976411": { // Formateur CGA
        section: "1465539316896891117", // Section MTQ
        gerables: ["1475978074104529137"] // Opérateur CGA
    }
};

client.once('ready', async () => {
    try {
        console.log('Connexion réussie à Discord.');
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { 
            body: [{ name: 'panel', description: 'Afficher le panel de promotion interactif' }] 
        });
        console.log('Commandes slash configurées avec succès.');
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes :', error);
    }
});

client.on('interactionCreate', async interaction => {
    // 1. COMMANDE /PANEL
    if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
        // Vérifier si l'utilisateur possède au moins un des rôles du staff autorisés
        const hasPermission = interaction.member.roles.cache.some(role => ROLES_AUTORISES.includes(role.id));
        
        if (!hasPermission) {
            return await interaction.reply({ 
                content: "❌ Vous n’avez pas la permission d’utiliser cette commande.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ouvrir_formulaire_promo')
                .setLabel('Gérer une promotion / rétrogradation')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ 
            content: "### 🏢 Panel de Gestion des Promotions - Sherbrooke\nCliquez sur le bouton ci-dessous pour modifier le grade d'un membre.", 
            components: [row], 
            flags: [MessageFlags.Ephemeral] 
        });
    }

    // 2. OUVERTURE DU FORMULAIRE (MODAL)
    if (interaction.isButton() && interaction.customId === 'ouvrir_formulaire_promo') {
        const modal = new ModalBuilder()
            .setCustomId('promo_modal')
            .setTitle('Gestion Promotion Sherbrooke');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('user_id')
                    .setLabel('ID Discord du membre')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex : 382839482938491823')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('role_id')
                    .setLabel('ID du Rôle à donner ou enlever')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex : 1469136986747961575')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('action_type')
                    .setLabel('Action : "add" pour ajouter, "remove" pour enlever')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('add / remove')
                    .setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }

    // 3. TRAITEMENT ET VALIDATION DU FORMULAIRE
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'promo_modal') {
        const userId = interaction.fields.getTextInputValue('user_id').trim();
        const roleId = interaction.fields.getTextInputValue('role_id').trim();
        const actionType = interaction.fields.getTextInputValue('action_type').trim().toLowerCase();

        if (actionType !== 'add' && actionType !== 'remove') {
            return await interaction.reply({ 
                content: "❌ L'action saisie doit être strictement `add` ou `remove`.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        // Recherche d'un rôle du modérateur lui donnant le droit de gérer ce rôle cible
        const staffRoleId = Object.keys(CONFIG).find(sId => 
            interaction.member.roles.cache.has(sId) && CONFIG[sId].gerables.includes(roleId)
        );

        if (!staffRoleId) {
            return await interaction.reply({ 
                content: "❌ Vous n'avez pas la permission administrative d'attribuer ou de retirer ce grade spécifique.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        const currentConfig = CONFIG[staffRoleId];

        try {
            const targetMember = await interaction.guild.members.fetch(userId);
            
            if (actionType === 'add') {
                // Ajouter le rôle ET ajouter la section associée
                await targetMember.roles.add([roleId, currentConfig.section]);
                await interaction.reply({ 
                    content: `✅ **Promotion réussie** : Le grade et la section associés ont été attribués à **${targetMember.displayName}**.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            } else {
                // Enlever le rôle ET enlever la section associée
                await targetMember.roles.remove([roleId, currentConfig.section]);
                await interaction.reply({ 
                    content: `✅ **Modification réussie** : Le grade et la section associés ont été retirés à **${targetMember.displayName}**.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ **Une erreur est survenue** : L'ID de l'utilisateur est introuvable sur ce serveur OU le rôle du bot n'est pas assez haut dans la liste des rôles.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }
});

if (!process.env.TOKEN) {
    console.error("Erreur critique : La variable TOKEN est manquante !");
    process.exit(1);
}

client.login(process.env.TOKEN.trim());
