let source;
let isInitialized = false;
const config = {
    logoPath: "logo.png",
    defaultCover: "covers/default.jpg"
};

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
let audioContext, gainNode;

// Инициализация аудио
function initAudioSystem() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        source = audioContext.createMediaElementSource(audio);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
    }
}

// Показать ошибку
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    setTimeout(() => errorElement.classList.remove('visible'), 3000);
}

// Загрузка трека
function loadTrack(index) {
    try {
        if (index < 0 || index >= tracks.length) return;
        
        currentTrack = index;
        const track = tracks[index];
        
        audio.src = track.file;
        document.getElementById('track-title').textContent = track.title;
        document.getElementById('track-artist').textContent = track.artist;
        document.getElementById('player-cover').src = track.cover || config.defaultCover;
        
        audio.play().catch(error => {
            showError('Нажмите на трек для активации');
        });
    } catch (error) {
        showError('Ошибка загрузки трека');
    }
}

// Управление воспроизведением
function togglePlay() {
    if (audio.paused) {
        audio.play().then(() => {
            document.getElementById('player-cover').classList.add('playing');
        }).catch(error => {
            showError('Не удалось воспроизвести');
        });
    } else {
        audio.pause();
        document.getElementById('player-cover').classList.remove('playing');
    }
    updatePlayButton();
}

function updatePlayButton() {
    const btn = document.getElementById('playBtn');
    btn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}

// Перемотка
function skip(seconds) {
    audio.currentTime = Math.max(0, audio.currentTime + seconds);
}

// Громкость
function toggleMute() {
    audio.muted = !audio.muted;
    document.getElementById('volumeIcon').className = audio.muted 
        ? 'fas fa-volume-mute' 
        : 'fas fa-volume-up';
}

document.getElementById('volume').addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Обработчики событий
audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
});

audio.addEventListener('ended', () => {
    if (currentTrack < tracks.length - 1) loadTrack(currentTrack + 1);
});

// Инициализация
document.addEventListener('click', () => {
    if (!isInitialized) {
        isInitialized = true;
        initAudioSystem();
        document.querySelectorAll('.track-card').forEach((card, index) => {
            card.onclick = () => loadTrack(index);
        });
    }
});

// Загрузка плейлиста
function initPlaylist() {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = tracks.map((track, index) => `
        <div class="track-card">
            <img class="cover" src="${track.cover}" alt="${track.title}">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
        </div>
    `).join('');
}

// Тема
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Старт
initPlaylist();
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');
