require('dotenv').config()

// Импорт необходимых модулей из библиотеки grammy
const {
	Bot,
	Keyboard,
	InlineKeyboard,
	GrammyError,
	HttpError
} = require('grammy')


// Импорт функций для работы с вопросами и ответами
const { getRandomQuestion, getCorrectAnswer } = require('./utils')

// Создание экземпляра бота с использованием API-ключа из переменных окружения
const bot = new Bot(process.env.BOT_API_KEY)

// Обработка команды /start
bot.command('start', async ctx => {
	// Создание клавиатуры с выбором темы
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
})

// Обработка выбора темы вопроса
bot.hears(['HTML', 'CSS', 'JavaScript', 'React'], async ctx => {
	const topic = ctx.message.text.toLocaleLowerCase()
	const question = getRandomQuestion(topic)

	let inlineKeyboard

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

	// Отправка вопроса с клавиатурой
	await ctx.reply(question.text, {
		reply_markup: inlineKeyboard
	})
})

// Обработка нажатий на inline клавиатуру
bot.on('callback_query:data', async ctx => {
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
		await ctx.reply(nextQuestion.text, {
			reply_markup: inlineKeyboard
		})

		await ctx.answerCallbackQuery()
		return
	}

	if (callbackData.isCorrect) {
		await ctx.reply('Верно 👌')

		// Выбираем следующий вопрос из той же темы
		const nextQuestion = getRandomQuestion(currentTopic)

		// Создаем inline клавиатуру для нового вопроса
		let inlineKeyboard
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
		await ctx.reply(nextQuestion.text, {
			reply_markup: inlineKeyboard
		})

		await ctx.answerCallbackQuery()
		return
	}

	const answer = getCorrectAnswer(currentTopic, currentQuestionId)
	await ctx.reply(`*Неверно*!!! ❌ \nЯ так и думал что ты Непись 🫵 \n*Правильный: ${answer}* 👀`, { parse_mode: 'Markdown' })
	await ctx.answerCallbackQuery()
})

// Обработка ошибок
bot.catch(err => {
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
})

// Запуск бота
bot.start()
