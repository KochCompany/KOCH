require('./tools.js')();
const Discord = require('discord.js');
const client = new Discord.Client();

let fs = require('fs');
let request = require("request");
const unirest = require('unirest');
const settings = require('./settings.json');
const wUrl = "http://api.openweathermap.org/data/2.5/weather?id=727011&appid=3d5632822352c9cd93370a8212356d3f";
const ytdl = require('ytdl-core');
const song = "./resources/alo.mp3";
const mamo = "./resources/mamo.mp3";

const streamOptions = {
	seek: 0,
	volume: 1
};

const broadcast = client.createVoiceBroadcast();

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

	if(message.author.bot) {
		return;
	}

	if(betterEval(message.content) != "pas") {
		message.channel.send(betterEval(message.content));
	}
	
	//autoresponder:

	for(var k in settings.triggers) {
		if(message.content == k) {
			if(settings.triggers[k].startsWith("https://")) {
				message.channel.send({file: settings.triggers[k]});
			} else {
				message.channel.send(settings.triggers[k]);
			}
			break;
		}
	}

	//commands:

	if(message.content.startsWith(settings.prefix + 'help')) {
		let result = "";
		for(var i = 0; i < settings.triggers.length; i++) {
			result += settings.triggers[i] + ' -> ' + settings.responses[i] + '\n';
		}
		message.author.send(result);
	} else if(message.content.startsWith(settings.prefix + "leave")) {
		const channel = message.member.voiceChannel;
		channel.leave();
	} else if(message.content.startsWith(settings.prefix + "alo")) {
		const channel = message.member.voiceChannel;

		if(channel == undefined) {
			return;
		}
		channel.join().then(connection => {
			broadcast.playStream(song);
			connection.playBroadcast(broadcast);
			// connection.on("speaking", (user, speaking) => {
			// 	262229653895380992 istinskiq alotist
			// 	if(user.id == "228266204911894534") {
			// 		message.channel.send("zaeka e gei");
			// 	}
			// });
		}).catch(console.error);
		broadcast.on("end", () => {
			channel.leave();
		});

	} else if(message.content.startsWith(settings.prefix + "jiwee mi se")) {
		const channel = message.member.voiceChannel;

		if(channel == undefined) {
			return;
		}

		channel.join().then(connection => {
			broadcast.playStream(mamo);
			connection.playBroadcast(broadcast);
			broadcast.on("end", () => {
				channel.leave();
			});
		});
	} else if(message.content == "zdr") {
		message.channel.send("zdr, " + message.author);
	} else if(message.content == settings.prefix + "weather") {
		request({
			url: wUrl,
			json: true
		}, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				let temp = (body.main.temp - 273.15);
				if(temp <= -10) {
					message.channel.send("aktualen klimat: " + temp + " °C \n'96 golemiq sneg");
				} else {
					message.channel.send("aktualen klimat: " + temp + " °C");
				}
			}
		})
	} else if(message.content.startsWith(settings.prefix + 'addResponse')) {
		let result = message.content.substring(13).split(",");
		console.log(result, message.author.username);
		addResponse(result[0], result[1]);
	} else if(message.content.startsWith(settings.prefix + "removeResponse")) { 
		removeResponse(message.content.substring(15));
	} else if(message.content.startsWith(settings.prefix + 'setgame')) {		
		let modRole = message.guild.roles.find("name", "pulen pedal");
		let ownerRole = message.guild.roles.find("name", "nai-golemiq pulen pedal");
		if(message.member.roles.has(modRole.id) || message.member.roles.has(ownerRole.id)) {
			let result = message.content.substring(9);
			client.user.setGame(result);
			saveJSON();
		} else {
			message.channel.send("Not authorized ;(");
		}
	} else if(message.content.startsWith(settings.prefix + "addQuote")) {
		let result = message.content.substring(10).split(",");
		addQuote(result[0], result[1]);
	} else if(message.content.startsWith(settings.prefix + "removeQuote")) {
		let result = message.content.substring(13);
		message.channel.send(printQuotes(result));
	} else if(message.content.startsWith(settings.prefix + "select")) {
		let result = message.content.substring(8);
		let ret = removeQuote(eval(result));
		if(ret == 0) {
			message.channel.send("nema takaf index");
		} else if(ret == -1) {
			message.channel.send("kwo izbirash ti e?");
		}
	} else if(message.content.startsWith(settings.prefix + "showQuotes")) {
		let result = message.content.substring(12);
		message.channel.send(printQuotes(result));
	} else if(message.content.startsWith(settings.prefix + "quote")) {
		let name = message.content.substring(7);
		message.channel.send(quote(name));
	}
	
});

client.login(settings.token);