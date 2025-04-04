const tracks = [
    {
        title: "Sky High",
        artist: "NoCopyrightSounds",
        file: "music/skynigh.mp3",
        cover: "covers/skynigh.jpg"
    },
    {
        title: "Invisible",
        artist: "NoCopyrightSounds",
        file: "music/invisible.mp3",
        cover: "covers/skynigh.jpg"
    },
    {
        title: "Invincible",
        artist: "NoCopyrightSounds",
        file: "music/invincible.mp3",
        cover: "covers/skynigh.jpg"
    },
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
        title: "Confessions of a Rotten Girl",
        artist: "SAWTOWNE, Hatsune Miku",
        file: "music/rottengirl.mp3",
        cover: "covers/rottengirl.jpg"
    },
    {
        title: "ТРАМБОЛОН",
        artist: "maxxytren, bulk_machine",
        file: "music/trambolon.mp3",
        cover: "covers/trambolon.jpg"
    },
    {
        title: "The World Is Mine",
        artist: "Hatsune Miku",
        file: "music/worldismine.mp3",
        cover: "covers/worldismine.jpg"
    }
];

const audio = new Audio();
let currentTrack = 0;
let isShuffled = false;
let isLooped = false;
let audioContext, analyser, dataArray;
const visualizer = document.getElementById('visualizer');

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    updateVisualizer(); // Start visualizer immediately
}

function createVisualizer() {
    visualizer.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        visualizer.appendChild(bar);
    }
}

function updateVisualizer() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);
    const bars = visualizer.children;

    for (let i = 0; i < bars.length; i++) {
        const height = dataArray[i] / 2;
        bars[i].style.height = `${height}px`;
    }

    requestAnimationFrame(updateVisualizer);
}

function initPlaylist() {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = tracks.map((track, index) => `
        <div class="track-card" draggable="true" data-index="${index}" ondragstart="drag(event)" ondragover="allowDrop(event)" ondrop="drop(event, ${index})" onclick="playTrack(${index})">
            <img src="${track.cover}" alt="${track.title}">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
        </div>
    `).join('');
}

function playTrack(index) {
    currentTrack = index;
    const track = tracks[index];
    audio.src = track.file;
    audio.play().catch(() => {
        alert('Нажмите на трек для активации');
    });

    document.getElementById('track-title').textContent = track.title;
    document.getElementById('track-artist').textContent = track.artist;
    document.getElementById('player-cover').src = track.cover;
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        if (!audioContext) initAudioContext();
    } else {
        audio.pause();
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

function seek(event) {
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const width = progressBar.offsetWidth;
    const duration = audio.duration;
    const seekTime = (offsetX / width) * duration;
    audio.currentTime = seekTime;
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

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.dataset.index);
}

function drop(event, index) {
    event.preventDefault();
    const fromIndex = event.dataTransfer.getData("text");
    const temp = tracks[fromIndex];
    tracks[fromIndex] = tracks[index];
    tracks[index] = temp;
    initPlaylist();
}

function shuffleTracks() {
    for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    initPlaylist();
    isShuffled = true;
}

function toggleLoop() {
    isLooped = !isLooped;
    // Добавьте визуальное отображение состояния повтора, если необходимо
}

// Инициализация
initPlaylist();
initTheme();
createVisualizer();

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    document.getElementById('progress').style.width = `${progress}%`;
});

audio.addEventListener('ended', () => {
    if (isLooped) {
        playTrack(currentTrack);
    } else if (currentTrack < tracks.length - 1) {
        playTrack(currentTrack + 1);
    }
});

document.getElementById('volume').addEventListener('input', (e) => {
    audio.volume = e.target.value;
});
