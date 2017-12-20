const request = require("request");
module.exports = function() {
    this.helpF = function(message) {
        let info = "$weather [pld] \n$addResponse {trigger}, {response} \n$removeResponse {trigger} \n$quote {name} \
        \n$showQuotes {name} \n$addQuote {name}, {quote} \n$removeQuote {name} -> $select {number}";
        message.author.send(info);
    }

    this.leaveF = function(message) {
        const channel = message.member.voiceChannel;
        channel.leave();
    }

    this.weatherF = function(message) {
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
                let zaprqnkata = message.client.emojis.find("name", "zaprqnkata");

                if (temp <= -5) {
                    tempMsg = "\n'96 golemiq sneg "
                }

                if (wSpeed >= 10) {
                    windMsg = "duha kat 03";
                }

                message.channel.send(`aktualen klimat w ${city}: ${temp} °C ${zaprqnkata} ${tempMsg}\nwetar: ${wSpeed} m/s ${windMsg}`);
            }
        });
    }

    this.addResponseF = function(message) {
        let result = message.content.substring(13).split(",");
        let response = "";
        for (let i = 1; i < result.length; i++) {
            response += result[i];
            if (i < result.length - 1) {
                response += ",";
            }
        }
        addResponse(result[0], response);
    }

    this.removeResponseF = function(message) {
        console.log(message.content.substring(16), message.author.username);
        removeResponse(message.content.substring(16));
    }

    this.setGameF = function(message) {
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

    this.addQuoteF = function(message) {
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

    this.removeQuoteF = function(message) {
        let result = message.content.substring(13);
        message.channel.send(printQuotes(result));
        console.log(result, message.content.author);
    }

    this.selectF = function(message) {
        let result = message.content.substring(8);
        let ret = removeQuote(eval(result));
        if (ret == 0) {
            message.channel.send("nema takaf index");
        } else if (ret == -1) {
            message.channel.send("kwo izbirash ti e?");
        }
    }

    this.showQuotesF = function(message) {
        let result = message.content.substring(12);
        message.channel.send(printQuotes(result));
    }

    this.quoteF = function(message) {
        let name = message.content.split(" ");
        message.channel.send(quote(name[1], name[2]));
    }
}
