const express = require('express')
const { Telegraf, Markup } = require('telegraf')
const path = require('path')
const cors = require('cors')

require('dotenv').config()

const app = express()
app.use(cors())
const bot = new Telegraf('7211274590:AAE4mCuk3RGZj_HKZLuB-qlyH1jpeThs9_k')
const groupId = '-1002159292810' // Replace with your group ID

app.use(express.json())
app.use(express.static('public'))

bot.start(ctx => {
	const chatId = ctx.chat.id
	const url = `https://burger-web-app-bot.netlify.app?chat_id=${chatId}` // Replace with your actual URL
	ctx.reply(
		'Salom, Burger Housega Hushkelibsiz!\n bot test rejimda, buyurtma berish uchun pastagi tugmani bosing',
		Markup.inlineKeyboard([Markup.button.url('Buyurtma berish', url)])
	)
})

app.get('/register', (req, res) => {
	const chatId = req.query.chat_id
	console.log('Chat ID registered:', chatId)
	res.json({ success: true })
})

app.get('/products', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/order', (req, res) => {
	const { chatId, name, callNumber, orderDetails } = req.body

	if (!chatId) {
		console.error('Chat ID is missing')
		return res.json({ success: false, message: 'Chat ID is missing' })
	}

	// Format the order message
	let orderMessage = `Buyurtmachi nomi: ${name}\n`
	orderMessage += `Telefon raqam: ${callNumber}\n\n`
	orderMessage += `Buyurtmalar:\n`
	orderDetails.forEach(item => {
		orderMessage += `${item.product} - ${item.quantity} x ${item.price} sum\n`
	})
	let totalPrice = orderDetails.reduce(
		(acc, item) => acc + item.quantity * item.price,
		0
	)
	orderMessage += `\nUmumiy summa: ${totalPrice} soum`

	Promise.all([
		bot.telegram.sendMessage(
			chatId,
			`Sizning buyurtmangiz:\n\n${orderMessage}`
		),
		bot.telegram.sendMessage(
			groupId,
			`Yangi buyurtma qabul qilindi:\n\n${orderMessage}`
		),
	])
		.then(() => {
			res.json({ success: true })
		})
		.catch(err => {
			console.error('Error sending order message:', err)
			res.json({ success: false, message: 'Error sending order message' })
		})
})

bot.launch()

const PORT = process.env.PORT || 3000// Ensure the port is not in use
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
