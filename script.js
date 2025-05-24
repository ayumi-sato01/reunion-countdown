window.addEventListener("DOMContentLoaded", () => {
  // Set reunion and start dates
  const reunionDate = new Date("2025-07-04T08:00:00");
  const startDate = new Date("2025-05-25T00:00:00");

  const bgMusic = document.getElementById("bg-music");

  // Enable music after click
  function enableMusicPlaybackOnce() {
    bgMusic.play().catch(() => {});
    document.removeEventListener("click", enableMusicPlaybackOnce);
  }
  document.addEventListener("click", enableMusicPlaybackOnce);

  // Music toggle button
  document.getElementById("toggleMusic").addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      toggleMusic.textContent = "🔇";
    } else {
      bgMusic.pause();
      toggleMusic.textContent = "🔊";
    }
  });

  // Countdown logic
  function updateCountdown() {
    const now = new Date();
    const diff = reunionDate - now;

    if (diff <= 0) {
      document.getElementById("countdown").textContent = "It's Reunion Day! 💕";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const dayNumber = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = Math.ceil((reunionDate - startDate) / (1000 * 60 * 60 * 24));

    document.getElementById("countdown").textContent =
      `Day ${dayNumber} of ${totalDays} — ${days} days ${hours}h ${minutes}m ${seconds}s left!`;
  }

  // Load today's image and message
  function loadDailyContent() {
    const today = new Date();
    const dayNumber = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const dateKey = today.toISOString().split("T")[0];

    fetch(`data/day${dayNumber}.json`)
      .then(response => response.json())
      .then(data => {
        document.getElementById("photo").src = `images/day${dayNumber}.jpg`;
        document.getElementById("message").textContent = data.message;
      })
      .catch(() => {
        document.getElementById("photo").style.display = "none";
        document.getElementById("message").textContent = "💌 Message coming soon!";
      });

    firebase.database().ref("likes/" + dateKey).once("value").then(snapshot => {
      if (snapshot.exists()) {
        document.getElementById("likeStatus").textContent = "💖 You already liked this!";
        document.getElementById("likeButton").disabled = true;
      }
    });

    document.getElementById("likeButton").addEventListener("click", () => {
      firebase.database().ref("likes/" + dateKey).set({
        likedAt: firebase.database.ServerValue.TIMESTAMP
      }).then(() => {
        document.getElementById("likeStatus").textContent = "💖 You liked this!";
        document.getElementById("likeButton").disabled = true;
      });
    });
  }

  function loadPastPreviews() {
    const today = new Date();
    const pastDayCount = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const gallery = document.getElementById("previewGallery");

    if (pastDayCount < 1) {
      gallery.innerHTML = "<p style='color: gray;'>📅 Previews will be available starting May 25!</p>";
      return;
    }

    for (let day = 1; day <= pastDayCount; day++) {
      fetch(`data/day${day}.json`)
        .then(response => response.json())
        .then(data => {
          const div = document.createElement("div");
          div.className = "gallery-item";
          div.innerHTML = `
            <img src="images/day${day}.jpg" alt="Day ${day}" />
            <p>Day ${day}</p>
          `;
          div.addEventListener("click", () => openFullscreen(day));
          gallery.appendChild(div);
        })
        .catch(() => {
          // skip missing
        });
    }
  }

  let currentPreviewDay = 1;

  function openFullscreen(day) {
    currentPreviewDay = day;
    showModalForDay(day);
    document.getElementById("fullscreenPreview").classList.remove("hidden");
  }

  function showModalForDay(day) {
    fetch(`data/day${day}.json`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("modalPhoto").src = `images/day${day}.jpg`;
        document.getElementById("modalMessage").textContent = data.message;
      });
  }

  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("fullscreenPreview").classList.add("hidden");
  });

  document.getElementById("prevDay").addEventListener("click", () => {
    if (currentPreviewDay > 1) {
      currentPreviewDay--;
      showModalForDay(currentPreviewDay);
    }
  });

  document.getElementById("nextDay").addEventListener("click", () => {
    const today = new Date();
    const pastDayCount = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (currentPreviewDay < pastDayCount) {
      currentPreviewDay++;
      showModalForDay(currentPreviewDay);
    }
  });

  updateCountdown();
  setInterval(updateCountdown, 1000);
  loadDailyContent();
  loadPastPreviews();
});
