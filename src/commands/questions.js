const { SlashCommandBuilder } = require('@discordjs/builders')
const { defer, reply } = require('../helpers/interaction-helper')
const { getGuildAsync, saveGuildAsync } = require('../helpers/guild-data')
const { caseInsensitiveSort } = require('../helpers/sort-helper')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { arrayIncludesString } = require('../helpers/array-helper')

async function showQuestions (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const category = interaction.options.getString('category')
  const questions = guild.questions[category]

  if (questions.length === 0) {
    await reply(interaction, `Er zijn nog geen vragen aangemaakt voor het type '${category}'!`)
    return
  }

  // build reply
  const desc = questions
    .sort(caseInsensitiveSort)
    .map(list => `\u2022 ${list}`)
    .join('\n')

  const embed = new EmbedBuilder()
    .setTitle(category)
    .setDescription(desc)

  // send reply
  await reply(interaction, { content: ' ', embeds: [embed] })
}

async function addNewQuestion (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const category = interaction.options.getString('category')
  const question = interaction.options.getString('question')
  const existingQuestions = guild.questions[category]

  // verify name
  if (arrayIncludesString(existingQuestions, question, false)) {
    await reply(interaction, `De vraag '${question}' bestaat al voor het type '${category}'!`)
    return
  }

  guild.questions[category].push(question)
  await saveGuildAsync(guild)

  await reply(interaction, `De vraag '${question}' is aangemaakt voor het type '${category}'`)
}

async function removeQuestion (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const category = interaction.options.getString('category')
  const question = interaction.op.getString('question')

  if (!arrayIncludesString(guild.questions[category], question, false)) {
    await reply(interaction, `De vraag '${question}' bestaat niet voor het type '${category}'!`)
    return
  }

  guild.questions[category].remove(question)
  await saveGuildAsync(guild)

  await reply(interaction, `De vraag '${question}' is verwijderd uit het type '${category}'`)
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('questions')
    .setDescription('Beheer de verschillende vragen die de bot stelt')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sc => sc
      .setName('show')
      .setDescription('Toon alle vragen per type')
      .addStringOption(so => so
        .setName('category')
        .setDescription('De category waar je de vragen van wil zien')
        .setRequired(true)
        .setAutocomplete(true)))

    .addSubcommand(sc => sc
      .setName('add')
      .setDescription('Voeg een nieuw vraag toe')
      .addStringOption(so => so
        .setName('category')
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
        .setName('category')
        .setDescription('De categorie waaruit je een vraag wil verwijderen')
        .setRequired(true)
        .setAutocomplete(true))
      .addStringOption(so => so
        .setName('question')
        .setDescription('De vraag die je wil verwijderen')
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
