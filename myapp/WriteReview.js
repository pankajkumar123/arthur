const reviewForm = document.getElementById('reviewForm');
const ratingLabel = document.getElementById('ratingLabel');
const reviewStatus = document.getElementById('reviewStatus');

const ratingLabels = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent'
};

document.querySelectorAll('input[name="rating"]').forEach((input) => {
  input.addEventListener('change', () => {
    ratingLabel.textContent = ratingLabels[input.value] || 'Select a rating';
  });
});

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  reviewStatus.textContent = '';

  const rating = reviewForm.querySelector('input[name="rating"]:checked');
  if (!rating) {
    reviewStatus.textContent = 'Please select a rating before submitting.';
    reviewStatus.style.color = '#b42318';
    return;
  }

  if (!reviewForm.checkValidity()) {
    reviewStatus.textContent = 'Please complete the required fields.';
    reviewStatus.style.color = '#b42318';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('rating', rating.value);
    formData.append('title', reviewForm.elements.title.value.trim());
    formData.append('details', reviewForm.elements.details.value.trim());
    formData.append('pros', reviewForm.elements.pros.value.trim());
    formData.append('cons', reviewForm.elements.cons.value.trim());
    formData.append('recommend', reviewForm.elements.recommend.checked);

    const photoInput = document.getElementById('reviewPhotos');
    if (photoInput && photoInput.files) {
      Array.from(photoInput.files).forEach((file) => {
        formData.append('photos', file);
      });
    }

    const response = await fetch(`${window.API_BASE || 'http://localhost:4000/api'}/reviews`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Failed to submit review');
    }

    reviewStatus.textContent = 'Thank you! Your review has been submitted.';
    reviewStatus.style.color = '#2d8f5b';
    reviewForm.reset();
    ratingLabel.textContent = 'Select a rating';
  } catch (error) {
    reviewStatus.textContent = error.message;
    reviewStatus.style.color = '#b42318';
  }
});

