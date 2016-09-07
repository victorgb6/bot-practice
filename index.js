var TelegramBot = require('node-telegram-bot-api');

var token = '242921503:AAELa-0-KpXAsAJnLDUowH3GCQqgZsr23BM';

var bot = new TelegramBot(token, {
  webHook: {
    port: 9999,
    host: '127.0.0.1'
  }
});

bot.setWebHook('https://victorgil.me' + '/bot-practice' + token);
console.log('webhook set!');


module.exports = bot;
