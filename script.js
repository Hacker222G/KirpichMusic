const tracks = [
    {
        title: "Konton Boogie",
        artist: "Kasane Teto",
        file: "music/boogie.mp3",
        cover: "covers/boogie.jpg"
    },
    {
        title: "TETORIS",
        artist: "Kasane Teto",
        file: "music/tetoris.mp3",
        cover: "covers/tetoris.jpg"
    }
];

const audio = new Audio();
let currentTrack = 0;

function initPlaylist() {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = tracks.map((track, index) => `
        <div class="track-card" onclick="playTrack(${index})">
            <img class="cover" src="${track.cover}" alt="${track.title}">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
        </div>
    `).join('');
}

function playTrack(index) {
    currentTrack = index;
    const track = tracks[index];
    audio.src = track.file;
    document.getElementById('track-title').textContent = track.title;
    document.getElementById('track-artist').textContent = track.artist;
    document.getElementById('player-cover').src = track.cover;
    audio.play();
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        document.querySelector('.cover-art').classList.add('playing');
    } else {
        audio.pause();
        document.querySelector('.cover-art').classList.remove('playing');
    }
    updatePlayButton();
}

function updatePlayButton() {
    const btn = document.getElementById('playBtn');
    btn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}

function skip(seconds) {
    audio.currentTime += seconds;
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') !== 'light';
    
    if (isDark) {
        body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    } else {
        body.removeAttribute('data-theme');
        document.getElementById('theme-icon').className = 'fas fa-moon';
    }
    
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
}

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
});

audio.addEventListener('ended', () => {
    if (currentTrack < tracks.length - 1) playTrack(currentTrack + 1);
});

document.getElementById('volume').addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Инициализация
initPlaylist();
initTheme();
