const formTab = document.getElementById('formTab');
const uploadTab = document.getElementById('uploadTab');
const formPanel = document.getElementById('formPanel');
const uploadPanel = document.getElementById('uploadPanel');
const addRowBtn = document.getElementById('addRowBtn');
const quoteTableBody = document.querySelector('#quoteTable tbody');
const rfqForm = document.getElementById('rfqForm');
const formStatus = document.getElementById('formStatus');
const uploadSubmit = document.getElementById('uploadSubmit');
const rfqFile = document.getElementById('rfqFile');
const uploadContact = document.getElementById('uploadContact');
const uploadStatus = document.getElementById('uploadStatus');

function switchTab(activeTab) {
	const isForm = activeTab === 'form';
	formTab.classList.toggle('active', isForm);
	uploadTab.classList.toggle('active', !isForm);
	formTab.setAttribute('aria-selected', String(isForm));
	uploadTab.setAttribute('aria-selected', String(!isForm));
	formPanel.classList.toggle('active', isForm);
	uploadPanel.classList.toggle('active', !isForm);
}

formTab.addEventListener('click', () => switchTab('form'));
uploadTab.addEventListener('click', () => switchTab('upload'));

addRowBtn.addEventListener('click', () => {
	const currentRows = quoteTableBody.querySelectorAll('tr').length;
	const nextIndex = currentRows + 1;
	const row = document.createElement('tr');

	row.innerHTML = `
		<td>${nextIndex}</td>
		<td><input type="text" name="brand_${nextIndex}" placeholder="Optional"></td>
		<td><input type="text" name="description_${nextIndex}" required></td>
		<td><input type="text" name="price_${nextIndex}" placeholder="INR"></td>
		<td><input type="number" name="qty_${nextIndex}" min="1" required></td>
	`;

	quoteTableBody.appendChild(row);
});

rfqForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	formStatus.textContent = '';

	if (!rfqForm.checkValidity()) {
		formStatus.textContent = 'Please fill all required fields.';
		formStatus.style.color = '#b42318';
		return;
	}


	const items = Array.from(quoteTableBody.querySelectorAll('tr')).map((row) => {
		const cells = row.querySelectorAll('input');
		return {
			brand: cells[0]?.value || '',
			description: cells[1]?.value || '',
			targetPrice: cells[2]?.value || '',
			quantity: cells[3]?.value || ''
		};
	});

	try {
		await window.apiFetch('/rfq', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				fullName: rfqForm.fullName.value.trim(),
				phone: rfqForm.phone.value.trim(),
				email: rfqForm.email.value.trim(),
				company: rfqForm.company.value.trim(),
				gst: rfqForm.gst.value.trim(),
				address: rfqForm.address.value.trim(),
				pincode: rfqForm.pincode.value.trim(),
				city: rfqForm.city.value.trim(),
				state: rfqForm.state.value.trim(),
				agentAssist: rfqForm.agentAssist.checked,
				items
			})
		});

		formStatus.textContent = 'Request submitted. Our team will reach out within 48 hours.';
		formStatus.style.color = '#2d8f5b';
		rfqForm.reset();
		quoteTableBody.innerHTML = `
			<tr>
				<td>1</td>
				<td><input type="text" name="brand_1" placeholder="Optional"></td>
				<td><input type="text" name="description_1" required></td>
				<td><input type="text" name="price_1" placeholder="INR"></td>
				<td><input type="number" name="qty_1" min="1" required></td>
			</tr>
		`;
	} catch (error) {
		formStatus.textContent = error.message;
		formStatus.style.color = '#b42318';
	}
});

uploadSubmit.addEventListener('click', async () => {
	uploadStatus.textContent = '';
	if (!rfqFile.files.length || !uploadContact.value.trim()) {
		uploadStatus.textContent = 'Please upload a file and share contact details.';
		uploadStatus.style.color = '#b42318';
		return;
	}

	const formData = new FormData();
	formData.append('file', rfqFile.files[0]);
	formData.append('contact', uploadContact.value.trim());

	try {
		const response = await fetch(`${window.API_BASE || 'http://localhost:4000/api'}/rfq/upload`, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const payload = await response.json().catch(() => ({}));
			throw new Error(payload.error || 'Upload failed');
		}

		uploadStatus.textContent = 'Upload received. We will send the quote shortly.';
		uploadStatus.style.color = '#2d8f5b';
		rfqFile.value = '';
		uploadContact.value = '';
	} catch (error) {
		uploadStatus.textContent = error.message;
		uploadStatus.style.color = '#b42318';
	}
});
