const { createCanvas, loadImage } = require("canvas");
const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')
const client = new Discord.Client();
const { join } = require("path")

module.exports = {
    name: 'rank',
    async execute (message, args) {
        let userArray = message.content.split(" ");
        let userArgs = userArray.slice(1);
        let user = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0]) || message.member;

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP);");
        const top10 = sql.prepare("SELECT * FROM levels WHERE guild = ? ORDER BY totalXP").all(message.guild.id);
 let score = client.getScore.get(user.id, message.guild.id);
 if (!score) {
  return message.reply(`這個用戶沒有等級！`)
 }
const levelInfo = score.level
const nextXP = levelInfo * 2 * 250 + 250
const xpInfo = score.xp;
const totalXP = score.totalXP
let rank = top10.sort((a, b) => {
  return b.totalXP - a.totalXP
});
let ranking = rank.map(x => x.totalXP).indexOf(totalXP) + 1
if(!message.guild.me.hasPermission("ATTACH_FILES")) return message.reply(`**我沒有足夠的權限！**`);
 
const canvas = createCanvas(1000, 333)
    const ctx = canvas.getContext("2d");
    const background = await loadImage(join(__dirname, "..", "img", "wallpaper.jpg"));
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


//half-black background 
	ctx.fillStyle = "rgba(37, 38, 34, 0.60)"
	ctx.fillRect(20,20,960,290)
	
//progress bar
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#A3A3A3"
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000000"
    ctx.fillRect(180, 216, 775, 65);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeRect(180, 216, 775, 65);
    ctx.stroke();

//fill progress bar
    ctx.fillStyle = "#838383";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(200, 216, ((100 / (score.level * 2 * 250 + 250)) * score.xp) * 7.5, 65);
    ctx.fill();
    ctx.globalAlpha = 1;


//xp+rank start
    ctx.font = '36px setofont';
    ctx.textAlign = "center";
    ctx.fillStyle = "#beb1b1";
    ctx.fillText(`${xpInfo} / ${nextXP} 經驗值`, 600, 260);

    ctx.font = '35px setofont';
    ctx.textAlign = "left";
    ctx.fillText(user.user.tag, 325, 125);

    ctx.font = '40px setofont';
    ctx.fillText("等級: ", 350, 170);
    ctx.fillText(levelInfo, 500, 170);

    ctx.font = '40px setofont';
    ctx.fillText("排行: ", 700, 170);
    ctx.fillText(ranking, 830, 170);
//xp+rank ends

//user avatar
    ctx.arc(170, 160, 120, 0, Math.PI * 2, true);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#A3A3A3"
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avatar = await loadImage(user.user.displayAvatarURL({ format: "jpg" }));
    ctx.drawImage(avatar, 40, 40, 250, 250);

    const attachments = new Discord.MessageAttachment(canvas.toBuffer(), "rank.png");
    message.channel.send(attachments);
    }
}