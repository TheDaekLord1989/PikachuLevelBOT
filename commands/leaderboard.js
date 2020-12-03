const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client();

module.exports = {
    name: 'leaderboard',
    aliases: ['lb'],
    description: "Check top 10 users with the most xp and the highest level",
    cooldown: 3,
    category: "Leveling",
    execute (message, args) {

    const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC LIMIT 10;").all(message.guild.id);

        const embed = new Discord.MessageEmbed()
        .setTitle(`${message.guild.name} 前十位經驗值排行榜`)
        .setColor("RANDOM")
        .setTimestamp()
        .setDescription(`前十位經驗值排行榜`);


      for(const data of top10) {
          let xp = data.xp;
          let level = data.level;
          let nextXP = level * 2 * 250 + 250
          let totalXP = data.totalXP
          let user = data.user
          let rank = top10.sort((a, b) => {
            return b.totalXP - a.totalXP
          });
          let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1

        embed.addFields({ name: `\u200b`, value: `**#${ranking}. <@${user}>**\n> **等級**: \`${level}\`\n> **經驗值**: \`${xp}/${nextXP}\`\n> **縂經驗值**: \`${totalXP}\`` });
      }
      return message.channel.send({embed});
    }
}