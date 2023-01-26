// imports
const fs = require('fs').promises
const path = require('path')
const { readJson, writeJson } = require('./json-store')

// constants
const configFolder = './data/guild-data'
const cache = {}

// create configs folder if it does not exist
;(async function () {
  await fs.mkdir(configFolder).catch(err => {
    if (err.code !== 'EEXIST') throw err
  })
})()

// get path to config file for given guild id
function getConfigFilePath (guildId) {
  return path.join(configFolder, guildId.toString() + '.json')
}

async function getGuildAsync (guildId) {
  if (cache[guildId]) { return cache[guildId] }

  const filePath = getConfigFilePath(guildId)

  let data
  try {
    data = await readJson(filePath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      data = { guildId }
    } else { throw error }
  }
  initGuild(data)
  cache[guildId] = data
  return data
}

async function saveGuildAsync (guildData) {
  await writeJson(guildData, getConfigFilePath(guildData.guildId))
}

function initGuild (guild) {
  if (!guild.questions) guild.questions = {}
  if (!guild.questionTriggers) guild.questionTriggers = []
}

async function getAllGuildsAsync () {
  const guilds = []
  const files = await fs.readdir(configFolder)
  for (const file of files) {
    const split = file.split('.')
    if (split[1] === 'json') {
      guilds.push(await getGuildAsync(split[0]))
    }
  }
  return guilds
}

module.exports = {
  getGuildAsync, saveGuildAsync, getAllGuildsAsync
}
