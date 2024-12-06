const apiUrl = "http://127.0.0.1:8000/records/";

const USAGE_CONFIG = {
    youtube_time:{
        label: 'youtubeTime',
        factor: 0.46,
        breakdownText: 'Youtube Time',
        type: 'hours'
    },
    tiktok_time:{
        label: 'tiktokTime',
        factor: 2.63,
        breakdownText: 'Tiktok Time',
        type: 'hours'
    },
    instagram_time:{
        label: 'instagramTime',
        factor: 1.5,
        breakdownText: 'Instagram Time',
        type: 'hours'
    },
    facebook_time:{
        label: 'facebookTime',
        factor: 0.79,
        breakdownText: 'Facebook Time',
        type: 'hours'
    },
    snapchat_time:{
        label: 'snapchatTime',
        factor: 0.87,
        breakdownText: 'Snapchat Time',
        type: 'hours'
    },
    reddit_time:{
        label: 'redditTime',
        factor: 2.48,
        breakdownText: 'Reddit Time',
        type: 'hours'
    },
    pinterest_time:{
        label: 'pinterestTime',
        factor: 1.3,
        breakdownText: 'Pinterest Time',
        type: 'hours'
    },
    linkedin_time:{
        label: 'linkedinTime',
        factor: 0.71,
        breakdownText: 'LinkedIn Time',
        type: 'hours'
    },
    twitter_time:{
        label: 'twitterTime',
        factor: 0.6,
        breakdownText: 'Twitter Time',
        type: 'hours'
    },
    twitch_time:{
        label: 'twitchTime',
        factor: 0.55,
        breakdownText: 'Twitch Time',
        type: 'hours'
    },
    netflix_time:{
        label: 'netflixTime',
        factor: 55,
        breakdownText: 'Netflix Time',
        type: 'hours'
    },
    disneyplus_time:{
        label: 'disneyplusTime',
        factor: 22,
        breakdownText: 'Disney+ Time',
        type: 'hours'
    },
    text_count:{
        label: 'textCount',
        factor: 0.014,
        breakdownText: 'Texts',
        type: 'texts'
    },
    emails_count:{
        label: 'emailCount',
        factor: 0.3,
        breakdownText: 'Emails',
        type: 'emails'
    },
    google_searches_count:{
        label: 'googleSearchCount',
        factor: 0.2,
        breakdownText: 'Google Searches',
        type: 'searches'
    }
};

// register listeners
for (const [_, value] of Object.entries(USAGE_CONFIG)) {
    const slider = document.getElementById(value.label);
    
    if (slider) {
        const valueDisplay = document.getElementById(`${value.label}Value`);
        
        slider.addEventListener('input', () => {
            valueDisplay.textContent = `${slider.value} ${value.type}`;
        });
    }
}

//calculate emissions
function calculateAndRedirect() {
    let total = 0;
    let recordData = {};

    recordData.session_id = "gfdgdfgdfg"
    for (const [key, value] of Object.entries(USAGE_CONFIG)) {
        const curr = parseInt(document.getElementById(value.label).value, 10); // Get the slider value as an integer
        let currEmissions = value.factor * curr;

        // Multiply by 60 only if the type is 'hours'
        if (value.type === 'hours') {
            currEmissions *= 60;
        }

        currEmissions = currEmissions / 1000; // Convert to kg
        localStorage.setItem(`${value.label}Emissions`, currEmissions.toFixed(2));
        total += currEmissions;
        recordData[key] = curr;
    }
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Record created:', data);
        localStorage.setItem('totalEmissions', total.toFixed(2));
        // Redirect to results page
        window.location.href = 'results.html';
    })
    .catch(error => {
        console.error('Error creating record:', error);
    });
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
