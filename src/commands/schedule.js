const { SlashCommandBuilder } = require('@discordjs/builders')
const { defer, reply } = require('../helpers/interaction-helper')

async function showTriggers (interaction) {}

async function addTrigger (interaction) {}

async function removeTrigger (interaction) {}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Beheer de momenten dat vragen gesteld worden')

    .addSubcommand(sc => sc
      .setName('show')
      .setDescription('Toon alle bevragingen'))

    .addSubcommand(sc => sc
      .setName('add')
      .setDescription('Voeg een bevraging toe'))

    .addSubcommand(sc => sc
      .setName('rename')
      .setDescription('Hernoem een vraag type'))

    .addSubcommand(sc => sc
      .setName('remove')
      .setDescription('Verwijder een Trigger')),

  async execute (interaction) {
    await defer(interaction)
    await reply(interaction, 'thinking...')

    switch (interaction.options.getSubcommand()) {
      case 'show':
        await showTriggers(interaction)
        break
      case 'add':
        await addTrigger(interaction)
        break
      case 'remove':
        await removeTrigger(interaction)
        break
    }
  }

}
