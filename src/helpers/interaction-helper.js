const { PermissionsBitField } = require('discord.js')

async function defer (interaction, options = { ephemeral: false }) {
  if (interaction.isCommand() || interaction.isMessageComponent()) {
    if (!interaction.deferred && !interaction.replied) {
      return await interaction.deferReply(options)
    }
  }
}

async function reply (interaction, response) {
  if (interaction.isCommand() || interaction.isMessageComponent()) {
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(response)
    } else {
      return await interaction.reply(response)
    }
  }
}

async function sendToChannel (interaction, msg) {
  return await interaction.channel.send(msg)
}

function isAdmin (interaction) {
  return interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
}

async function verifyAdminAsync (interaction) {
  if (isAdmin(interaction)) {
    return true
  }

  await reply(interaction, 'https://gph.is/g/4w8PDNj')
  return false
}

module.exports = {
  defer,
  reply,
  sendToChannel,
  isAdmin,
  verifyAdminAsync
}
