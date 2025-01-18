

const videoCardContainer = document.querySelector(".video-wrapper");

const api_key = "AIzaSyAtln1S9nkC8lCiyxCzgMuvB-OyfbveDvk";
const video_http = "https://www.googleapis.com/youtube/v3/videos?";
const channel_http = "https://www.googleapis.com/youtube/v3/channels?";

// Fetch most popular videos
fetch(
    video_http +
    new URLSearchParams({
        part: "snippet,contentDetails,statistics,player",
        chart: "mostPopular",
        maxResults: 20,
        regionCode: "IN",
        key: api_key,
    })
)
    .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then((data) => {
        if (data.items && data.items.length > 0) {
            data.items.forEach((item) => {
                if (item.snippet && item.snippet.channelId) {
                    getChannelIcon(item);
                } else {
                    console.error("Invalid video data:", item);
                }
            });
        } else {
            console.error("No items found in the response.");
        }
    })
    .catch((err) => console.error("Error fetching videos:", err));

// Fetch channel details
const getChannelIcon = (video_data) => {
    fetch(
        channel_http +
        new URLSearchParams({
            key: api_key,
            part: "snippet",
            id: video_data.snippet.channelId,
        })
    )
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data.items && data.items[0]?.snippet?.thumbnails) {
                video_data.channelThumbnail = data.items[0].snippet.thumbnails.default.url;
                makeVideoCard(video_data);
            } else {
                console.error(
                    "No channel data found for channelId:",
                    video_data.snippet.channelId
                );
            }
        })
        .catch((err) =>
            console.error("Error fetching channel icon for:", video_data.snippet.channelId, err)
        );
};

// Create video card
const makeVideoCard = (data) => {
    // Check if the video has a valid thumbnail
    const thumbnail =
        data.snippet.thumbnails.high?.url ||
        data.snippet.thumbnails.medium?.url ||
        data.snippet.thumbnails.default?.url;

    if (!thumbnail) {
        console.error("No valid thumbnail found for video:", data);
        return; // Skip creating the video card if no thumbnail is found
    }

    const videoCard = document.createElement("div");
    videoCard.classList.add("video");
    videoCard.innerHTML = `
        <div class="video-content">
            <img src="${thumbnail}" alt="thumbnail" class="thumbnail">
        </div>
        <div class="video-details">
            <div class="channel-logo">
                <img src="${data.channelThumbnail}" alt="Channel Icon" class="channel-icon">
            </div>
            <div class="detail">
                <h3 class="title">${data.snippet.title}</h3>
                <div class="channel-name">${data.snippet.channelTitle}</div>
            </div>
        </div>
    `;

    // Add a click event to handle video playback
    videoCard.addEventListener("click", () => {
        if (data.player && data.player.embedHtml) {
            sessionStorage.setItem("videoEmbedHtml", data.player.embedHtml);
            window.location.href = "video-page.html";
        } else {
            console.error("No embed HTML available for this video:", data);
        }
    });

    videoCardContainer.appendChild(videoCard);
};
