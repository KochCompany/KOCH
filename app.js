//KOCH

require('./commands.js')();
require('./tools.js')();
require('./functions.js')();
const settings = require('./settings.json');
const request = require("request");
const unirest = require('unirest');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const broadcast = client.createVoiceBroadcast();
const commandList = [new Command("help", helpF),
				     new Command("leave", leaveF),
                     new Command("weather", weatherF),
	                 new Command("addResponse", addResponseF),
	                 new Command("removeResponse", removeResponseF),
	                 new Command("setGame", setGameF),
	                 new Command("addQuote", addQuoteF),
	                 new Command("removeQuote", removeQuoteF),
                     new Command("showQuotes", showQuotesF),
    				 new Command("select", selectF),
    				 new Command("quote", quoteF)];

client.on('ready', () => {
	console.log('zdr kurwi');
	client.user.setGame(settings.game);
});

client.on('guildMemberAdd', member => {
	let guild = member.guild;
	guild.defaultChannel.send('Dobre doshul, ' + member.user + '\n komandi: $help');

	let plebeiRole = guild.roles.find("name", "plebei");
	member.addRole(plebeiRole);
});

client.on('guildMemberRemove', member => {
	let guild = member.guild;
	guild.defaultChannel.send('Doswiduli!');
});

client.on('message', message => {
	client.setMaxListeners(1);

	if (message.author.id == "383014138605076480") {
		return;
	}

	let res = betterEval(message.content);
	if (res != undefined) {
		res = space(res);
		message.channel.send(res);
		return;
	}

	let botChannel = message.guild.channels.find("name", "djang1r");
	if (message.channel.id != botChannel.id) {
		let expr = /^[!?;]/;
		if (message.content.match(expr) || message.author.bot) {
			message.delete();
		}
	}

	//autoresponder:

	for (var k in settings.triggers) {
		if (message.content == k) {
			if (settings.triggers[k].startsWith("http")) {
				message.channel.send({file: settings.triggers[k]});
				return;
			}
			message.channel.send(settings.triggers[k]);
			return;
		}
	}

	//misc:

	if (checkSong(message)) {
		const channel = message.member.voiceChannel;

		if (channel == undefined) {
			return;
		}

		let current = getSong();

		channel.join().then(connection => {
			broadcast.playStream(current);
			connection.playBroadcast(broadcast);
		}).catch(console.error);

		broadcast.on("end", () => {
			channel.leave();
		});
	} else if (message.content == "zdr") {
		message.channel.send("zdr, " + message.author);
	}

	//commands:

	for (cmnd of commandList) {
		if (cmnd.check(message.content)) {
			cmnd.run(message);
			break;
		}
	}
});

client.login(settings.token);
