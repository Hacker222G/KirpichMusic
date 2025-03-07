let source;
const config = {
    logoPath: "logo.png",
    defaultCover: "covers/default.jpg",
    maxVolumeBoost: 2.0
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
    },
    {
        title: "ТРАМБАЛОН",
        artist: "maxxytren, bulk_machine",
        file: "music/trambolon.mp3",
        cover: "covers/trambolon.jpg"
    },
];

const audio = document.getElementById('audio');
let currentTrack = 0;
let audioContext, gainNode;

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    setTimeout(() => errorElement.classList.remove('visible'), 3000);
}

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        if (audio && !source) {
            source = audioContext.createMediaElementSource(audio);
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
        }
    }
}

function initPlaylist() {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <img class="cover" src="${track.cover || config.defaultCover}" 
                 alt="${track.title}" 
                 onerror="this.src='${config.defaultCover}'">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
        `;
        card.onclick = () => playTrack(index);
        playlist.appendChild(card);
    });
}

function initVolume() {
    initAudioContext();
    const volume = document.getElementById('volume');
    if (!gainNode) return;
    
    volume.addEventListener('input', (e) => {
        gainNode.gain.value = e.target.value;
        localStorage.setItem('volume', e.target.value);
    });
    
    const savedVolume = localStorage.getItem('volume') || 1;
    gainNode.gain.value = savedVolume;
    volume.value = savedVolume;
}

function initProgressBar() {
    const progressBar = document.getElementById('progressBar');
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audio.duration) {
            audio.currentTime = percent * audio.duration;
        }
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') !== 'light';
    
    if (isDark) {
        body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    } else {
        body.removeAttribute('data-theme');
        document.getElementById('theme-icon').className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    }
}

function playTrack(index) {
    try {
        currentTrack = index;
        const track = tracks[index];
        if (!track.file) throw new Error('Трек не найден');
        
        audio.src = track.file;
        document.getElementById('track-title').textContent = track.title;
        document.getElementById('track-artist').textContent = track.artist;
        document.getElementById('player-cover').src = track.cover || config.defaultCover;
        
        audio.play().then(() => {
            document.getElementById('player-cover').classList.add('playing');
        }).catch(error => {
            showError('Ошибка воспроизведения: ' + error.message);
        });
        
        updatePlayButton(true);
    } catch (error) {
        showError(error.message);
    }
}

function togglePlay() {
    if (audio.paused) {
        audio.play().then(() => {
            document.getElementById('player-cover').classList.add('playing');
        }).catch(error => {
            showError('Ошибка воспроизведения: ' + error.message);
        });
        updatePlayButton(true);
    } else {
        audio.pause();
        document.getElementById('player-cover').classList.remove('playing');
        updatePlayButton(false);
    }
}

function updatePlayButton(playing) {
    document.getElementById('playBtn').innerHTML = 
        playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function skip(seconds) {
    if (audio.duration) {
        audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration);
    }
}

function toggleMute() {
    audio.muted = !audio.muted;
    const volumeIcon = document.getElementById('volumeIcon');
    volumeIcon.classList.toggle('muted', audio.muted);
    volumeIcon.className = audio.muted 
        ? 'fas fa-volume-mute' 
        : 'fas fa-volume-up';
}

audio.addEventListener('play', () => {
    if (!source) {
        initAudioContext();
    }
});

audio.ontimeupdate = () => {
    if (audio.duration && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
    }
};

audio.onended = () => {
    if (currentTrack < tracks.length - 1) {
        playTrack(currentTrack + 1);
    } else {
        audio.pause();
        updatePlayButton(false);
        document.getElementById('player-cover').classList.remove('playing');
    }
};

audio.onerror = () => {
    showError('Ошибка загрузки аудио файла');
};

function init() {
    document.querySelector('.logo').src = config.logoPath;
    initPlaylist();
    initVolume();
    initProgressBar();
    initTheme();
    document.body.addEventListener('touchstart', initAudioContext);
    document.addEventListener('click', initAudioContext);
}

window.addEventListener('DOMContentLoaded', init);
