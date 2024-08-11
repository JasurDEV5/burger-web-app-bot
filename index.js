const express = require('express')
const TelegramBot = require('node-telegram-bot-api')
const path = require('path')
const cors = require('cors')
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const bot = new TelegramBot('7211274590:AAE4mCuk3RGZj_HKZLuB-qlyH1jpeThs9_c', {
	polling: true,
})
const groupId = '-1002159292810' // Replace with your group ID

bot.onText(/\/start/, msg => {
	const chatId = msg.chat.id
	const options = {
		reply_markup: {
			keyboard: [
				[
					{
						text: 'Buyurtma berish',
						web_app: {
							url: `https://burger-bot-2638292ac8ae.herokuapp.com?chat_id=${chatId}`,
						},
					},
				],
			],
			resize_keyboard: true,
		},
	}
	bot.sendMessage(chatId, 'Salom, Burger Housega Hushkelibsiz!\nbot test rejimda, buyurtma berish uchun pastagi tugmani bosing', options)
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
		bot.sendMessage(chatId, `Sizning buyurtmangiz:\n\n${orderMessage}`),
		bot.sendMessage(
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

app.listen(process.env.PORT || 3000, () => {
	console.log('Server is running on port 3000')
})
