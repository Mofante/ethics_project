const USAGE_CONFIG = {
    socialMedia: {
        label: 'socialMedia',
        factor: 0.05,
        breakdownText: 'Social Media'
    },
    streaming: {
        label: 'streaming',
        factor: 0.2,
        breakdownText: 'Video Streaming'
    },
    gaming: {
        label: 'gaming',
        factor: 0.3,
        breakdownText: 'Online Gaming'
    },
    videoConference: {
        label: 'videoConference',
        factor: 0.15,
        breakdownText: 'Video Conferencing'
    }
};

// register listeners
for (const [_, value] of Object.entries(USAGE_CONFIG)) {
    const slider = document.getElementById(value.label);
    
    if (slider) {
        const valueDisplay = document.getElementById(`${value.label}Value`);
        
        slider.addEventListener('input', () => {
            valueDisplay.textContent = `${slider.value} hours`;
        });
    }
}

//calculate emissions
function calculateAndRedirect() {
    let total = 0;
    
    for (const [_, value] of Object.entries(USAGE_CONFIG)) {
        const curr = document.getElementById(value.label).value;
        const currEmissions = value.factor * curr;
        total += currEmissions;
        localStorage.setItem(`${value.label}Emissions`, currEmissions.toFixed(2));
    }

    localStorage.setItem('totalEmissions', total.toFixed(2));

    // TODO: backend call here

    // Redirect to results page
    window.location.href = 'results.html';
}

// Function to load results on results page
function loadResults() {
    const totalEmissionsElement = document.getElementById('totalEmissions');
    const breakdownDetailsElement = document.getElementById('breakdownDetails');
    
    if (totalEmissionsElement && breakdownDetailsElement) {
        const totalEmissions = localStorage.getItem('totalEmissions');

        let breakdownText = '';

        for (const [_, value] of Object.entries(USAGE_CONFIG)) {
            const curr = localStorage.getItem(`${value.label}Emissions`);
            
            if (value.label === 'videoConference') {
                breakdownText += `${value.breakdownText}: ${curr} kg`;
            } else {
                breakdownText += `${value.breakdownText}: ${curr} kg<br>`;
            }
        }

        totalEmissionsElement.textContent = `Total CO2: ${totalEmissions} kg`;
        breakdownDetailsElement.innerHTML = breakdownText;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('researchSurvey');
    
    if (surveyForm) {
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect survey responses
            const surveyData = {
                expectedResults: document.querySelector('input[name="expectedResults"]:checked')?.value,
                changeBehavior: document.querySelector('input[name="changeBehavior"]:checked')?.value,
                surprisingActivity: document.getElementById('surprisingActivity').value,
                motivation: document.getElementById('motivation').value,
                totalEmissions: localStorage.getItem('totalEmissions')
            };

            // TODO: send to server
            console.log('Survey Response:', surveyData);

            // Hide survey, show thank you message
            document.getElementById('survey').style.display = 'none';
            document.getElementById('thankYou').style.display = 'block';
        });
    }
});

// Call loadResults when on results page
if (window.location.pathname.endsWith('results.html')) {
    loadResults();
}
