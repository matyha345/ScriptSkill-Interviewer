// Импорт вопросов из JSON файла
const questions = require('./questions.json')

// Импорт модуля Random из библиотеки random-js
const { Random } = require('random-js')

// Функция для получения случайного вопроса по заданной теме
const getRandomQuestion = topic => {
	// Создание экземпляра Random
	const random = new Random()

	// Преобразование темы к нижнему регистру
	const questionTopic = topic.toLowerCase()

	// Получение случайного индекса вопроса в рамках заданной темы
	const randomQuestionIndex = random.integer(
		0,
		questions[questionTopic].length - 1
	)

	// Возврат случайного вопроса из заданной темы
	return questions[questionTopic][randomQuestionIndex]
}

// Функция для получения корректного ответа на вопрос
const getCorrectAnswer = (topic, id) => {
	// Получение списка вопросов по заданной теме
	const topicQuestions = questions[topic]
	if (!topicQuestions) {
		// Если тема не найдена, возвращается сообщение об ошибке
		return 'Я так и думал что ты Непись🫵! Попробуй еще раз.'
	}

	// Поиск вопроса по его идентификатору
	const question = topicQuestions.find(question => question.id === id)

	if (!question.hasOptions) {
		// Если у вопроса нет вариантов ответа, возвращается ответ на вопрос
		return question.answer
	}

	// Если у вопроса есть варианты ответа, возвращается текст корректного ответа
	return question.options.find(option => option.isCorrect).text
}

// Экспорт функций getRandomQuestion и getCorrectAnswer для использования в других модулях
module.exports = { getRandomQuestion, getCorrectAnswer }
