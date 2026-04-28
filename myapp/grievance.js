const grievanceForm = document.getElementById('grievanceForm');
const grievanceStatus = document.getElementById('grievanceStatus');

if (grievanceForm) {
	grievanceForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		grievanceStatus.textContent = '';

		if (!grievanceForm.checkValidity()) {
			grievanceStatus.textContent = 'Please complete all required fields.';
			grievanceStatus.style.color = '#b42318';
			return;
		}


		try {
			const formData = new FormData();
			formData.append('fullName', document.getElementById('name').value.trim());
			formData.append('email', document.getElementById('email').value.trim());
			formData.append('phone', document.getElementById('phone').value.trim());
			formData.append('grievanceType', document.getElementById('type').value);
			formData.append('orderNumber', document.getElementById('order').value.trim());
			formData.append('subject', document.getElementById('subject').value.trim());
			formData.append('description', document.getElementById('description').value.trim());
			formData.append('incidentDate', document.getElementById('date').value);

			const fileInput = document.getElementById('attachment');
			if (fileInput && fileInput.files) {
				Array.from(fileInput.files).forEach((file) => {
					formData.append('attachments', file);
				});
			}

			const response = await fetch(`${window.API_BASE || 'http://localhost:4000/api'}/grievances`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.error || 'Failed to submit grievance');
			}

			grievanceStatus.textContent = 'Your grievance has been submitted. We will contact you within 24 hours.';
			grievanceStatus.style.color = '#2d8f5b';
			grievanceForm.reset();
		} catch (error) {
			grievanceStatus.textContent = error.message;
			grievanceStatus.style.color = '#b42318';
		}
	});
}
