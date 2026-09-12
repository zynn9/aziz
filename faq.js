const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const faq = [
    new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("❔ HelpEductive").setStyle(ButtonStyle.Link).setURL('https://helpeductivereims.vercel.app/')
    ),

    new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('absences').setLabel('📅 Absence').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('relations_entreprises').setLabel('💼 Alternance').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('remboursement').setLabel('💸 Remboursement & aides').setStyle(ButtonStyle.Success)
    ),
    new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('vie_campus').setLabel('🛜 Vie au campus').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('administration').setLabel('📝 Administration').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cvec').setLabel('📬 CVEC').setStyle(ButtonStyle.Success)
    ),
    new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('openlabs').setLabel('🍻 Programme OPEN').setStyle(ButtonStyle.Danger)
    )
];

module.exports = { faq };