// Import relevant classes from packages
const { Client, GatewayIntentBits, Collection } = require('discord.js')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs')
// Import commands
// Import helpers
const log = require('./helpers/logger')
const { reply } = require('./helpers/interaction-helper')
const { addAutocompleteOptions } = require('./helpers/autocomplete-helper')
const { modalHelper } = require('./helpers/modal-helper')
const { scheduleTasksAsync } = require('./tasks/task-manager')

require('dotenv').config()
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

if (!DISCORD_TOKEN) {
  const err = new Error('Failed to start bot! No DISCORD_TOKEN found in .env file.')
  log.error(err)
  throw err
}

if (!CLIENT_ID) {
  const err = new Error('Failed to start bot! No CLIENT_ID found in .env file.')
  log.error(err)
  throw err
}

// init client
const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN)
const intents = [GatewayIntentBits.Guilds]
const client = new Client({ intents })

// load commands
const commands = []
let cmds = []
client.commands = new Collection()
try {
  cmds = fs.readdirSync('./src/commands').filter(f => f.endsWith('.js')).map(file => require(`./commands/${file}`))
} catch (error) {
  log.error(error)
}
for (const command of cmds) {
  client.commands.set(command.data.name, command)
  commands.push(command.data.toJSON())
}

// register commands
;(async function () {
  try {
    log.info('Refreshing application commands')
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    }
  } catch (error) { log.error(error) }
})()

// handlers
async function executeCommand (interaction) {
  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    log.error(error)
    await reply(interaction, { content: 'Oei, ik ben nie mee', ephemeral: true })
  }
}

async function populateAutocomplete (interaction) { await addAutocompleteOptions(interaction) }

async function handleModalSubmit (interaction) { await modalHelper(interaction) }

// register lifecycle handlers
client.on('ready', _ => {
  log.info(`Logged in as ${client.user.tag}!`)
  scheduleTasksAsync(client).then(_ => log.info('set up tasks'))
})

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) executeCommand(interaction)
  else if (interaction.isAutocomplete()) populateAutocomplete(interaction)
  else if (interaction.isModalSubmit()) handleModalSubmit(interaction)
})

// authenticate bot
client.login(process.env.DISCORD_TOKEN)
