let source;
let wasUserInteraction = false; // Флаг первого взаимодействия
const config = {
    logoPath: "logo.png",
    defaultCover: "covers/default.jpg",
    maxVolumeBoost: 2.0
};

const tracks = [
    {
        title: "Konton Boogie",
        artist: "Kasane Teto",
        file: "music/boogie.m4a", // AAC для iOS
        fallback: "music/boogie.mp3", // MP3 для других устройств
        cover: "covers/boogie.jpg"
    },
    {
        title: "TETORIS",
        artist: "Kasane Teto",
        file: "music/tetoris.m4a",
        fallback: "music/tetoris.mp3",
        cover: "covers/tetoris.jpg"
    },
    {
        title: "ТРАМБАЛОН",
        artist: "maxxytren, bulk_machine",
        file: "music/trambolon.m4a",
        fallback: "music/trambolon.mp3",
        cover: "covers/trambolon.jpg"
    },
];

const audio = document.getElementById('audio');
let currentTrack = 0;
let audioContext, gainNode;

// Глобальный обработчик ошибок
window.onerror = function(message) {
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
    if (!wasUserInteraction) return false;
    
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            
            if (audio && !source) {
                source = audioContext.createMediaElementSource(audio);
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
            }
            return true;
        } catch (error) {
            showError('Аудио не поддерживается в этом браузере');
            return false;
        }
    }
    return true;
}

function handleFirstUserInteraction() {
    if (!wasUserInteraction) {
        wasUserInteraction = true;
        initAudioContext();
        audio.load();
        document.removeEventListener('click', handleFirstUserInteraction);
        document.removeEventListener('touchstart', handleFirstUserInteraction);
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
    if (!initAudioContext()) return;
    
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

function playTrack(index) {
    try {
        if (!wasUserInteraction) {
            showError('Коснитесь экрана для активации аудио');
            return;
        }
        
        if (index < 0 || index >= tracks.length) {
            throw new Error('Недопустимый индекс трека');
        }
        
        currentTrack = index;
        const track = tracks[index];
        
        // Выбор формата для iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        audio.src = isIOS ? track.file : track.fallback;
        
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

// Остальные функции остаются без изменений из предыдущего ответа
// (togglePlay, updatePlayButton, skip, toggleMute и т.д.)

document.addEventListener('click', handleFirstUserInteraction);
document.addEventListener('touchstart', handleFirstUserInteraction);

// Инициализация при загрузке
function init() {
    try {
        document.querySelector('.logo').src = config.logoPath;
        initPlaylist();
        initVolume();
        initProgressBar();
        initTheme();
    } catch (error) {
        showError('Ошибка инициализации: ' + error.message);
    }
}

window.addEventListener('DOMContentLoaded', init);
