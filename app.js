//KOCH

require('./tools.js')();
const Discord = require('discord.js');
const client = new Discord.Client();
const broadcast = client.createVoiceBroadcast();

let fs = require('fs');
let request = require("request");
const unirest = require('unirest');
const settings = require('./settings.json');
const ytdl = require('ytdl-core');

const streamOptions = {
	seek: 0,
	volume: 1
};

let last = [];

client.on('ready', () => {
	console.log('zdr kurwi');
	client.user.setGame(settings.game);
});

client.on('guildMemberAdd', member => {
	let guild = member.guild;
	guild.defaultCnodehannel.send('Dobre doshul, ' + member.user + '\n komandi: $help');
});

client.on('guildMemberRemove', member => {
	let guild = member.guild;
	guild.defaultChannel.send('Doswiduli!');
});

client.on('message', message => {
	client.setMaxListeners(1);

	if (message.author.bot) {
		return;
	}

	let res = betterEval(message.content);

	if (res != undefined) {
		message.channel.send(res);
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

	//commands:

	if (message.content.startsWith(settings.prefix + 'help')) {
		let info = "$weather \n$addResponse {trigger} {response} \n$removeResponse {trigger} \n$quote {name} \
			\n$showQuotes {name} \n$addQuote {name} {quote} \n$removeQuote {name} -> $select {number}"
		message.author.send(info);
	} else if (message.content.startsWith(settings.prefix + "gn")) {
		message.channel.send("leka kurwi");
	} else if (message.content.startsWith(settings.prefix + "leave")) {
		const channel = message.member.voiceChannel;
		channel.leave();
	} else if (checkSong(message)) {
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
	} else if (message.content == settings.prefix + "weather") {
		const wUrl = "http://api.openweathermap.org/data/2.5/weather?id=727011&appid=3d5632822352c9cd93370a8212356d3f";
		request({
			url: wUrl,
			json: true
		}, function(error, response, body) {
			if (!error && response.statusCode === 200) {
				let temp = (body.main.temp - 273.15);
				let zaprqnkata = client.emojis.find("name", "zaprqnkata");
				if (temp <= -10) {
					message.channel.send("aktualen klimat: " + temp + " °C \n'96 golemiq sneg " + zaprqnkata);
				} else {
					message.channel.send("aktualen klimat: " + temp + " °C " + zaprqnkata);
				}
			}
		})
	} else if (message.content.startsWith(settings.prefix + 'addResponse')) {
		let result = message.content.substring(13).split(",");
		let response = "";
		console.log(result, message.author.username);
		for (let i = 1; i < result.length; i++) {
			response += result[i];
			if (i < result.length - 1) {
				response += ",";
			}
		}
		addResponse(result[0], response);
	} else if (message.content.startsWith(settings.prefix + "removeResponse")) {
		console.log(message.content.substring(16), message.author.username);
		removeResponse(message.content.substring(16));
	} else if (message.content.startsWith(settings.prefix + 'setgame')) {
		let modRole = message.guild.roles.find("name", "pulen pedal");
		let ownerRole = message.guild.roles.find("name", "nai-golemiq pulen pedal");
		if (message.member.roles.has(modRole.id) || message.member.roles.has(ownerRole.id)) {
			let result = message.content.substring(9);
			client.user.setGame(result);
			settings.game = result;
			saveJSON();
		} else {
			message.channel.send("Not authorized ;(");
		}
	} else if (message.content.startsWith(settings.prefix + "addQuote")) {
		let result = message.content.substring(10).split(",");
		addQuote(result[0], result[1]);
		console.log(result, message.content.author);
	} else if (message.content.startsWith(settings.prefix + "removeQuote")) {
		let result = message.content.substring(13);
		message.channel.send(printQuotes(result));
		console.log(result, message.content.author);
	} else if (message.content.startsWith(settings.prefix + "select")) {
		let result = message.content.substring(8);
		let ret = removeQuote(eval(result));
		if (ret == 0) {
			message.channel.send("nema takaf index");
		} else if (ret == -1) {
			message.channel.send("kwo izbirash ti e?");
		}
	} else if (message.content.startsWith(settings.prefix + "showQuotes")) {
		let result = message.content.substring(12);
		message.channel.send(printQuotes(result));
	} else if(message.content.startsWith(settings.prefix + "quote")) {
		let name = message.content.split(" ");
		message.channel.send(quote(name[1], name[2]));
	}
});

client.login(settings.token);
