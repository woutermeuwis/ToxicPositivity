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
    case 'questions':
      await addQuestionsAutocompleteOptions(interaction)
      break
  }
}

async function addCategoriesAutocompleteOptions (interaction) {
  const { optionName, optionValue } = parseInteraction(interaction)

  if (optionName === 'name') {
    const categories = await getAllCategoriesForGuild(interaction.guildId, optionValue)
    await interaction.respond(categories)
    return
  }

  await interaction.respond(null)
}

async function addQuestionsAutocompleteOptions (interaction) {
  const { optionName, optionValue } = parseInteraction(interaction)
  switch (optionName) {
    case 'category': {
      const categories = await getAllCategoriesForGuild(interaction.guildId, optionValue)
      await interaction.respond(categories)
      return
    }
    case 'question': {
      // fetch chosen category
      const category = interaction.options.data.find(o => o.type === ApplicationCommandOptionType.Subcommand).options.find(o => o.name === 'category').value
      if (category) {
        const questions = await getAllCategoryQuestionsForGuild(interaction.guildId, category, optionValue)
        await interaction.respond(questions)
        return
      } else {
        const questions = await getAllQuestionsForGuild(interaction.guildId, category, optionValue)
        await interaction.respond(questions)
        return
      }
    }
  }
  await interaction.respond(null)
}

function parseInteraction (interaction) {
  const subCommand = interaction.options.data.find(o => o.type === ApplicationCommandOptionType.Subcommand)?.name
  const focusedOption = interaction.options.getFocused(true)
  const optionName = focusedOption.name
  const optionValue = focusedOption.value
  return { subCommand, optionName, optionValue }
}

async function getAllCategoriesForGuild (guildId, search) {
  const guild = await getGuildAsync(guildId)
  const existingCategories = Object.keys(guild.questions)
  const filtered = existingCategories.filter(c => !search || stringIncludes(c, search, false))
  if (filtered.length === 0) {
    return null
  } else {
    return filtered
      .sort(caseInsensitiveSort)
      .slice(0, AUTOCOMPLETE_MAX_RESULTS)
      .map(c => ({ name: c, value: c }))
  }
}

async function getAllQuestionsForGuild (guildId, search) {
  const guild = await getGuildAsync(guildId)
  const questions = []
  for (const cat of Object.values(guild.questions)) {
    for (const q of cat) {
      if (!search || stringIncludes(q, search, false)) {
        questions.push(q)
      }
    }
  }
  if (questions.length === 0) {
    return null
  } else {
    return questions
      .sort(caseInsensitiveSort)
      .slice(0, AUTOCOMPLETE_MAX_RESULTS)
      .map(c => ({ name: c, value: c }))
  }
}

async function getAllCategoryQuestionsForGuild (guildId, category, search) {
  const guild = await getGuildAsync(guildId)
  const questions = guild.questions[category].filter(q => !search || stringIncludes(q, search, false))
  if (questions.length === 0) {
    return null
  } else {
    return questions
      .sort(caseInsensitiveSort)
      .slice(0, AUTOCOMPLETE_MAX_RESULTS)
      .map(c => ({ name: c, value: c }))
  }
}

module.exports = { addAutocompleteOptions }
