const { SlashCommandBuilder } = require('@discordjs/builders')
const { reply, defer } = require('../helpers/interaction-helper')
const { getGuildAsync, saveGuildAsync } = require('../helpers/guild-data')
const { PermissionFlagsBits } = require('discord.js')

async function setQuestionChannel (interaction) {
  const channel = interaction.options.getChannel('channel')
  const guildData = await getGuildAsync(interaction.guildId)
  guildData.questionChannel = channel.id
  await saveGuildAsync(guildData)
  await reply(interaction, 'Ok, ingesteld!')
}

async function clearQuestionChannel (interaction) {
  const guildData = await getGuildAsync(interaction.guild.id)
  guildData.reminderChannel = ''
  await saveGuildAsync(guildData)
  await reply(interaction, 'Ok. Er worden geen vragen meer geplaatst in deze server.')
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Instellingen')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand => subcommand
      .setName('set_question_channel')
      .setDescription('Stel in waar de vragen van de bot geplaatst worden!')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Zet in welk kanaal je herinneringen wilt zien')
        .setRequired(true)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName('clear_question_channel')
      .setDescription('Ontkoppel het vragen kanaal.')
    ),
  async execute (interaction) {
    await defer(interaction)

    switch (interaction.options.getSubcommand()) {
      case 'set_question_channel':
        await setQuestionChannel(interaction)
        break
      case 'clear_question_channel':
        await clearQuestionChannel(interaction)
        break
    }
  }

}
