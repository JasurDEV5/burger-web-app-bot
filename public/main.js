		// Function to get query parameter value by name
		function getQueryParam(name) {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.get(name);
		}

		// Get chatId from the URL and set it in the form
		const chatId = getQueryParam('chat_id');
		document.getElementById('chatId').value = chatId;

		// Hide the loading animation after 5 seconds
		window.addEventListener('load', () => {
			setTimeout(() => {
				const loading = document.getElementById('loading');
				loading.style.display = 'none';
			}, 3000); // 3 seconds delay
		});

		// Function to update the total price
		function updateTotalPrice() {
			let totalPrice = 0;
			document.querySelectorAll('.box').forEach(box => {
				const quantity = parseInt(box.querySelector('input[name="quantities"]').value) || 0;
				const price = parseInt(box.querySelector('input[name="prices"]').value) || 0;
				totalPrice += quantity * price;
			});
			document.getElementById('total-price').textContent = totalPrice;
		}

		// Handle form submission
		document.getElementById('order-button').addEventListener('click', function() {
			const name = document.getElementById('name').value.trim();
			const callNumber = document.getElementById('call_number').value.trim();

			if (!name || !callNumber) {
				// Show error alert if name or phone number is missing
				const errorAlert = document.querySelector('.alert-danger');
				errorAlert.classList.remove('alert-none');
				setTimeout(() => {
					errorAlert.classList.add('alert-none');
				}, 2000);
				return; // Stop form submission
			}

			const form = document.getElementById('order-form');
			const formData = new FormData(form);
			const data = {
				chatId: document.getElementById('chatId').value,
				name: name,
				callNumber: callNumber,
				orderDetails: []
			};

			let hasProduct = false;

			document.querySelectorAll('.box').forEach(box => {
				const productName = box.querySelector('input[name="product"]').value;
				const quantity = parseInt(box.querySelector('input[name="quantities"]').value) || 0;
				const price = parseInt(box.querySelector('input[name="prices"]').value) || 0;
				if (quantity > 0) {
					hasProduct = true;
					data.orderDetails.push({
						product: productName,
						quantity: quantity,
						price: price
					});
				}
			});

			if (!hasProduct) {
				// Show error alert if no product is selected
				const errorAlert = document.querySelector('.alert-danger');
				errorAlert.classList.remove('alert-none');
				setTimeout(() => {
					errorAlert.classList.add('alert-none');
				}, 2000);
				return; // Stop form submission
			}

			// Calculate total price
			const totalPrice = data.orderDetails.reduce((total, item) => total + (item.price * item.quantity), 0);
			document.getElementById('total-price').textContent = totalPrice;

			// Send the order to the server (replace URL with your webhook URL)
			fetch('https://burger-bot-2638292ac8ae.herokuapp.com/order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})
				.then(response => response.json())
				.then(data => {
					console.log('Success:', data)
					// Show success alert
					const successAlert = document.querySelector('.alert-success')
					successAlert.classList.remove('alert-none')
					location.reload()
					setTimeout(() => {
						successAlert.classList.add('alert-none')
					}, 2000)
				})
				.catch(error => {
					console.error('Error:', error)
					// Show error alert
					const errorAlert = document.querySelector('.alert-danger')
					errorAlert.classList.remove('alert-none')
					setTimeout(() => {
						errorAlert.classList.add('alert-none')
					}, 2000)
				})
		});

		// Increase and decrease quantity functionality
		document.addEventListener('DOMContentLoaded', () => {
			document.querySelectorAll('.box').forEach(box => {
				const decButton = box.querySelector('.dec');
				const incButton = box.querySelector('.inc');
				const quantityInput = box.querySelector('input[name="quantities"]');

				decButton.addEventListener('click', () => {
					let value = parseInt(quantityInput.value) || 0;
					if (value > 0) {
						quantityInput.value = value - 1;
						updateTotalPrice(); // Update total price
					}
				});

				incButton.addEventListener('click', () => {
					let value = parseInt(quantityInput.value) || 0;
					quantityInput.value = value + 1;
					updateTotalPrice(); // Update total price
				});
			});
		});