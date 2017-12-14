module.exports = function() {
    this.Command = function(name, func) {
        const settings = require('./settings.json');
        this.name = settings.prefix + name;
        this.func = func;

        this.check = function(content) {
            return content.startsWith(this.name);
        }

        this.run = function(message) {
            this.func(message);
        }
    }
}
