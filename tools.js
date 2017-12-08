const settings = require("./settings.json");
let fs = require('fs');

let song = {};
let normalizedPath = require("path").join(__dirname, "resources");

fs.readdirSync(normalizedPath).forEach(function(file) {
    song[file] = "./resources/" + file;
});


module.exports = function() {
    this.saveJSON = function() {
        let json = JSON.stringify(settings);
        fs.writeFile("settings.json", json, "utf8", () => {});
    }

    this.addResponse = function(trigger, response) {
        settings.triggers[trigger] = response;
        this.saveJSON();
    }

    removeResponse = function(trigger) {
        delete settings.triggers[trigger];
        this.saveJSON();
    }

    this.betterEval = function(input) {
        let start = /^[0-9]+([+-/*]|(\*\*))[0-9]+/;
        let body = /([+-/*]|(\*\*))[0-9]+/;
        let holder = input;
        for (let i = 0; i < holder.length; i++) {
            holder = holder.replace(/ /, "");
        }

        if (!holder.match(start)) {
            return;
        }

        holder = holder.replace(start, "");

        while (holder != "") {
            if (!holder.match(body)) {
                return;
            }
            holder = holder.replace(body, "");
        }

        return eval(input);
    }

    this.quote = function(name, i) {
        if (!checkName(name)) {
            console.log(name);
            return "nqq takowa ime";
        }
        let quotes = settings[name];

        if (i + 1 >= 0 && i + 1 < quotes.length) {
            return quotes[i - 1];
        }

        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    this.addQuote = function(name, quote) {
        if (!checkName(name)) {
            return;
        }
        settings[name].push(quote);
        this.saveJSON();
    }

    this.printQuotes = function(name) {
        if (!checkName(name)) {
            return;
        }

        this.currentName = name;

        let result = '';
        for (var i = 0; i < settings[name].length; i++) {
            result += "**" + (i + 1) + "**" + ". " + settings[name][i] + "\n";
        }
        return result;
    }

    this.removeQuote = function(i) {
        if (this.currentName) {
            if(i < 1 || i > settings[this.currentName].length) {
                return 0;
            }
            settings[this.currentName].splice(i - 1, 1);
            this.saveJSON();
            this.currentName = undefined;
            return 1;
        }
        return -1;
    }

    this.checkName = function(name) {
        if (settings[name]) {
            return 1;
        }
        return 0;
    }

    this.checkSong = function(msg) {
        this.msg = msg.content;
        for (let k in song) {
            let name = k.split(".")[0];
            if (this.msg == settings.prefix + name) {
                this.songName = song[k];
                return true;
            }
        }
        return false;
    }

    this.getSong = function() {
        return this.songName;
    }
}