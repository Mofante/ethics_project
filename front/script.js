const apiUrl = "http://127.0.0.1:8000/records/";

const form = document.getElementById("form");


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const netflix_time = document.getElementById("netflix_time").value;
    const tiktok_time = document.getElementById("tiktok_time").value;
    const session_id = "fasdfasdgasd";

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id, netflix_time, tiktok_time }),
    });

    if (response.ok) {
        alert("Success!")
    } else {
        alert("Failed to submit your answers!");
    }
});
