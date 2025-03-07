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

function handleAudioError(error) {
    console.error('Audio error:', error);
    alert('Ошибка воспроизведения аудио');
}

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
    try {
        if (index < 0 || index >= tracks.length) return;
        
        currentTrack = index;
        const track = tracks[index];
        
        if (!track.file) throw new Error('Файл трека не найден');
        
        audio.src = track.file;
        audio.play().catch(handleAudioError);
        
        document.getElementById('track-title').textContent = track.title;
        document.getElementById('track-artist').textContent = track.artist;
        document.getElementById('player-cover').src = track.cover;
        
    } catch (error) {
        handleAudioError(error);
    }
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

function preloadCovers() {
    tracks.forEach(track => {
        const img = new Image();
        img.src = track.cover;
    });
}

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
});

audio.addEventListener('ended', () => {
    if (currentTrack < tracks.length - 1) playTrack(currentTrack + 1);
});

document.getElementById('volume').addEventListener('input', function(e) {
    audio.volume = Math.min(3, Math.max(0, parseFloat(e.target.value)));
});

audio.addEventListener('error', handleAudioError);

// Инициализация
initPlaylist();
initTheme();
preloadCovers();
audio.volume = 0.5;
