

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submitBtn').addEventListener('click', async function (e) {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const dob = document.getElementById('dateOfBirth').value;
        const contactNumber = document.getElementById('contactNumber').value;

        const data = {
            full_name: fullName,
            email: email,
            date_of_birth: dob,
            contact_number: contactNumber
        };

        try {
            const response = await fetch('http://localhost:3000/submit-survey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Survey submitted successfully!');
            } else {
                alert('Failed to submit survey.');
            }
        } catch (error) {
            alert('Error submitting survey.');
        }
    });
});