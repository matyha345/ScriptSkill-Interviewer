const { InlineKeyboard } = require('grammy')

// Функция создания inline-клавиатуры
const createInlineKeyboard = (currentTopic = null, nextQuestion = null) => {
	let inlineKeyboard

	// Создание кнопок в зависимости от наличия вопроса или вариантов ответа
	if (nextQuestion && nextQuestion.hasOptions) {
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

	return inlineKeyboard
}

// Функция отправки форматированных сообщений
const sendFormattedMessage = async (ctx, image, text, inlineKeyboard) => {
	const replyOptions = image
		? ctx.replyWithPhoto(image, { reply_markup: inlineKeyboard })
		: ctx.reply(text, { reply_markup: inlineKeyboard })

	await replyOptions

	return replyOptions
}

module.exports = { createInlineKeyboard, sendFormattedMessage }
