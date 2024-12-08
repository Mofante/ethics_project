const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:8000"
    : "https://mofante.pythonanywhere.com";
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

function generateSessionId() {
    return crypto.randomUUID();
}

//calculate emissions
function calculateAndRedirect() {
    let total = 0;
    let recordData = {};

    // Check if session_id already exists in localStorage
    let sessionId = localStorage.getItem('session_id');
    let registeredUser = true;

    if (!sessionId) {
        registeredUser = false;
        sessionId = generateSessionId();
        window.localStorage.setItem('session_id', sessionId);
        recordData['session_id'] = sessionId;
    }

    for (const [key, value] of Object.entries(USAGE_CONFIG)) {
        const curr = parseInt(document.getElementById(value.label).value, 10);
        let currEmissions = value.factor * curr;
        document.getElementById(value.label).value = 0;

        // Multiply by 60 only if the type is 'hours'
        if (value.type === 'hours') {
            currEmissions *= 60;
        }

        currEmissions = currEmissions / 1000; // Convert to kg
        window.localStorage.setItem(`${value.label}Emissions`, currEmissions.toFixed(2));
        total += currEmissions;
        recordData[key] = curr;
    }

    localStorage.setItem('recordData', JSON.stringify(recordData));

    if(!registeredUser){
        fetch(apiUrl + '/records/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Record created:', data);
            window.localStorage.setItem('totalEmissionsNumber', total);
            window.localStorage.setItem('totalEmissions', total.toFixed(2));
            // Redirect to results page
            window.location.href = 'results.html';
        })
        .catch(error => {
            console.error('Error creating record:', error);
        });
    } else {
        window.localStorage.setItem('totalEmissionsNumber', total);
        window.localStorage.setItem('totalEmissions', total.toFixed(2));
        window.location.href = 'results.html';
    }
}

// Function to load results on results page
function loadResults() {
    const totalEmissionsElement = document.getElementById('totalEmissions');
    const breakdownDetailsElement = document.getElementById('breakdownDetails');
    const recordData = JSON.parse(localStorage.getItem('recordData'));

    if (totalEmissionsElement && breakdownDetailsElement) {
        const totalEmissions = localStorage.getItem('totalEmissions');

        let breakdownText = '';

        for (const [_, value] of Object.entries(USAGE_CONFIG)) {
            const curr = localStorage.getItem(`${value.label}Emissions`);
            breakdownText += `${value.breakdownText}: ${curr} kg<br>`;
        }

        totalEmissionsElement.textContent = `Total CO2: ${totalEmissions} kg`;
        breakdownDetailsElement.innerHTML = breakdownText;
        displayPersonalizedTips(recordData);
    }
}

function displayPersonalizedTips(recordData) {
    const tipsSection = document.querySelector('.result-section.personalized-tips');
    let feedbackText = '<h2>Personalized Feedback and Tips</h2>';

    // Calculate usage for each category
    const streamingHours = (recordData.netflix_time || 0) + 
                           (recordData.youtube_time || 0) + 
                           (recordData.twitch_time || 0) + 
                           (recordData.disneyplus_time || 0);

    const socialMediaHours = (recordData.tiktok_time || 0) + 
                             (recordData.instagram_time || 0) + 
                             (recordData.facebook_time || 0) + 
                             (recordData.snapchat_time || 0) + 
                             (recordData.reddit_time || 0) + 
                             (recordData.pinterest_time || 0) + 
                             (recordData.linkedin_time || 0) + 
                             (recordData.twitter_time || 0);

    const messagingCount = recordData.text_count || 0;
    const emailCount = recordData.emails_count || 0;
    const searchCount = recordData.google_searches_count || 0;

    // Generate feedback for each category
    feedbackText += `<div><strong>Streaming:</strong> ${getFeedbackForCategory('streaming', streamingHours)}</div>`;
    feedbackText += `<div><strong>Social Media:</strong> ${getFeedbackForCategory('socialMedia', socialMediaHours, recordData.tiktok_time > 0)}</div>`;
    feedbackText += `<div><strong>Messaging:</strong> ${getFeedbackForCategory('messaging', messagingCount)}</div>`;
    feedbackText += `<div><strong>Emails:</strong> ${getFeedbackForCategory('emails', emailCount)}</div>`;
    feedbackText += `<div><strong>Searches:</strong> ${getFeedbackForCategory('searches', searchCount)}</div>`;

    tipsSection.innerHTML = feedbackText;
}


function categorizeUsage(weeklyUsage, thresholds) {
    if (weeklyUsage < thresholds.low) {
        return 'low';
    } else if (weeklyUsage < thresholds.high) {
        return 'moderate';
    } else {
        return 'high';
    }
}


