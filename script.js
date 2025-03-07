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

// Добавим глобальный обработчик ошибок
window.onerror = function(message, source, lineno, colno, error) {
    showError(`Ошибка: ${message}`);
    return true;
};

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    setTimeout(() => errorElement.classList.remove('visible'), 3000);
}

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            
            // Переподключение источника при каждой инициализации
            if (audio && !source) {
                source = audioContext.createMediaElementSource(audio);
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
            }
        } catch (error) {
            showError('Аудио не поддерживается в этом браузере');
            return false;
        }
    }
    return true;
}

function initPlaylist() {
    const playlist = document.getElementById('playlist');
    if (!playlist) {
        showError('Элемент плейлиста не найден');
        return;
    }
    
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
    if (!initAudioContext()) return;
    
    const volume = document.getElementById('volume');
    if (!gainNode) {
        showError('Ошибка инициализации аудио');
        return;
    }
    
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
    if (!progressBar) return;
    
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audio.duration && !isNaN(audio.duration)) {
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
        if (index < 0 || index >= tracks.length) {
            throw new Error('Недопустимый индекс трека');
        }
        
        currentTrack = index;
        const track = tracks[index];
        if (!track?.file) throw new Error('Трек не найден');
        
        // Сброс предыдущего источника
        if (source) {
            source.disconnect();
            source = null;
        }
        
        audio.src = track.file;
        document.getElementById('track-title').textContent = track.title;
        document.getElementById('track-artist').textContent = track.artist;
        document.getElementById('player-cover').src = track.cover || config.defaultCover;
        
        audio.play().then(() => {
            document.getElementById('player-cover').classList.add('playing');
            initAudioContext(); // Переинициализация контекста
        }).catch(error => {
            showError('Ошибка воспроизведения: ' + error.message);
        });
        
        updatePlayButton(true);
    } catch (error) {
        showError(error.message);
    }
}

function togglePlay() {
    if (!audio.src) {
        showError('Выберите трек для воспроизведения');
        return;
    }
    
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
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.innerHTML = playing 
            ? '<i class="fas fa-pause"></i>' 
            : '<i class="fas fa-play"></i>';
    }
}

function skip(seconds) {
    if (!audio.duration || isNaN(audio.duration)) return;
    
    const newTime = audio.currentTime + seconds;
    audio.currentTime = Math.max(0, Math.min(newTime, audio.duration));
}

function toggleMute() {
    audio.muted = !audio.muted;
    const volumeIcon = document.getElementById('volumeIcon');
    if (volumeIcon) {
        volumeIcon.classList.toggle('muted', audio.muted);
        volumeIcon.className = audio.muted 
            ? 'fas fa-volume-mute' 
            : 'fas fa-volume-up';
    }
}

// Обновленный обработчик события play
audio.addEventListener('play', () => {
    if (!initAudioContext()) return;
    
    if (!source) {
        source = audioContext.createMediaElementSource(audio);
        source.connect(gainNode);
    }
});

audio.ontimeupdate = () => {
    if (audio.duration && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        const progressBar = document.getElementById('progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
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
    try {
        document.querySelector('.logo').src = config.logoPath;
        initPlaylist();
        initVolume();
        initProgressBar();
        initTheme();
        
        // Обработчики для инициализации аудио по взаимодействию
        document.body.addEventListener('touchstart', initAudioContext);
        document.addEventListener('click', initAudioContext);
    } catch (error) {
        showError('Ошибка инициализации: ' + error.message);
    }
}

window.addEventListener('DOMContentLoaded', init);
