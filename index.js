const { 
  Client, 
  GatewayIntentBits, 
  Partials,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');

// ===== CONFIG =====
const TOKEN = 'YOUR_BOT_TOKEN';
const SHINEE_ID = '123456789012345678'; // user OR role ID
const COOLDOWN_MS = 5000;

// scoreboard (optional)
const SCOREBOARD_CHANNEL_ID = 'CHANNEL_ID'; // or null
let scoreboardMessageId = null;

// ===== DATA =====
let data = {
  count: 0,
  lastTriggered: {} // userId -> timestamp
};

// load file
if (fs.existsSync('data.json')) {
  data = JSON.parse(fs.readFileSync('data.json'));
}

function save() {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// ===== CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ===== SCOREBOARD =====
async function updateScoreboard() {
  if (!SCOREBOARD_CHANNEL_ID) return;

  const channel = await client.channels.fetch(SCOREBOARD_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle('✨ SHINee Counter')
    .setDescription(`Total mentions: **${data.count}**`)
    .setColor(0x00ffcc)
    .setFooter({ text: 'Keeps updating automatically' });

  try {
    if (!scoreboardMessageId) {
      const msg = await channel.send({ embeds: [embed] });
      scoreboardMessageId = msg.id;
    } else {
      const msg = await channel.messages.fetch(scoreboardMessageId);
      await msg.edit({ embeds: [embed] });
    }
  } catch (err) {
    console.log('Scoreboard error:', err.message);
    scoreboardMessageId = null;
  }
}

// ===== MESSAGE EVENT =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  const hasWord = content.includes('shinee');
  const hasMention =
    message.mentions.users.has(SHINEE_ID) ||
    message.mentions.roles.has(SHINEE_ID);

  if (hasWord || hasMention) {
    const now = Date.now();
    const last = data.lastTriggered[message.author.id] || 0;

    // cooldown check
    if (now - last < COOLDOWN_MS) return;

    data.lastTriggered[message.author.id] = now;
    data.count++;

    save();
    updateScoreboard();

    // lightweight feedback instead of spam
    message.react('✨').catch(() => {});
  }

  // ===== COMMANDS =====
  if (content === '!shinee') {
    message.reply(`✨ Current SHINee count: **${data.count}**`);
  }

  if (content === '!reset') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('You need admin permission to reset.');
    }

    data.count = 0;
    data.lastTriggered = {};
    save();
    updateScoreboard();

    message.reply('Counter reset.');
  }
});

// ===== READY =====
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateScoreboard();
});

// ===== LOGIN =====
client.login(TOKEN);
