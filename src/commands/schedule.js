const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { defer, reply } = require('../helpers/interaction-helper')
const { getGuildAsync, saveGuildAsync } = require('../helpers/guild-data')
const { arrayIncludesString } = require('../helpers/array-helper')
const questionnaireTasks = require('../tasks/question-scheduler')

const cronSyntaxRegex = /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5}/

async function showTriggers (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const triggers = guild.questionTriggers

  if (triggers.length === 0) {
    await reply(interaction, 'Er zijn nog geen bevragingen aangemaakt op deze server!')
    return
  }

  // build reply
  const desc = triggers
    .map(list => `\u2022 ${list.cron} - ${list.category}`)
    .join('\n')

  const embed = new EmbedBuilder()
    .setTitle('Bevragingen')
    .setDescription(desc)

  // send reply
  await reply(interaction, { content: ' ', embeds: [embed] })
}

async function addTrigger (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const category = interaction.options.getString('category')
  const cron = interaction.options.getString('schedule')

  if (!cronSyntaxRegex.test(cron)) {
    await reply(interaction, 'Cron syntax voor timing is niet correct!')
    return
  }

  if (!arrayIncludesString(Object.keys(guild.questions), category, false)) {
    await reply(interaction, 'Gekozen vraagtype bestaat niet')
    return
  }

  const newTrigger = { cron, category }
  guild.questionTriggers.push(newTrigger)
  await saveGuildAsync(guild)

  questionnaireTasks.scheduleQuestionnaire(cron, category, interaction.guildId, interaction.client)
  await reply(interaction, 'bevraging toegevoegd.')
}

async function removeTrigger (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const category = interaction.options.getString('category')
  const cron = interaction.options.getString('schedule')

  const trigger = guild.questionTriggers.find(t => t.cron === cron && t.category === category)
  if (!trigger) {
    await reply(interaction, 'gekozen bevraging bestaat niet!')
    return
  }

  await questionnaireTasks.removeTrigger(trigger.cron, trigger.category, interaction.guildId)
  guild.questionTriggers.remove(trigger)
  await saveGuildAsync(guild)
  await reply(interaction, 'bevraging is verwijderd')
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Beheer de momenten dat vragen gesteld worden')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sc => sc
      .setName('show')
      .setDescription('Toon alle bevragingen'))

    .addSubcommand(sc => sc
      .setName('add')
      .setDescription('Voeg een bevraging toe')
      .addStringOption(so => so
        .setName('category')
        .setDescription('Het vraagtype dat bevraagd moet worden')
        .setRequired(true)
        .setAutocomplete(true))
      .addStringOption(so => so
        .setName('schedule')
        .setDescription('De timing waarop bevraagd moet worden. (cron syntax) [dagelijks is "mm hh * * *"]\'')
        .setRequired(true)))

    .addSubcommand(sc => sc
      .setName('remove')
      .setDescription('Verwijder een Trigger')
      .addStringOption(so => so
        .setName('category')
        .setDescription('Het vraagtype dat bevraagd moet worden')
        .setRequired(true)
        .setAutocomplete(true))
      .addStringOption(so => so
        .setName('schedule')
        .setDescription('De timing waarop bevraagd moet worden. (cron syntax) [dagelijks is "mm hh * * *"]\'')
        .setRequired(true)
        .setAutocomplete(true))),

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
