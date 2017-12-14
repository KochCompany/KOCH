//KOCH

require('./commands.js')();
require('./tools.js')();
const settings = require('./settings.json');
const request = require("request");
const unirest = require('unirest');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const broadcast = client.createVoiceBroadcast();



//===========================
//
//		<FUNCTIONS>
//
//===========================



let help = function(message) {
    let info = "$weather \n$addResponse {trigger}, {response} \n$removeResponse {trigger} \n$quote {name} \
    \n$showQuotes {name} \n$addQuote {name}, {quote} \n$removeQuote {name} -> $select {number}";
    message.author.send(info);
}

let leave = function(message) {
    const channel = message.member.voiceChannel;
    channel.leave();
}

let weather = function(message) {
	let idSofia = "727011";
    let idPlovdiv = "728194";
	let current;
	let city;

    result = message.content.split(" ");

    if (result[1] == "pld") {
		currentId = idPlovdiv;
		city = "Plowdiw";
	} else {
		currentId = idSofia;
		city = "Sofia";
	}

    const wUrl = "http://api.openweathermap.org/data/2.5/weather?id=" + currentId + "&appid=3d5632822352c9cd93370a8212356d3f";
    let info = {
        url: wUrl,
        json: true
    };

    request(info, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let temp = (body.main.temp - 273.15);
            let wSpeed = body.wind.speed;
            let tempMsg = "";
            let windMsg = "";
            let zaprqnkata = client.emojis.find("name", "zaprqnkata");

            if (temp <= -5) {
                tempMsg = "\n'96 golemiq sneg "
            }

            if (wSpeed >= 10) {
                windMsg = "duha kat 03";
            }

            message.channel.send("aktualen klimat w " + city + ": " + temp + " °C " + zaprqnkata + tempMsg+
            "\nwetar: " + wSpeed + " m/s " + windMsg);
        }
    });
}

let addResponse = function(message) {
    let result = message.content.substring(13).split(",");
    let response = "";
    console.log(result);
    for (let i = 1; i < result.length; i++) {
        response += result[i];
        if (i < result.length - 1) {
            response += ",";
        }
    }
    addResponse(result[0], response);
}

let removeResponse = function(message) {
    console.log(message.content.substring(16), message.author.username);
    removeResponse(message.content.substring(16));
}

let setGame = function(message) {
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
}

let addQuote = function(message) {
    let result = message.content.substring(10).split(",");
    let sum = "";
    for (let i = 1; i < result.length; i++) {
        sum += result[i];
        if(i < result.length - 1) {
            sum += ",";
        }
    }
    addQuote(result[0], sum);
    console.log(result, message.content.author);
}

let removeQuote = function(message) {
    let result = message.content.substring(13);
    message.channel.send(printQuotes(result));
    console.log(result, message.content.author);
}

let select = function(message) {
    let result = message.content.substring(8);
    let ret = removeQuote(eval(result));
    if (ret == 0) {
        message.channel.send("nema takaf index");
    } else if (ret == -1) {
        message.channel.send("kwo izbirash ti e?");
    }
}

let showQuotes = function(message) {
    let result = message.content.substring(12);
    message.channel.send(printQuotes(result));
}

let quote = function(message) {
    let name = message.content.split(" ");
    message.channel.send(quote(name[1], name[2]));
}

let commandList = [new Command("help", help),
					new Command("leave", leave),
					new Command("weather", weather),
					new Command("addResponse", addResponse),
					new Command("removeResponse", removeResponse),
					new Command("setGame", setGame),
					new Command("addQuote", addQuote),
					new Command("removeQuote", removeQuote),
					new Command("showQuotes", showQuotes),
					new Command("select", select),
					new Command("quote", quote)];



//===========================
//
//		</FUNCTIONS>
//
//===========================



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
