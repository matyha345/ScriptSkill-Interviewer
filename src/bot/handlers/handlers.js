const { Keyboard, GrammyError, HttpError } = require('grammy')

const { getRandomQuestion, getCorrectAnswer } = require('../utils/utils')

const {
	createInlineKeyboard,
	sendFormattedMessage
} = require('../utils/replyUtils')

const startCommandHandler = async ctx => {
	const startKeyboard = new Keyboard()
		.text('HTML')
		.text('CSS')
		.row()
		.text('JavaScript')
		.text('React')
		.resized()

	// Отправка приветственного сообщения и клавиатуры
	await ctx.reply(
		'Hi! Я - Frontend Interview 🤖 \nЯ помогу тебе стать кулхацкером 🥷'
	)
	await ctx.reply('Выбери тему вопроса в меню 👇 Непись!', {
		reply_markup: startKeyboard
	})
}

// Обработчик текстовых сообщений
const messageTextHandler = async ctx => {
	await ctx.reply(
		'Команда неизвестна. Пожалуйста, перезапустите бота с помощью команды /start.'
	)
}

// Обработчик выбора темы
const topicHandler = async ctx => {
	const topic = ctx.message.text.toLocaleLowerCase()
	const question = getRandomQuestion(topic)

	let replyOptions

	// Создание клавиатуры и отправка вопроса
	const inlineKeyboard = createInlineKeyboard(topic, question)

	if (question.image) {
		replyOptions = await sendFormattedMessage(
			ctx,
			question.image,
			null,
			inlineKeyboard
		)
	} else {
		replyOptions = await sendFormattedMessage(
			ctx,
			null,
			question.text,
			inlineKeyboard
		)
	}

	// Отправка вопроса с клавиатурой
	await replyOptions
}

// Обработчик callback-запросов
const callbackQueryHandler = async ctx => {
	const callbackData = JSON.parse(ctx.callbackQuery.data)

	// Получаем информацию о текущем вопросе и теме
	const currentTopic = callbackData.type.split(' - ')[0]
	const currentQuestionId = callbackData.questionId

	// Проверяем правильность ответа
	if (!callbackData.type.includes('option')) {
		const answer = getCorrectAnswer(callbackData.type, callbackData.questionId)

		await ctx.reply(answer, {
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})

		const nextQuestion = getRandomQuestion(currentTopic)

		let replyOptions

		// Создание клавиатуры и отправка вопроса
		const inlineKeyboard = createInlineKeyboard(currentTopic, nextQuestion)

		await ctx.reply('---👆Ответ👆--- \n \n---👇Новый вопрос👇---')

		if (nextQuestion.image) {
			replyOptions = await sendFormattedMessage(
				ctx,
				nextQuestion.image,
				null,
				inlineKeyboard
			)
		} else {
			replyOptions = await sendFormattedMessage(
				ctx,
				null,
				nextQuestion.text,
				inlineKeyboard
			)
		}

		await replyOptions

		await ctx.answerCallbackQuery()
		return
	}

	// Обработка правильного ответа
	if (callbackData.isCorrect) {
		await ctx.reply('Верно 👌')

		// Выбираем следующий вопрос из той же темы
		const nextQuestion = getRandomQuestion(currentTopic)

		let replyOptions

		// Создание клавиатуры и отправка вопроса
		const inlineKeyboard = createInlineKeyboard(currentTopic, nextQuestion)
		await ctx.reply('---👆Ответ👆--- \n \n---👇Новый вопрос👇---')

		if (nextQuestion.image) {
			replyOptions = await sendFormattedMessage(
				ctx,
				nextQuestion.image,
				null,
				inlineKeyboard
			)
		} else {
			replyOptions = await sendFormattedMessage(
				ctx,
				null,
				nextQuestion.text,
				inlineKeyboard
			)
		}

		await replyOptions

		await ctx.answerCallbackQuery()
		return
	}

	// Обработка неправильного ответа
	const answer = getCorrectAnswer(currentTopic, currentQuestionId)
	await ctx.reply(
		`*Неверно*!!! ❌ \nЯ так и думал что ты Непись 🫵 \n*Правильный: ${answer}* 👀`,
		{ parse_mode: 'Markdown' }
	)
	await ctx.answerCallbackQuery()
}

// Обработчик ошибок бота
const botErrorHandler = err => {
	const ctx = err.ctx
	console.error(`Error while handling update ${ctx.update.update_id}:`)
	const e = err.error
	if (e instanceof GrammyError) {
		console.error('Error in request:', e.description)
	} else if (e instanceof HttpError) {
		console.error('Could not contact Telegram:', e)
	} else {
		console.error('Unknown error:', e)
	}
}

module.exports = {
	startCommandHandler,
	messageTextHandler,
	topicHandler,
	callbackQueryHandler,
	botErrorHandler
}
