const { DateTime } = require('luxon');
const { loadRappels, cleanOldRappels, saveRappels } = require('./rappelSaves.js');

async function planifierRappels(bot) {
    let rappels = loadRappels();
    const now = DateTime.now().setZone('Europe/Paris');
    const maxDelay = 2147483647;

    for (const r of rappels) {
        const deadline = DateTime.fromISO(r.deadline);
        const delay = deadline.diff(now).as('milliseconds');

        if (delay <= 0) {
            const salon = await bot.channels.fetch(r.salonId).catch(() => null);
            if (salon) {
                await salon.send(r.message).catch(console.error);
            }
            rappels = rappels.filter(rr =>
                !(rr.salonId === r.salonId && rr.message === r.message && rr.deadline === r.deadline)
            );
            saveRappels(rappels);
            continue;
        }

        if (delay > maxDelay) {
            setTimeout(() => {
                planifierRappels(bot);
            }, maxDelay);
            continue;
        }

        setTimeout(async () => {
            const salon = await bot.channels.fetch(r.salonId).catch(() => null);
            if (salon) {
                await salon.send(r.message).catch(console.error);
                let delrappel = loadRappels();
                delrappel = delrappel.filter(reminder =>
                    !(reminder.salonId === r.salonId && reminder.message === r.message && reminder.deadline === r.deadline)
                );
                saveRappels(delrappel);
            }
        }, delay);
    }
    cleanOldRappels();
}

module.exports = { planifierRappels, saveRappels };