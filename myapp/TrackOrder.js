const trackForm = document.getElementById('trackForm');
const trackResults = document.getElementById('trackResults');
const statusPill = document.getElementById('statusPill');
const statusConfirmed = document.getElementById('statusConfirmed');
const statusPacked = document.getElementById('statusPacked');
const statusOut = document.getElementById('statusOut');
const statusDelivered = document.getElementById('statusDelivered');

const summaryOrderId = document.getElementById('summaryOrderId');
const summaryEta = document.getElementById('summaryEta');
const summaryAddress = document.getElementById('summaryAddress');
const summaryCourier = document.getElementById('summaryCourier');
const summaryLink = document.getElementById('summaryLink');

const steps = Array.from(document.querySelectorAll('.status-step'));
const statusOrder = ['confirmed', 'packed', 'out_for_delivery', 'delivered'];

function formatDate(date) {
	return date.toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

function updateTimeline(stageIndex, timestamps) {
	steps.forEach((step, index) => {
		step.classList.toggle('active', index <= stageIndex);
	});

	statusConfirmed.textContent = timestamps[0];
	statusPacked.textContent = timestamps[1] || 'Pending';
	statusOut.textContent = timestamps[2] || 'Pending';
	statusDelivered.textContent = timestamps[3] || 'Pending';

	const statusLabels = ['Confirmed', 'Packed', 'Out for delivery', 'Delivered'];
	statusPill.textContent = statusLabels[stageIndex] || 'Awaiting update';
}
trackForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const orderId = trackForm.orderId.value.trim();
	const contact = trackForm.contact.value.trim();

	if (!orderId || !contact) {
		return;
	}

	try {
		const response = await window.apiFetch(`/orders/${orderId}/tracking?contact=${encodeURIComponent(contact)}`);
		const events = response.events || [];
		let stageIndex = 0;
		const timestamps = [];

		events.forEach((eventItem) => {
			const status = eventItem.status || 'confirmed';
			const index = statusOrder.indexOf(status);
			if (index >= 0) {
				stageIndex = Math.max(stageIndex, index);
				timestamps[index] = formatDate(new Date(eventItem.occurred_at));
			}
		});

		updateTimeline(stageIndex, timestamps);

		summaryOrderId.textContent = response.orderNumber;
		summaryEta.textContent = formatDate(new Date(new Date(response.createdAt).getTime() + (3 - stageIndex) * 24 * 60 * 60 * 1000));
		summaryAddress.textContent = response.address;
		summaryCourier.textContent = 'Sai Scientifics Logistics';
		summaryLink.href = '#';

		trackResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
	} catch (error) {
		statusPill.textContent = 'Order not found';
		statusConfirmed.textContent = 'Pending';
		statusPacked.textContent = 'Pending';
		statusOut.textContent = 'Pending';
		statusDelivered.textContent = 'Pending';
		summaryOrderId.textContent = '-';
		summaryEta.textContent = '-';
		summaryAddress.textContent = '-';
		summaryCourier.textContent = '-';
		summaryLink.href = '#';
	}
});
