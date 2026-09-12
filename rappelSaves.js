const fs = require('fs');
const path = require('path');
const rappelsPath = path.join('rappel/rappels.json');

function loadRappels() {
    if (!fs.existsSync(rappelsPath)) return [];
    try {
        return JSON.parse(fs.readFileSync(rappelsPath));
    } catch {
        return [];
    }
}

function saveRappels(rappels) {
    fs.writeFileSync(rappelsPath, JSON.stringify(rappels, null, 2));
}

function addRappel(rappel) {
    let rappels = loadRappels();
    rappels = rappels.filter(r =>
        !(r.salonId === rappel.salonId && r.message === rappel.message && r.deadline === rappel.deadline)
    );

    rappels.push(rappel);
    saveRappels(rappels);
}

function cleanOldRappels() {
    const { DateTime } = require('luxon');
    let rappels = loadRappels();
    const now = DateTime.now().setZone('Europe/Paris');
    rappels = rappels.filter(r => DateTime.fromISO(r.deadline) > now);
    saveRappels(rappels);
}

module.exports = { loadRappels, addRappel, cleanOldRappels, saveRappels };