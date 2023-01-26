const { SlashCommandBuilder } = require('@discordjs/builders')
const { reply, defer } = require('../helpers/interaction-helper')
const { getGuildAsync, saveGuildAsync } = require('../helpers/guild-data')
const { arrayIncludesString } = require('../helpers/array-helper')
const { caseInsensitiveSort } = require('../helpers/sort-helper')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

async function showCategories (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const existingCategories = Object.keys(guild.questions)

  if (existingCategories.length === 0) {
    await reply(interaction, 'Er zijn nog geen vraagtypes aangemaakt op deze server!')
    return
  }

  // build reply
  const desc = existingCategories
    .sort(caseInsensitiveSort)
    .map(list => `\u2022 ${list}`)
    .join('\n')

  const embed = new EmbedBuilder()
    .setTitle('Vraagtypes')
    .setDescription(desc)

  // send reply
  await reply(interaction, { content: ' ', embeds: [embed] })
}

async function addCategory (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const categoryName = interaction.options.getString('name')
  const existingCategories = Object.keys(guild.questions)

  // verify name
  if (arrayIncludesString(existingCategories, categoryName, false)) {
    await reply(interaction, `Het vraagtype '${categoryName}' bestaat al!`)
    return
  }

  guild.questions[categoryName] = []
  await saveGuildAsync(guild)

  await reply(interaction, `Het vraagtype '${categoryName}' is aangemaakt`)
}

async function renameCategory (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const categoryName = interaction.options.getString('name')
  const newName = interaction.options.getString('new_name')
  const existingCategories = Object.keys(guild.questions)

  // verify name
  if (!arrayIncludesString(existingCategories, categoryName, false)) {
    await reply(interaction, `Het vraagtype '${categoryName}' bestaat niet!`)
    return
  }

  // verify name
  if (arrayIncludesString(existingCategories, newName, true)) {
    await reply(interaction, `Het vraagtype '${newName}' bestaat al!`)
    return
  }

  guild.questions[newName] = guild.questions[categoryName]
  delete guild.questions[categoryName]
  await saveGuildAsync(guild)

  await reply(interaction, `Het vraagtype '${categoryName}' heet nu '${newName}'`)
}

async function removeCategory (interaction) {
  // parse interaction
  const guild = await getGuildAsync(interaction.guildId)
  const categoryName = interaction.options.getString('name')
  const existingCategories = Object.keys(guild.questions)

  // verify name
  if (!arrayIncludesString(existingCategories, categoryName, false)) {
    await reply(interaction, `Het vraagtype '${categoryName}' bestaat niet!`)
    return
  }

  delete guild.questions[categoryName]
  await saveGuildAsync(guild)

  await reply(interaction, `Het vraagtype '${categoryName}' is verwijderd`)
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('categories')
    .setDescription('De verschillende types vragen')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sc => sc
      .setName('show')
      .setDescription('Toon alle vraagtypes'))

    .addSubcommand(sc => sc
      .setName('add')
      .setDescription('Voeg een nieuw type vraag toe')
      .addStringOption(so => so
        .setName('name')
        .setDescription('De naam van het nieuwe type')
        .setRequired(true)))

    .addSubcommand(sc => sc
      .setName('rename')
      .setDescription('Hernoem een vraag type')
      .addStringOption(so => so
        .setName('name')
        .setDescription('Het type dat je een nieuwe naam wilt geven')
        .setRequired(true)
        .setAutocomplete(true))
      .addStringOption(so => so
        .setName('new_name')
        .setDescription('De nieuwe naam voor dit type vraag')
        .setRequired(true)))

    .addSubcommand(sc => sc
      .setName('remove')
      .setDescription('Verwijder een vraag type')
      .addStringOption(so => so
        .setName('name')
        .setDescription('Het type dat je wil verwijdern')
        .setRequired(true)
        .setAutocomplete(true))),

  async execute (interaction) {
    await defer(interaction)
    await reply(interaction, 'thinking...')

    switch (interaction.options.getSubcommand()) {
      case 'show':
        await showCategories(interaction)
        break
      case 'add':
        await addCategory(interaction)
        break
      case 'rename':
        await renameCategory(interaction)
        break
      case 'remove':
        await removeCategory(interaction)
        break
    }
  }

}
