const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let shineeCount = 0;

// replace with actual ID (user or role)
const SHINEE_ID = "123456789012345678";

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // check word
  const hasWord = content.includes("shinee");

  // check mention
  const hasMention =
    message.mentions.users.has(SHINEE_ID) ||
    message.mentions.roles.has(SHINEE_ID);

  if (hasWord || hasMention) {
    shineeCount++;

    message.channel.send(`✨ SHINee count: ${shineeCount}`);
  }
});

client.login('YOUR_BOT_TOKEN');
