const settings = require("./settings.json");
let fs = require('fs');

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

    this.betterEval = function(input) {
        if(input.match('^[+-/*=0-9 ]')) {
            try {
                return eval(input);
            }
            catch(err) {
            }
        }
        return "pas"; 
    }

    this.quote = function(name) {
        if(!checkName(name)) {
            return "nqq takowa ime";
        }

        let quotes = settings[name];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    this.addQuote = function(name, quote) {
        if(!checkName(name)) {
            return;
        } 
        settings[name].push(quote);
        this.saveJSON();
    }

    this.printQuotes = function(name) {
        if(!checkName(name)) {
            return;
        }

        this.currentName = name;
        
        let result = '';
        for(var i = 0; i < settings[name].length; i++) {
            result += (i + 1) + ". " + settings[name][i] + "\n";
        }

        return result;
    }

    this.removeQuote = function(i) {
        if(this.currentName) {
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
        if(settings[name]) {
            return 1;
        }
        return 0;
    }
}