const { SlashCommandBuilder } = require('@discordjs/builders')
const { defer, reply } = require('../helpers/interaction-helper')

async function showQuestions (interaction) {}

async function addNewQuestion (interaction) {}

async function removeQuestion (interaction) {}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('questions')
    .setDescription('Beheer de verschillende vragen die de bot stelt')

    .addSubcommand(sc => sc
      .setName('show')
      .setDescription('Toon alle vragen per type'))

    .addSubcommand(sc => sc
      .setName('add')
      .setDescription('Voeg een nieuw vraag toe')
      .addStringOption(so => so
        .setName('question_type')
        .setDescription('Het type voor deze vraag')
        .setRequired(true)
        .setAutocomplete(true))
      .addStringOption(so => so
        .setName('question')
        .setDescription('De nieuwe vraag')
        .setRequired(true)))

    .addSubcommand(sc => sc
      .setName('remove')
      .setDescription('Verwijder een vraag')
      .addStringOption(so => so
        .setName('question')
        .setDescription('De vraag die je wil verwijdern')
        .setRequired(true)
        .setAutocomplete(true))),

  async execute (interaction) {
    await defer(interaction)
    await reply(interaction, 'thinking...')

    switch (interaction.options.getSubcommand()) {
      case 'show':
        await showQuestions(interaction)
        break
      case 'add':
        await addNewQuestion(interaction)
        break
      case 'remove':
        await removeQuestion(interaction)
        break
    }
  }

}
