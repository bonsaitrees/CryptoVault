document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const statusMessage = document.getElementById('statusMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                // Show loading state
                statusMessage.textContent = 'Sending message...';
                statusMessage.className = 'status-message loading';

                // Send form data
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    statusMessage.textContent = data.message || 'Message sent successfully!';
                    statusMessage.className = 'status-message success';
                    contactForm.reset();
                } else {
                    // Show error message
                    statusMessage.textContent = data.message || 'Error sending message. Please try again.';
                    statusMessage.className = 'status-message error';
                }
            } catch (error) {
                console.error('Error:', error);
                statusMessage.textContent = 'Error sending message. Please try again.';
                statusMessage.className = 'status-message error';
            }
        });
    }
}); 