const cron = require('cron')
const log = require('../helpers/logger')
const { getAllGuildsAsync, getGuildAsync } = require('../helpers/guild-data')

const tasks = {}

async function scheduleQuestionnairesAsync (client) {
  const guildsData = await getAllGuildsAsync()
  for (const guild of guildsData) {
    for (const trigger of guild.questionTriggers) {
      scheduleQuestionnaire(trigger.cron, trigger.category, guild.guildId, client)
    }
  }
}

function scheduleQuestionnaire (cronSchedule, category, guildId, client) {
  tasks[`${cronSchedule}${category}${guildId}`] = cron.job(cronSchedule, async function () {
    try {
      const guild = await getGuildAsync(guildId)
      const questions = guild.questions[category]
      const question = questions[Math.floor(Math.random() * questions.length)]

      if (guild.questionChannel) {
        const channel = client.channels.cache.get(guild.questionChannel)
        channel.send(question)
      }
    } catch (error) {
      log.error(`error during questionnaire: ${error}`)
    }
  },
  null,
  true)
}

function removeTrigger (cronSchedule, category, guildId) {
  const task = tasks[`${cronSchedule}${category}${guildId}`]
  if (task) {
    task.stop()
    tasks.remove(task)
  }
}

function stopAll () {
  Object.values(tasks).forEach(task => task.stop())
}

function clear () {
  stopAll()
  for (const prop in tasks) delete tasks[prop]
}

module.exports = {
  scheduleQuestionnairesAsync,
  scheduleQuestionnaire,
  removeTrigger,
  stopAll,
  clear
}