function getFeedbackForCategory(category, usage, isTikTokUsed = false) {
    const thresholds = {
        streaming: { low: 7, high: 14 },
        socialMedia: { low: 3.5, high: 7 },
        messaging: { low: 140, high: 700 },
        emails: { low: 70, high: 250 },
        searches: { low: 70, high: 210 }
    };

    const feedbackMessages = {
        streaming: {
            low: "Nice! Your streaming habits are keeping your carbon footprint low. Remember, streaming on lower quality also reduces energy consumption.",
            moderate: "Your streaming is moderate, but did you know that streaming on high quality for 2 hours emits about 110g of CO2e on Netflix? Consider downloading videos instead of streaming multiple times!",
            high: "You’re spending a lot of time streaming! Did you know that 3 hours of Netflix emits about 165g of CO2e, which is equivalent to driving a car 1 km? Streaming less and downloading instead can help reduce your footprint."
        },
        socialMedia: {
            low: isTikTokUsed ? "You’re keeping your social media footprint low—great work! TikTok emits about 2.63g CO2e per minute, so 30 minutes adds up to 79g CO2e. That’s higher than Instagram (45g) or Facebook (23.7g) for the same time. Short sessions like yours are a great way to keep your impact minimal!" : "Great job staying mindful about your social media time! For example, spending 30 minutes on Instagram emits 45g of CO2e, while the same time on YouTube emits only 13.8g. Choosing platforms with lower emissions is a simple way to help the planet.",
            moderate: isTikTokUsed ? "Your social media use is moderate, but TikTok is one of the more energy-intensive platforms, emitting 158g CO2e for an hour. Compare that to Instagram at 90g, Facebook at 47.4g, or YouTube at just 27.6g. Reducing time spent on high-impact platforms like TikTok can significantly lower your footprint." : "Your social media use is reasonable. For instance, an hour on Instagram emits about 90g CO2e, Facebook 47.4g, and Reddit 148.8g. If you’re looking to reduce your footprint, spending more time on platforms like YouTube (27.6g/hour) or Twitch (33g/hour) is a great option.",
            high: isTikTokUsed ? "You’re a heavy social media user, and TikTok can have a big impact—2 hours emits 316g CO2e. By comparison, Instagram emits 180g, Facebook 94.8g, and YouTube only 55.2g for the same time. Consider cutting down TikTok time to balance your footprint." : "You’re spending a lot of time on social media and emitting a lot of CO2. For example, 2 hours on Instagram emits 180g CO2e, while Facebook is much lower at 94.8g, and YouTube is even lower at 55.2g. Switching to less energy-intensive platforms or limiting overall usage can help reduce your footprint."
        },
        messaging: {
            low: "Your messaging habits are great! Keep it up. Fun fact: A text message emits just 0.014g CO2e—very eco-friendly!",
            moderate: "Your messaging is moderate, but remember: sending photos significantly increases the carbon footprint, up to 4g per photo. Stick to text when you can!",
            high: "That's a lot of messages! A single photo can emit up to 4g of CO2! Switching to calls or sending fewer photos can help reduce your impact. Tip: instead of sending all the pictures of your trip, try selecting the 3 most beautiful ones."
        },
        emails: {
            low: "You're keeping your inbox lean—great for the planet! Fun fact: deleting unnecessary emails helps reduce server loads and CO2 emissions.",
            moderate: "Your email usage is moderate. Did you know? Each email emits about 0.3g of CO2e. Cleaning out spam and reducing unnecessary replies can make a big difference!",
            high: "Your email inbox is working overtime! Sending fewer emails or consolidating messages can significantly reduce your footprint. Consider deleting old emails to save energy on servers."
        },
        searches: {
            low: "Your search habits are eco-friendly! Did you know that one Google search emits about 0.2g of CO2e? Using bookmarks for frequent sites can reduce this even further.",
            moderate: "Your searches are reasonable, but remember: searching efficiently by using exact keywords can lower energy use. Try bookmarking frequently visited sites!",
            high: "That’s a lot of searches! Each Google search emits 0.2g of CO2e. Consider using bookmarks or searching less frequently to cut down your digital footprint."
        }
    };

    const usageCategory = categorizeUsage(usage, thresholds[category]);
    return feedbackMessages[category][usageCategory];
}

document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('researchSurvey');
    
    if (surveyForm) {
        // Check if the survey has already been submitted
        if (localStorage.getItem('surveySubmitted')) {
            document.getElementById('survey').style.display = 'none';
            document.getElementById('thankYou').style.display = 'block';
        } else {
            surveyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Collect survey responses
                const surveyData = {
                    expected_results: document.querySelector('input[name="expectedResults"]:checked')?.value,
                    change_behavior: document.querySelector('input[name="changeBehavior"]:checked')?.value,
                    surprising_activity: document.getElementById('surprisingActivity').value,
                    motivation: document.getElementById('motivation').value,
                    total_emissions: Number(localStorage.getItem('totalEmissionsNumber'))
                };

                // Validation to ensure all required fields are filled
                if (surveyData.expected_results === undefined || surveyData.change_behavior === undefined || surveyData.surprising_activity === "") {
                    alert('Please answer all questions');
                    return;
                }

                // Send survey data to server
                fetch(apiUrl + '/survey/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(surveyData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Survey Response:', data);
                    window.localStorage.setItem('surveySubmitted', 'true');
                    document.getElementById('survey').style.display = 'none';
                    document.getElementById('thankYou').style.display = 'block';
                })
                .catch(error => {
                    console.error('Error submitting survey:', error);
                });
            });
        }
    }
});

// Call loadResults when on results page
if (window.location.pathname.endsWith('results.html')) {
    loadResults();
}
