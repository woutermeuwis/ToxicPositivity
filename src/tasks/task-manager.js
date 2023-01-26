const questionnaire = require('./question-scheduler')

async function scheduleTasksAsync (client) {
  await clearScheduledTasks()
  await questionnaire.scheduleQuestionnairesAsync(client)
}

async function clearScheduledTasks () {
  questionnaire.clear()
}

module.exports = { scheduleTasksAsync, clearScheduledTasks }
