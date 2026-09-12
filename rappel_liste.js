const { DateTime } = require('luxon');
const { loadRappels } = require('./rappelSaves.js');

module.exports = {
    name: 'liste_rappels',
    description: 'Affiche tous les rappels enregistrés',
    async execute(interaction) {

        const rappels = loadRappels();

        if (rappels.length === 0) {
            return interaction.reply({ 
                content: "Aucun rappel enregistré.", 
                ephemeral: true 
            });
        }

        let message = `Rappels enregistrés :\n\n`;

        for (const r of rappels) {
            const date = DateTime.fromISO(r.deadline).toFormat('dd/MM/yyyy HH:mm');
            const salon = await interaction.client.channels.fetch(r.salonId).catch(() => null);
            const nomSalon = salon ? `#${salon.name}` : 'salon inconnu';

            message += `- ${date} dans ${nomSalon} : ${r.message}\n`;
        }

        await interaction.reply({ content: message, ephemeral: true });
    }
};
