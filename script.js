

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submitBtn').addEventListener('click', async function (e) {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const dob = document.getElementById('dateOfBirth').value;
        const contactNumber = document.getElementById('contactNumber').value;
        // Collect selected favorite foods
        const foodCheckboxes = document.querySelectorAll('input[name="favouriteFood"]:checked');
        const favouriteFoods = Array.from(foodCheckboxes).map(cb => cb.value);
        // Check for empty fields
        if (!fullName || !email || !dob || !contactNumber) {
            alert('Please fill in all personal details.');
            return;
        }

        // Age validation
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 5 || age > 120) {
            alert('Age must be between 5 years and 120 years.');
            return;
        }

        if (favouriteFoods.length === 0) {
            alert('Please select at least one favourite food.');
            return;
        }

        // Rating validation
        for (let i = 1; i <= 4; i++) {
            if (!document.querySelector(`input[name="q${i}"]:checked`)) {
                alert('Please select a rating for each question.');
                return;
            }
        }

        const ratings = [];
        const questions = [
            "I like to watch movies",
            "I like to listen to radio",
            "I like to eat out",
            "I like to watch TV"
        ];
        for (let i = 1; i <= 4; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                ratings.push({
                    question: questions[i - 1],
                    rating: parseInt(selected.value)
                });
            }
        }

        const data = {
            full_name: fullName,
            email: email,
            date_of_birth: dob,
            contact_number: contactNumber,
            favourite_foods: favouriteFoods,
            ratings: ratings
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

document.getElementById('viewResultsBtn').addEventListener('click', function() {
    window.location.href = 'results.html';
});
document.getElementById('fillSurveybtn').addEventListener('click', function() {
    window.location.href = 'index.html';
});