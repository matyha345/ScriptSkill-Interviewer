const { Keyboard, InlineKeyboard, GrammyError, HttpError } = require('grammy')

const { getRandomQuestion, getCorrectAnswer } = require('../utils/utils')

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
const messageTextHandler = async ctx => {
	await ctx.reply(
		'Команда неизвестна. Пожалуйста, перезапустите бота с помощью команды /start.'
	)
}

const topicHandler = async ctx => {
	const topic = ctx.message.text.toLocaleLowerCase()
	const question = getRandomQuestion(topic)

	let inlineKeyboard
	let replyOptions

	// Создание inline клавиатуры для вопроса
	if (question.hasOptions) {
		const buttonRows = question.options.map(option => {
			return [
				InlineKeyboard.text(
					option.text,
					JSON.stringify({
						type: `${topic} - option`,
						isCorrect: option.isCorrect,
						questionId: question.id
					})
				)
			]
		})

		inlineKeyboard = InlineKeyboard.from(buttonRows)
	} else {
		inlineKeyboard = new InlineKeyboard().text(
			'Получить ответ',
			JSON.stringify({
				type: topic,
				questionId: question.id
			})
		)
	}

	if (question.image) {
		replyOptions = ctx.replyWithPhoto(question.image, {
			reply_markup: inlineKeyboard
		})
	} else {
		replyOptions = ctx.reply(question.text, {
			reply_markup: inlineKeyboard
		})
	}

	// Отправка вопроса с клавиатурой
	await replyOptions
}

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

		// Выбираем следующий вопрос из той же темы
		const nextQuestion = getRandomQuestion(currentTopic)

		// Создаем inline клавиатуру для нового вопроса
		let inlineKeyboard
		let replyOptions

		if (nextQuestion.hasOptions) {
			const buttonRows = nextQuestion.options.map(option => {
				return [
					InlineKeyboard.text(
						option.text,
						JSON.stringify({
							type: `${currentTopic} - option`,
							isCorrect: option.isCorrect,
							questionId: nextQuestion.id
						})
					)
				]
			})
			inlineKeyboard = InlineKeyboard.from(buttonRows)
		} else {
			inlineKeyboard = new InlineKeyboard().text(
				'Получить ответ',
				JSON.stringify({
					type: currentTopic,
					questionId: nextQuestion.id
				})
			)
		}
		await ctx.reply('---👆Ответ👆--- \n \n---👇Новый вопрос👇---')
		// Отправляем следующий вопрос

		if (nextQuestion.image) {
			replyOptions = ctx.replyWithPhoto(nextQuestion.image, {
				reply_markup: inlineKeyboard
			})
		} else {
			replyOptions = ctx.reply(nextQuestion.text, {
				reply_markup: inlineKeyboard
			})
		}

		await replyOptions

		await ctx.answerCallbackQuery()
		return
	}

	if (callbackData.isCorrect) {
		await ctx.reply('Верно 👌')

		// Выбираем следующий вопрос из той же темы
		const nextQuestion = getRandomQuestion(currentTopic)

		// Создаем inline клавиатуру для нового вопроса
		let inlineKeyboard
		let replyOptions

		if (nextQuestion.hasOptions) {
			const buttonRows = nextQuestion.options.map(option => {
				return [
					InlineKeyboard.text(
						option.text,
						JSON.stringify({
							type: `${currentTopic} - option`,
							isCorrect: option.isCorrect,
							questionId: nextQuestion.id
						})
					)
				]
			})
			inlineKeyboard = InlineKeyboard.from(buttonRows)
		} else {
			inlineKeyboard = new InlineKeyboard().text(
				'Получить ответ',
				JSON.stringify({
					type: currentTopic,
					questionId: nextQuestion.id
				})
			)
		}
		await ctx.reply('---👆Ответ👆--- \n \n---👇Новый вопрос👇---')
		// Отправляем следующий вопрос

		if (nextQuestion.image) {
			replyOptions = ctx.replyWithPhoto(nextQuestion.image, {
				reply_markup: inlineKeyboard
			})
		} else {
			replyOptions = ctx.reply(nextQuestion.text, {
				reply_markup: inlineKeyboard
			})
		}

		await replyOptions

		await ctx.answerCallbackQuery()
		return
	}

	const answer = getCorrectAnswer(currentTopic, currentQuestionId)
	await ctx.reply(
		`*Неверно*!!! ❌ \nЯ так и думал что ты Непись 🫵 \n*Правильный: ${answer}* 👀`,
		{ parse_mode: 'Markdown' }
	)
	await ctx.answerCallbackQuery()
}

const botErrorHandler = (err) => {
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
