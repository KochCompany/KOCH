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

    this.removeResponse = function(trigger) {
        delete settings.triggers[trigger];
        this.saveJSON();
    }

    this.getLastBrackets = function(input) {
        let brackets = {
            '(': ')',
            '{': '}',
            '[': ']'
        }

        let openStack = [];
        let count = 0;
        let openings = Object.keys(brackets);
        for (let sign of input) {
            for (let opening of openings) {
                if (sign == opening) {
                    openStack.push(count);
                } else if (sign == brackets[opening]) {
                    let spliced = openStack.splice(openStack.length - 1, 1)[0];
                    return [spliced, count];
                }
            }
            count++;
        }
        return undefined;
    }

    this.checkBrackets = function(input) {
        let brackets = {
            '(': ')',
            '{': '}',
            '[': ']'
        }

        let openingStack = [];

        let equil = 0;
        let openings = Object.keys(brackets);
        for (let opening of openings) {
            for (let sign of input) {
                if (sign == opening) {
                    openingStack.push(sign);
                    equil++;
                } else if (sign == brackets[opening]) {
                    let opening = openingStack.splice(openingStack.length-1, 1)[0];
                    equil--;
                    if (sign != brackets[opening]) {
                        return 0;
                    }
                }
            }
        }
        if (equil != 0) {
            return 0;
        }
        return 1;
    }

    this.simplify = function(input) {
        if (!this.checkBrackets(input)) {
            return undefined;
        }
        let pos = this.getLastBrackets(input);

        let evaluated = false;
        let ret = "";
        while (pos != undefined) {
            let cut = input.substring(pos[0], pos[1]);

            cut = cut.replace(/[\[\(\{]/, '');
            cut = cut.replace(/[\]\)\}]/, '');

            if (!this.checkExpression(cut)) {
                return undefined;
            }

            cut = this.getZero(cut);
            let result = eval(cut);
            let first = input.substring(0, pos[0]);
            let second = input.substring(pos[1]+1);
            input = first + result + second;
            pos = this.getLastBrackets(input);
            evaluated = true;
        }

        if (!this.checkExpression(input) && !evaluated) {
            return undefined;
        }

        input = this.getZero(input);
        return eval(input);
    }

    this.getZero = function(input) {
        if (input[0] == '-') {
            let end;
            for (let i = 1; i < input.length; i++) {
                if (!input[i].match(/[0-9]/) && input[i] != ".") {
                    end = i;
                    break;
                }
            }
            input = this.insertCharacter(input, end, ")");
            input = "(0" + input;
        }
        return input;
    }

    this.checkExpression = function(input) {
        let start = /^(|-)[0-9]+([+-/*]|(\*\*))(|-)[0-9]+/;
        let body = /([+-/*]|(\*\*))(|-)[0-9]+/;

        for (let i = 0; i < input.length; i++) {
            input = input.replace(/ /, "");
        }

        if (!input.match(start)) {
            return 0;
        }

        input = input.replace(start, "");

        while (input != "") {
            if (!input.match(body)) {
                return 0;
            }
            input = input.replace(body, "");
        }
        return 1;
    }

    this.betterEval = function(input) {
        input = this.simplify(input);
        if (input != undefined) {
            return input;
        }
    }

    this.space = function(input) {
        input = "" + input;

        let pos = 1;

        for (let i = 0; i < input.length; i++) {
            if (input[i] == "e" || input[i] == "") { 
                return input;
            }
        }

        for (let i = input.length-1; i >= 0; i--) {
            if (pos%3 == 0) {
                input = this.insertCharacter(input, i, ",");
            }
            pos++;
        }
        return input;
    }

    this.insertCharacter = function(input, i, ch) {
        if (i > input.length - 1 || i < 0) {
            return undefined;
        }

        let first = input.substring(0, i);
        let second = input.substring(i);

        return first + ch + second;
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
