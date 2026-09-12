const { DateTime } = require('luxon');
const { addRappel } = require('./rappelSaves.js');

const allowedRoleId = 'role_id';

module.exports = {
    name: 'rappel',
    description: 'Planifie un rappel pour un projet',
    async execute(interaction) {
        const member = interaction.member;

        if (!member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: "Tu n'as pas le rôle requis pour utiliser cette commande.", ephemeral: true });
        }

        const salon = interaction.options.getChannel('salon');
        const dateStr = interaction.options.getString('date');
        const message = interaction.options.getString('message');

        const deadline = DateTime.fromFormat(dateStr, 'dd-MM-yyyy HH:mm', { zone: 'Europe/Paris' });

        if (!deadline.isValid) {
            return interaction.reply({ content: "Format de date invalide. Utilise par exemple `01-12-2026 12:00`.", ephemeral: true });
        }

        const now = DateTime.now().setZone('Europe/Paris');

        if (deadline <= now) {
            return interaction.reply({ content: "La date est déjà passée.", ephemeral: true });
        }

        const rappelTimes = [
            { label: "1 mois", time: deadline.minus({ months: 1 }) },
            { label: "1 semaine", time: deadline.minus({ days: 7 }) },
            { label: "2 jours", time: deadline.minus({ days: 2 }) },
            { label: "1 jour", time: deadline.minus({ days: 1 }) },
            { label: "jour J", time: deadline }
        ];

        for (const rappelTime of rappelTimes) {
            if (rappelTime.time > now) {
                const rappelMessage = rappelTime.label === "jour J" 
                    ? `N'oubliez pas de rendre : ${message} aujourd'hui !`
                    : `Il vous reste ${rappelTime.label} : ${message}`;

                addRappel({
                    salonId: salon.id,
                    message: rappelMessage,
                    deadline: rappelTime.time.toISO()
                });
            }
        }

        const client = interaction.client;
        const { planifierRappels } = require('./rappelScheduler.js');

        setTimeout(() => {
            planifierRappels(client);
        }, 1000);

        await interaction.reply({
            content: `Rappels programmés dans ${salon} pour la date du ${deadline.toLocaleString(DateTime.DATETIME_FULL)}.`,
            ephemeral: true
        });
    }
};