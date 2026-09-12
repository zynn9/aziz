const {token} = require("./config.json");
const { planifierRappels } = require('./rappelScheduler.js');
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder, InteractionType } = require('discord.js');
const rappelCommand = require('./rappel.js');
const { faq } = require("./faq.js");
const listeRappels = require("./rappel_liste.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds],
    restTimeOffset: 500,
    restRequestTimeout: 30000,
    retryLimit: 5,
    restSweepInterval: 300,
    restGlobalRateLimit: 50,
    failIfNotExists: false,
    ws: {
        compress: false,
        large_threshold: 50,
        properties: {
            browser: 'Discord.js',
            device: 'Discord.js',
            os: 'linux'
        }
    }
});

client.once(Events.ClientReady, async () => {
    const guild = await client.guilds.fetch('srv_id');
    planifierRappels(client);

    const commands = [
    new SlashCommandBuilder()
      .setName('faq')
      .setDescription("Vous avez des questions à propos de votre scolarité à l'ESGI ?"),

    new SlashCommandBuilder()
      .setName('rappel')
      .setDescription('Planifie un rappel pour un projet/devoir')
      .addChannelOption(option =>
        option.setName('salon')
          .setDescription('Choisissez le salon où envoyer le rappel :')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('date')
          .setDescription('Entrez la date du rendu (ex : 01-12-2026 12:00)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('message')
          .setDescription('Nom du projet/devoir et mention du rôle nécessaire :')
          .setRequired(true)),
        
    new SlashCommandBuilder()
        .setName('liste_rappel')
        .setDescription('Liste tous les rappels mis en place')
    ].map(command => command.toJSON());

    await guild.commands.set(commands);
    console.log("Bot connecté");
    });


client.on(Events.InteractionCreate, async interaction => {
    if (interaction.type === InteractionType.ApplicationCommand && interaction.commandName === 'faq') {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ content: 'Sélectionnez le sujet vous concernant.', components: faq });
        return;
    } 
    if (interaction.commandName === 'rappel') {
        try {
            await rappelCommand.execute(interaction);
        }catch(error){
            console.error("Erreur dans rappel :", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Une erreur est survenue lors de la planification du rappel.', ephemeral: true });
            }           
        }
        return;
    }

        if (interaction.commandName === 'liste_rappel') {
            try {
                await listeRappels.execute(interaction);
            }catch(error) {
                console.error('Erreur dans /liste_rappel :', error);
                if(!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "Une erreur est survenue dans l'exécution de la commande.",
                        ephemeral: true
                    });
                }
            }
        }

    if (interaction.isButton()) {
        if (interaction.message.createdTimestamp < Date.now() - 15 * 60 * 1000) {
            return;
        }

        if (interaction.customId === 'retour') {
            await interaction.update({
                content: 'Sélectionnez le sujet vous concernant.',
                components: faq,
                ephemeral: true
            });
            return;
        }

        let reply;
        let nextRow;

        const retourMenu = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('retour')
                .setLabel('Retour')
                .setStyle(ButtonStyle.Secondary)
        );


    if (interaction.customId === 'helpeductive') {
        reply = '❔ HelpEductive :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel("HelpEductive").setURL('https://helpeductivereims.vercel.app/').setStyle(ButtonStyle.Link),
        );
    }
    
        // Absences
    if (interaction.customId === 'absences') {
        reply = '📅 Absences :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('abs_autorise').setLabel("Infos absences").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('abs_regulariser').setLabel('Régulariser ses absences').setStyle(ButtonStyle.Danger)
        );
    }

    // Administration
    else if (interaction.customId === 'administration') {
        reply = '📝 Administration :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('admin_mail').setLabel('Qui contacter ?').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('admin_horaire').setLabel('Déplacer un cours').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('admin_endroit').setLabel('Où nous trouver ?').setStyle(ButtonStyle.Primary)
        );
    }

    // Relations entreprises
    else if (interaction.customId === 'relations_entreprises') {
        reply = '💼 Votre alternance :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('re_rythme').setLabel('Rythme alternance').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('re_rapport').setLabel('Rapport activité').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('re_alternance').setLabel('Dernier délai alternance').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('re_offres').setLabel('Offres, coaching et speedmeeting').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setLabel('Grille salaire').setURL('https://drive.proton.me/urls/2ENBA8DMR8#vTFUZXfrLBKm').setStyle(ButtonStyle.Link)
        );
    }

    // Remboursement
    else if (interaction.customId === 'remboursement') {
        reply = '💸 Remboursement & aides :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rb_frais').setLabel('Frais de dossier').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('rb_bourse').setLabel('Bourse').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel('Aide au premier équipement').setURL('https://helpeductivereims.vercel.app/').setStyle(ButtonStyle.Link),
            new ButtonBuilder().setLabel('Aide au permis').setURL('https://helpeductivereims.vercel.app/').setStyle(ButtonStyle.Link)
        );
    }

    // Programme OPEN
    else if (interaction.customId === 'openlabs') {
        reply = '🍻 Programme OPEN :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_cestquoi').setLabel('Le programme OPEN ?').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('open_activites').setLabel('Quelles activités ?').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('open_travailler').setLabel('Job étudiant/alternance pris en compte ?').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('open_ambassadeur').setLabel('Devenir ambassadeur').setStyle(ButtonStyle.Danger)
        );
    }

    // Vie au campus
    else if (interaction.customId === 'vie_campus') {
        reply = '🛜 La vie au campus :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('campus_carte_etudiante').setLabel('Obtenir ma carte étudiante').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('campus_certification').setLabel('Certifications').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('campus_mobilite').setLabel('Changer de campus/mobilité internationale').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('campus_evenement').setLabel('Les évènements du campus').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('campus_mdpwifi').setLabel('Wifi ESGI').setStyle(ButtonStyle.Danger)
        );
    }

    // CVEC
    else if (interaction.customId === 'cvec') {
        reply = '📬 La CVEC :';
        nextRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('cvec_cestquoi').setLabel("C'est quoi la CVEC ?").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cvec_envoi').setLabel('A qui envoyer sa CVEC ?').setStyle(ButtonStyle.Success)
        );
    }

    // Absences
    else if (interaction.customId === 'abs_autorise') {
        reply = 'Chaque absence à un cours d’une durée de 1h30 est considérée comme une absence (exemple : 4h30 de cours = 3 absences).\nL’absence à un cours pendant lequel un intervenant procède à une interrogation, programmée ou non, entraînera la note de 0/20 même avec présentation d’un justificatif.\n*L’intervenant ne fournira aucun devoir de rattrapage pour les apprenants absents.*';
    }

    else if (interaction.customId === 'abs_regulariser') {
        reply = 'Afin de régulariser vos absences il est obligatoire d’avoir un justificatif valide et de l’envoyer au mail : scolarite@eductive-reims.fr **sous 48h**.\n__Voici la liste des justificatifs acceptés :__\n- Arrêt de travail\n- Certificat médical (si vous n’êtes pas alternant)\n- Convocation d’état (permis de conduire, tribunal)\n- Rendez-vous médical avec un spécialiste (2 créaneaux d’absences maximum)\n- Enterrement (avec un acte de décès)\n- Entretien d’embauche pour une alternance.';
    }

    // Relations entreprises
    else if (interaction.customId === 're_rythme') {
       reply = 'Le rythme en alternance est trois jours en entreprise et deux jours sur le campus en B2. Puis de B3 à M2, il est de trois semaines en entreprise et une semaine sur le campus.';
    }

    else if (interaction.customId === 're_rapport') {
        reply = "Les rendus du rapport d'activités sont à rendre le 01/08/2025 pour le stage des B1 et le 27/06/2025 pour les alternants.\nVotre rapport doit contenir la clause de confidentialité, la fiche identité entreprise (1er tiers de la page de l'évaluation entreprise) et l'évaluation de l'entreprise **uniquement** pour les rapports de stage.\nIl doit être rendu en ligne sur le portail myGES et en format papier relié à votre CRE ou dans la boîte aux lettres du campus.";
    }

    else if (interaction.customId === 're_alternance') {
        reply = 'Vous avez jusqu’au 30 novembre 2026 pour trouver une alternance, à partir de là vous pouvez choisir de payer le montant total de votre année ou de payer chaque mois pendant votre recherche d’alternance.';
    }

    else if (interaction.customId === 're_offres') {
       reply = "**Les offres**\nLes CRE vous font des offres régulières qui vous sont envoyées par mail ou prochainement dans l'onglet 'Entreprise' sur myGES/Skolae.\n\n**Les coachings**\nC'est à vous de soliciter votre CRE référent afin de poser un créneau de rendez-vous.\n\n**Les speedmeetings**\nVous pouvez retrouver les offres de speedmeetings sur Skolae, chaque mois la plateforme ouvre 8 jours avant la date pour que vous puissiez y prendre un créneau. Vous n'avez pas de confirmation par mail alors n'oubliez pas de vous y présenter !\nSi vous n'avez pas de retour de leur part, les CRE n'en ont pas non plus.";
    }

    // Remboursement & aide
    else if (interaction.customId === 'rb_frais') {
        reply = "Vous êtes éligible à un remboursement des frais de dossier à hauteur de 280€ si vous avec un contrat d'apprentissage. Pour cela, il faut faire la demande directement depuis l'espace myGES en remplissant le formulaire prévu à cet effet.";
    }

    else if (interaction.customId === 'rb_bourse') {
        reply = "Notre établissement n'est pas éligible à la bourse.";
    }

    // Programme OPEN
    else if (interaction.customId === 'open_cestquoi') {
        reply = "Le programme OPEN a pour but de proposer à l'école et ses étudiants de s'ouvrir sur de nouvelles problématiques et d'instaurer de nouveaux contacts entre les étudiants ainsi qu’avec le monde extérieur.\nIl y a 2 rendu par an pour les bachelors et 1 rendu par an pour les mastères, les dates de rendu sont communiquées en début d'année.\nTous les axes sont obligatoires, sinon vous perderez 1 point par axe non rempli.\nSont exemptés sur programme OPEN les membres du BDE, les ambassadeurs, les étudiants participant à zupdeco.";
    }

    else if (interaction.customId === 'open_activites') {
    const embed = new EmbedBuilder()
        .setTitle('Les différentes activités du programme OPEN')
        .setDescription(`(A risque de changement depuis la correction par IA)
        *Vous devez réaliser 1 activité de chaque axe sinon -1 point par axe non abordé*
        📍 **Entreprise**
        • Interview de professionnels ou vidéo métier → \`2 Opens\` (max 1/semestre)
        • Organisation d'une conférence professionnelle → \`5 Opens\`
        • Participation à une conférence pro interne → \`2 Opens\`
        • Participation à une conférence pro externe liée aux études → \`1 Open\` (max 2/semestre)
        • Visite d'un salon professionnel → \`1 Open\` (max 2/semestre)
        • Stage / emploi / alternance en cours d'année → \`6 Opens\` / semestre

        🤝 **Esprit d'équipe**
        • Responsabilités au sein du BDE → \`4 à 8 Opens\` / semestre
        • Responsabilités dans une autre association → \`2 à 6 Opens\` / semestre
        • Participation aux activités BDE ou asso → \`1.5 Opens\` / activité (max 9/semestre)
        • Participation à une soirée / afterwork BDE → \`1.5 Opens\` / event (max 3/semestre)
        • Participation à un voyage BDE → \`2 Opens\`
        • Mise en place d'une action humanitaire → \`3 Opens\` / semestre
        • Cooptation d'un étudiant en entreprise (stage/alternance) → \`2 Opens\` / semestre

        🏆 **Challenge**
        • Pratique personnelle de haut niveau (sport, arts…) → \`4 Opens\` / semestre
        • Réussite d'une certification professionnelle → \`2 Opens\` / certification
        • Apprentissage d'une 2e langue vivante → \`2 Opens\` / semestre

        📣 **Communication**
        • Présentation de l'école dans un lycée, BTS ou BUT → \`5 Opens\`
        • Présence sur salon → \`6 Opens\` / jour + \`+1 Open\` par story (1 story/event, 3 max/semestre)
        • Présence JPO → \`5 Opens\` / jour + \`+1 Open\` par story (idem)
        • Soirée Portes Ouvertes ou réunions info → \`3 Opens\` / jour + \`+1 Open\` par story
        • Tournage témoignage étudiant → \`10 Opens\`
        • 15 posts en taguant l'école (cours, groupes, projets...) → \`10 Opens\`
        • Participation à un Live Ambassadeur → \`2 Opens\`

        🌍 **Ouverture sur l'extérieur**
        • Visite d'un musée ou exposition → \`1.5 Opens\` (max 3/semestre)
        • Implication dans une asso externe → \`1.5 Opens\` / semestre
        • Assister à une pièce de théâtre ou opéra → \`1.5 Opens\` / semestre
        • Actions culturelles : concert, festival, match, stand-up, cinéma → \`1.5 Opens\` / activité
        • Projets personnels (à proposer) → \`jusqu'à 5 Opens\` / semestre

        N'oublie pas de fournir les justificatifs originaux pour les actions externes !`)
        .setColor(0xb53737);
    await interaction.reply({ embeds: [embed],ephemeral: true });
    return;
    }

    else if (interaction.customId === 'open_travailler') {
        reply = 'Oui ! Un job étudiant vous rapporte 1,5 point dans la catégorie ouverture sur l’extérieur. Votre alternance vous rapporte 6 points sur le programme OPEN.';
    }

    else if (interaction.customId === 'open_ambassadeur') {
        reply = 'Un ambassadeur ne participe pas au programme OPEN. En revanche, il doit se montrer présent sur plus de la moitié des évènements organisés.\nPour devenir ambassadeur, envoyez un mail au service communication : communication-reims@eductive.fr pour faire la demande.';
    }

    // Vie au campus
    else if (interaction.customId === 'campus_carte_etudiante') {
        reply = 'Votre carte étudiante est commandée vers le mois de novembre si et seulement si une photo a été mise en ligne sur votre profil et que vous êtes à jour avec la CVEC. Vous la recevrez de façon dématérialisée sur votre boite mail.';
    }

    else if (interaction.customId === 'campus_evenement') {
        reply = "Au fil de l'année différentes activités sont organisées (aussi des LAN party 😏) par le campus et le BDE. Retrouvez nous sur instagram : **eductive_reims** et **bde.osmoz** pour être au courant de tous nos évènements !";
    }

    else if (interaction.customId === 'campus_certification') {
        reply = "Durant vos études vous allez devoir passer plusieurs certifications selon votre école et vos spécialités dont le TOEIC. Ce certificat est valable 2 ans, vous devez le passer en B3 pour obtenir votre bachelor et ensuite, vous devez obtenir 750 points minimum et 11 de moyenne général en anglais en M2 afin d'obtenir votre diplôme.\nPour plus d'informations sur le TOEIC, je vous invite à vous rendre sur votre espace myGES, dans l'onglet 'scolarité' puis 'TOEIC' ou alors, contacter m.constant@eductive.fr ou flamirand@eductive-reims.fr.\nPour plus d'informations sur vos certifications à passer durant votre scolarité, contactez votre responsable pédagogique.";
    }

    else if (interaction.customId === 'campus_mdpwifi') {
        reply = "Le mot de passe de wifi-esgi_5 : wifi-esgi$*";
    }

    else if (interaction.customId === 'campus_mobilite') {
        reply = "Si vous souhaitez changer de campus, il vous faudra contacter campus-reims@eductive.fr en expliquant les raisons et en rédigeant une lettre de motivation, vous n'avez pas besoin de repasser le concours. Si vous êtes refusé dans le campus demandé vous restez toujours dans celui où vous avez été accepté.\nDurant vos études vous avez l'opportunité de partir durant 1 semestre dans un pays de votre choix affilié avec nos campus. Pour cela, il faut remplir certains critères. Je vous invite à contacter la référente nationale Pauline BERTRAND à cette adresse : campus-reims@eductive.fr afin de voir cet aspect plus en détail.";
    }

    // Administration
    else if (interaction.customId === 'admin_mail') {
        reply = "__SERVICE SCOLARITÉ__ : notes, absences/arrêt de travail, retards, Edusign, e-learning, cours, aide au permis de conduire : **scolarite.reims@eductive.fr**\n\n__SERVICE RELATIONS ENTREPRISES__ : contrats, aide au 1er équipement, coaching, speed-meeting, offres stages et alternances, questions entreprises : Fanny BONOT - **fbonot@eductive-reims.fr**\n\n__SERVICE ADMISSIONS__ : questions sur l'orientation, réinscription, CVEC, frais de dossier/scolarité/caution : **campus-reims@eductive.fr**\n\n__REFERENTE HANDICAP__ : Cheyenne LESOEN **clesoen@eductive-reims.fr**\n\n __ATTACHEE DE PROMOTION__ : \nBachelor : Jennifer ROUSSEL **jroussel@eductive-reims.fr** \nMastere : Jean-Philippe DESSEAUX **jdesseaux06@eductive-reims.fr**";
    }

    else if (interaction.customId === 'admin_horaire') {
        reply = 'Seul l’intervenant peut faire une demande afin de changer l’horaire de son cours. La demande doit se faire au service planning.\nIl est conseiller de bien vérifier son emploi du temps sur **myGES** pour être au courant de tout changement de dernière minute.';
    }

    else if (interaction.customId === 'admin_endroit') {
        reply = "Voici où vous pouvez retrouver les différents services du campus de REIMS.\n\n__Quai 12__\nVous pourrez y retrouver le **service scolarité** dans les bureaux vitrés près de l'entrée. Le **service admission** et le **service relation entreprise** dans les bureaux après la machine à café. Le **service communication** au 4ème étage.\n\n__Justice__\nVous retrouverez le bureau de Jennifer ROUSSEL et Jean-philippe DESSEAUX à droite du hall d'entrée puis Françoise dans les bureaux d'administration pour les objets trouvés.";
    }
    
    // CVEC
    else if (interaction.customId === 'cvec_cestquoi') {
        reply = "La CVEC est la Contribution de vie étudiante et de campus. Elle sert à financer des projets de vie de campus pour améliorer les conditions de vie des étudiants et proposer des activités variées dans plusieurs domaines. N'hésitez pas à vérifier sur le site lorsque la CVEC 2025-2026 est disponible.\nCe lien vous permettra de payer ou de demander un remboursement de votre CVEC : https://cvec.etudiant.gouv.fr/ (attention de bien vérifier l'année demandée !).";
    }

    else if (interaction.customId === 'cvec_envoi') {
        reply = "La CVEC doit être fournie avant le 30 juin 2025 sur : https://skolae.myintranet.online/ avec vos identifiants Skolae reçus sur votre boîte mail.\nSi vous avez des problèmes, connectez vous en navigation privée, allez dans la rubrique 'Réinscription' puis 'Mes démarches' pour y déposer votre CVEC.";
    }

    await interaction.update({
        
        content: reply,
        components: nextRow ? [nextRow, retourMenu] : [retourMenu],
        ephemeral: true
    });
  }
});

client.on('error', error => {
    console.error('Erreur Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection:', error);
});
client.login(token);