require('dotenv').config()

const { Bot } = require('grammy')

const bot = new Bot(process.env.BOT_API_KEY)

const {
	startCommandHandler,
	messageTextHandler,
	topicHandler,
	callbackQueryHandler,
	botErrorHandler
} = require('./src/bot/handlers/handlers')

// Обработчики команд и событий
bot.command('start', startCommandHandler)
bot.hears(['HTML', 'CSS', 'JavaScript', 'React'], topicHandler)
bot.on('message:text', messageTextHandler)
bot.on('callback_query:data', callbackQueryHandler)

// Обработчик ошибок
bot.catch(botErrorHandler)

bot.start()
