const { ApplicationCommandOptionType } = require('discord.js')
const { defer } = require('./interaction-helper')
const { getGuildAsync } = require('./guild-data')
const { stringIncludes } = require('./string-helper')
const { caseInsensitiveSort } = require('./sort-helper')
const { AUTOCOMPLETE_MAX_RESULTS } = require('../constants')

async function addAutocompleteOptions (interaction) {
  await defer(interaction)
  switch (interaction.commandName) {
    case 'categories':
      await addCategoriesAutocompleteOptions(interaction)
      break
  }
}

async function addCategoriesAutocompleteOptions (interaction) {
  const { optionName, optionValue } = parseInteraction(interaction)

  let data = null
  if (optionName === 'name') {
    const guild = await getGuildAsync(interaction.guildId)
    const existingCategories = Object.keys(guild.questions)
    const filtered = existingCategories.filter(c => !optionValue || stringIncludes(c, optionValue, false))
    if (filtered.length > 0) {
      data = filtered
        .sort(caseInsensitiveSort)
        .slice(0, AUTOCOMPLETE_MAX_RESULTS)
        .map(c => ({ name: c, value: c }))
    }
  }
  await interaction.respond(data)
}

function parseInteraction (interaction) {
  const subCommand = interaction.options.data.find(o => o.type === ApplicationCommandOptionType.Subcommand)?.name
  const focusedOption = interaction.options.getFocused(true)
  const optionName = focusedOption.name
  const optionValue = focusedOption.value
  return { subCommand, optionName, optionValue }
}

module.exports = { addAutocompleteOptions }
