/**
 * EEE Department - EmailJS Integration Module
 * Centralized email handling with WhatsApp fallback
 */

(function () {
    // 1. Initialize EmailJS with your Public Key
    const PUBLIC_KEY = "wPkLyIaCK35YK8UAb";
    const SERVICE_ID = "service_hqlvo6l";
    const TEMPLATE_ID = "template_hsems46";
    const WHATSAPP_NUMBER = "919629001144";

    // Initialize the SDK
    if (typeof emailjs !== 'undefined') {
        emailjs.init(PUBLIC_KEY);
    }

    /**
     * Common function to handle form submission
     * @param {HTMLFormElement} formElement - The form to submit
     * @param {HTMLElement} statusElement - Element to show success/error messages
     * @param {HTMLButtonElement} submitButton - The submit button to toggle states
     */
    window.handleAdmissionSubmission = function (formElement, statusElement, submitButton) {
        if (!formElement) return;

        // Set Loading State
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            const btnText = submitButton.querySelector('.btn-text');
            if (btnText) btnText.dataset.originalText = btnText.innerHTML;
        }

        if (statusElement) {
            statusElement.style.display = 'none';
            statusElement.className = '';
        }

        console.log('Attempting EmailJS submission...');

        // 2. Try sending via EmailJS
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formElement)
            .then((response) => {
                console.log('EmailJS SUCCESS:', response);
                handleSuccess(formElement, statusElement, submitButton);
            }, (error) => {
                console.error('EmailJS FAILED:', error);
                handleFailure(formElement, statusElement, submitButton, error);
            });
    };

    function handleSuccess(form, status, btn) {
        if (btn) btn.classList.remove('loading');

        // Hide form and show success message
        form.style.display = 'none';

        // Find or create success message
        let successMsg = document.getElementById('formSuccess') || status;
        if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.className = 'success-message success';
            successMsg.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: #28a745; margin-bottom: 15px;"></i>
                    <h3>Application Submitted Successfully!</h3>
                    <p>We have received your enquiry. Our admissions team will contact you shortly.</p>
                    <button onclick="window.location.reload()" style="margin-top: 15px; padding: 10px 20px; border: none; background: #003366; color: white; border-radius: 5px; cursor: pointer;">Send Another Enquiry</button>
                </div>
            `;
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function handleFailure(form, status, btn, error) {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('loading');
        }

        const formData = new FormData(form);
        const name = formData.get('from_name') || 'Student';
        const program = formData.get('selected_program') || 'EEE Program';

        // Detailed Error Message
        const errorText = error.text || error.message || "Account Configuration Issue";

        // WhatsApp Fallback Link
        const waMessage = encodeURIComponent(
            `*Admission Enquiry - EEE Department*\n\n` +
            `*Name:* ${formData.get('from_name') || 'N/A'}\n` +
            `*Email:* ${formData.get('reply_to') || 'N/A'}\n` +
            `*Phone:* ${formData.get('phone_number') || 'N/A'}\n` +
            `*Program:* ${formData.get('selected_program') || 'N/A'}\n\n` +
            `_Note: Technical issue with website email (${errorText})_`
        );
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

        if (status) {
            status.style.display = 'block';
            status.className = 'error-message error';
            status.innerHTML = `
                <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 20px; border-radius: 12px; text-align: left; margin-top: 15px;">
                    <p style="color: #c53030; font-weight: 700; margin-bottom: 8px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Submission Issue (${errorText})
                    </p>
                    <p style="font-size: 14px; color: #4a5568; margin-bottom: 15px;">
                        We encountered an issue with the email server. Don't worry, your details are safe! 
                        Please click below to complete your registration via WhatsApp.
                    </p>
                    <a href="${waLink}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; color: white; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 700; transition: all 0.3s ease;">
                        <i class="fa-brands fa-whatsapp" style="font-size: 1.2rem;"></i> Continue via WhatsApp
                    </a>
                </div>
            `;
            status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert("Email service issue. Opening WhatsApp fallback...");
            window.open(waLink, '_blank');
        }
    }
})();
