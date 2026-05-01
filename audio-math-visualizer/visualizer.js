    // Teacher-managed permanent audio files. Keep only titles and paths here so audio loads lazily.
    const teacherAudioLibrary = window.teacherAudioLibrary || [];

    const $ = (id) => document.getElementById(id);
    const app = $('app');
    const canvas = $('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    const audioElement = $('audioElement');
    const audioFileInput = $('audioFile');
    const saveSongButton = $('saveSongButton');
    const randomSongButton = $('randomSongButton');
    const playButton = $('playButton');
    const pauseButton = $('pauseButton');
    const stopButton = $('stopButton');
    const restartButton = $('restartButton');
    const fullscreenButton = $('fullscreenButton');
    const miniRandomButton = $('miniRandomButton');
    const miniPauseButton = $('miniPauseButton');
    const miniNextButton = $('miniNextButton');
    const miniExitFullscreenButton = $('miniExitFullscreenButton');
    const clearSavedSongsButton = $('clearSavedSongsButton');
    const teacherLibrarySection = $('teacherLibrarySection');
    const teacherSongsList = $('teacherSongsList');
    const savedSongsList = $('savedSongsList');
    const nowPlayingText = $('nowPlayingText');
    const statusTitle = $('statusTitle');
    const statusText = $('statusText');
    const modeSelect = $('modeSelect');
    const performanceModeToggle = $('performanceModeToggle');
    const performanceModeValue = $('performanceModeValue');
    const sensitivitySlider = $('sensitivitySlider');
    const colorSlider = $('colorSlider');
    const densitySlider = $('densitySlider');
    const sensitivityValue = $('sensitivityValue');
    const colorValue = $('colorValue');
    const densityValue = $('densityValue');
    const modeValue = $('modeValue');
    const hudFile = $('hudFile');
    const hudCurrentTime = $('hudCurrentTime');
    const hudDuration = $('hudDuration');
    const hudProgress = $('hudProgress');
    const hudBass = $('hudBass');
    const hudMids = $('hudMids');
    const hudTreble = $('hudTreble');
    const hudVolume = $('hudVolume');

    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let frequencyData = null;
    let waveformData = null;
    let animationFrameId = null;
    let loadedFileName = '';
    let currentObjectUrl = '';
    let currentAudioBlob = null;
    let currentTeacherTrackIndex = -1;
    let hasShownAnalysisError = false;
    let savedSongs = [];
    let smoothedBass = 0;
    let smoothedMids = 0;
    let smoothedTreble = 0;
    let smoothedVolume = 0;

    const DB_NAME = 'audioMathVisualizerLibrary';
    const STORE_NAME = 'songs';
    let dbPromise = null;
    const particles = [];
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.7 + 0.35,
      drift: Math.random() * 0.17 + 0.04
    }));

    function escapeHtml(value) {
      const div = document.createElement('div');
      div.textContent = String(value);
      return div.innerHTML;
    }

    function formatTime(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
      const wholeSeconds = Math.floor(seconds);
      const minutes = Math.floor(wholeSeconds / 60);
      const remainingSeconds = String(wholeSeconds % 60).padStart(2, '0');
      return minutes + ':' + remainingSeconds;
    }

    function updateStatus(message, strongText) {
      statusTitle.textContent = strongText;
      statusText.textContent = ' ' + message;
    }

    function updateNowPlaying(name) {
      const displayName = name || 'No song selected';
      nowPlayingText.textContent = displayName;
      hudFile.textContent = displayName === 'No song selected' ? 'None' : displayName;
    }

    function updateProgressHud() {
      const current = audioElement.currentTime || 0;
      const duration = audioElement.duration || 0;
      const hasDuration = Number.isFinite(duration) && duration > 0;
      hudCurrentTime.textContent = formatTime(current);
      hudDuration.textContent = hasDuration ? formatTime(duration) : '--:--';
      hudProgress.disabled = !hasDuration;
      hudProgress.value = hasDuration ? Math.min(1000, Math.round((current / duration) * 1000)) : 0;
      hudProgress.setAttribute('aria-valuetext', formatTime(current) + ' of ' + (hasDuration ? formatTime(duration) : 'unknown duration'));
    }

    function seekFromProgress() {
      const duration = audioElement.duration || 0;
      if (!Number.isFinite(duration) || duration <= 0) return;
      try {
        audioElement.currentTime = (Number(hudProgress.value) / 1000) * duration;
      } catch (error) { }
      updateProgressHud();
    }

    function updateButtonStates(isLoaded, isPlaying) {
      playButton.disabled = !isLoaded || isPlaying;
      pauseButton.disabled = !isLoaded || !isPlaying;
      stopButton.disabled = !isLoaded;
      restartButton.disabled = !isLoaded;
      randomSongButton.disabled = teacherAudioLibrary.length === 0;
      miniRandomButton.disabled = teacherAudioLibrary.length === 0;
      miniNextButton.disabled = teacherAudioLibrary.length === 0;
      miniPauseButton.disabled = !isLoaded || !isPlaying;
    }

    function updateSliderLabels() {
      const selectedText = modeSelect.options[modeSelect.selectedIndex].text;
      modeValue.textContent = selectedText + (performanceModeToggle.checked ? ' (Chromebook)' : '');
      sensitivityValue.textContent = Number(sensitivitySlider.value).toFixed(2);
      colorValue.textContent = Number(colorSlider.value).toFixed(2);
      densityValue.textContent = Number(densitySlider.value).toFixed(2);
      performanceModeValue.textContent = performanceModeToggle.checked
        ? 'On: fewer particles, lower glow, shorter trails, and lighter canvas rendering.'
        : 'Off: full-quality visuals for stronger PCs.';
    }

    function controlValues() {
      const performance = performanceModeToggle.checked;
      return {
        performance,
        sensitivity: Number(sensitivitySlider.value),
        intensity: performance ? Math.min(Number(colorSlider.value), 1.1) : Number(colorSlider.value),
        density: performance ? Math.min(Number(densitySlider.value), 0.65) : Number(densitySlider.value),
        shadowScale: performance ? 0.12 : 1,
        sampleStep: performance ? 4 : 1
      };
    }

    function resetAudioLevels() {
      smoothedBass = 0;
      smoothedMids = 0;
      smoothedTreble = 0;
      smoothedVolume = 0;
      updateHud({ bass: 0, mids: 0, treble: 0, volume: 0 });
    }

    function safelyRestartFromBeginning() {
      try { audioElement.currentTime = 0; } catch (error) { }
      updateProgressHud();
    }

    function stopForSongSwitch() {
      audioElement.pause();
      safelyRestartFromBeginning();
      resetAudioLevels();
      updateButtonStates(false, false);
    }

    function revokeCurrentObjectUrl() {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = '';
      }
    }

    function setCanvasSize() {
      const { performance } = controlValues();
      const ratio = performance ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function openSongsDb() {
      if (!('indexedDB' in window)) return Promise.resolve(null);
      if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }).catch(() => null);
      }
      return dbPromise;
    }

    function requestToPromise(request) {
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    function transactionToPromise(transaction) {
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    }

    async function loadSavedSongsFromDb() {
      const db = await openSongsDb();
      if (!db) { savedSongs = []; renderSavedSongs(); return; }
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const songs = await requestToPromise(transaction.objectStore(STORE_NAME).getAll());
      savedSongs = songs.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
      renderSavedSongs();
    }

    async function storeSongLocally() {
      if (!currentAudioBlob) {
        updateStatus('Load an uploaded MP3 or WAV file first, then save it locally if you want it later.', 'Nothing to save yet.');
        return;
      }
      const db = await openSongsDb();
      if (!db) {
        updateStatus('This browser does not support local saved songs here. You can still upload and play files temporarily.', 'Local saving unavailable.');
        return;
      }
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({
        id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        name: loadedFileName || 'Saved song',
        type: currentAudioBlob.type || 'audio/mpeg',
        blob: currentAudioBlob,
        savedAt: new Date().toISOString()
      });
      await transactionToPromise(transaction);
      updateStatus('This song was saved in this browser on this Chromebook or computer.', 'Saved locally.');
      await loadSavedSongsFromDb();
    }

    async function clearSavedSongs() {
      const db = await openSongsDb();
      if (!db) return;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      await transactionToPromise(transaction);
      savedSongs = [];
      renderSavedSongs();
      updateStatus('Saved songs were cleared from this browser only.', 'Saved songs cleared.');
    }

    function renderSavedSongs() {
      if (!savedSongs.length) {
        savedSongsList.innerHTML = `<div class='empty-library'>No saved songs yet.</div>`;
        return;
      }
      savedSongsList.innerHTML = savedSongs.map((song) => `
        <div class='song-row'>
          <div class='song-info'>
            <span class='song-name'>${escapeHtml(song.name)}</span>
            <span class='song-meta'>Saved locally in this browser</span>
          </div>
          <div class='song-actions'>
            <button type='button' class='tiny-button' data-saved-id='${escapeHtml(song.id)}'>Play</button>
          </div>
        </div>
      `).join('');
      savedSongsList.querySelectorAll('[data-saved-id]').forEach((button) => {
        button.addEventListener('click', () => {
          const song = savedSongs.find((item) => item.id === button.dataset.savedId);
          if (!song) return;
          loadAudioBlob(song.blob, song.name, 'Saved song ready. Press Play when you are ready.');
          playAudio().catch(() => updateStatus('The saved song is selected. Tap Play if Chrome pauses autoplay.', 'Saved song ready.'));
        });
      });
    }

    function setAudioSource(sourceUrl, name, readyMessage, options = {}) {
      stopForSongSwitch();
      revokeCurrentObjectUrl();
      currentObjectUrl = options.objectUrl || '';
      currentAudioBlob = options.blob || null;
      currentTeacherTrackIndex = Number.isInteger(options.teacherIndex) ? options.teacherIndex : -1;
      loadedFileName = name || 'Untitled audio';
      audioElement.src = sourceUrl;
      audioElement.load();
      saveSongButton.disabled = !currentAudioBlob;
      updateNowPlaying(loadedFileName);
      updateProgressHud();
      updateButtonStates(true, false);
      updateStatus(readyMessage, loadedFileName);
    }

    function loadAudioBlob(blob, name, readyMessage) {
      const objectUrl = URL.createObjectURL(blob);
      setAudioSource(objectUrl, name, readyMessage, { blob, objectUrl });
    }

    function loadTeacherTrack(index, readyMessage) {
      const track = teacherAudioLibrary[index];
      if (!track) return;
      setAudioSource(track.file, track.title, readyMessage, { teacherIndex: index });
    }

    function renderTeacherLibrary() {
      teacherLibrarySection.hidden = teacherAudioLibrary.length === 0;
      teacherSongsList.innerHTML = teacherAudioLibrary.map((track, index) => `
        <div class='song-row'>
          <div class='song-info'>
            <span class='song-name'>${escapeHtml(track.title)}</span>
            <span class='song-meta'>Teacher library track ${index + 1} of ${teacherAudioLibrary.length}</span>
          </div>
          <div class='song-actions'>
            <button type='button' class='tiny-button' data-teacher-index='${index}'>Play</button>
          </div>
        </div>
      `).join('');
      teacherSongsList.querySelectorAll('[data-teacher-index]').forEach((button) => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.teacherIndex);
          loadTeacherTrack(index, 'Teacher song selected. Starting playback.');
          playAudio().catch(() => updateStatus('The teacher song is selected. Tap Play if Chrome pauses autoplay.', 'Teacher song ready.'));
        });
      });
    }

    function chooseDifferentRandomIndex() {
      if (teacherAudioLibrary.length <= 1) return 0;
      let nextIndex = currentTeacherTrackIndex;
      while (nextIndex === currentTeacherTrackIndex) {
        nextIndex = Math.floor(Math.random() * teacherAudioLibrary.length);
      }
      return nextIndex;
    }

    function selectRandomTeacherTrack() {
      if (!teacherAudioLibrary.length) {
        updateStatus('Upload an MP3 or WAV file to use the visualizer.', 'No teacher songs available.');
        updateButtonStates(Boolean(audioElement.src), !audioElement.paused);
        return;
      }
      loadTeacherTrack(chooseDifferentRandomIndex(), 'Random song selected. Press Play when you are ready.');
    }

    function selectNextTeacherTrack() {
      if (!teacherAudioLibrary.length) {
        updateStatus('Upload an MP3 or WAV file to use the visualizer.', 'No teacher songs available.');
        updateButtonStates(Boolean(audioElement.src), !audioElement.paused);
        return;
      }
      const nextIndex = currentTeacherTrackIndex >= 0
        ? (currentTeacherTrackIndex + 1) % teacherAudioLibrary.length
        : 0;
      loadTeacherTrack(nextIndex, 'Next song selected. Press Play when you are ready.');
    }

    async function playRandomTeacherTrack() {
      selectRandomTeacherTrack();
      await playAudio();
    }

    async function playNextTeacherTrack() {
      selectNextTeacherTrack();
      await playAudio();
    }

    function refreshAnalyserResolution() {
      if (!analyser) return;
      const desiredFftSize = performanceModeToggle.checked ? 1024 : 2048;
      if (analyser.fftSize !== desiredFftSize) {
        analyser.fftSize = desiredFftSize;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        waveformData = new Uint8Array(analyser.fftSize);
      }
    }

    async function ensureAudioSetup() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.72;
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      refreshAnalyserResolution();
      if (audioContext.state === 'suspended') await audioContext.resume();
    }

    function averageRange(data, startRatio, endRatio) {
      if (!data || data.length === 0) return 0;
      const start = Math.floor(data.length * startRatio);
      const end = Math.max(start + 1, Math.floor(data.length * endRatio));
      let total = 0;
      for (let i = start; i < end; i += 1) total += data[i];
      return total / (end - start) / 255;
    }

    function updateAudioData() {
      if (!analyser || !frequencyData || !waveformData) return { bass: 0, mids: 0, treble: 0, volume: 0 };
      try {
        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(waveformData);
        hasShownAnalysisError = false;
      } catch (error) {
        if (!hasShownAnalysisError) {
          updateStatus('The music is playing, but audio analysis could not start. Try pressing Stop, then Play again.', 'Audio analysis error.');
          hasShownAnalysisError = true;
        }
        return { bass: 0, mids: 0, treble: 0, volume: 0 };
      }
      // Tuned so mastered songs keep punch but bass/mids do not pin at 100% between real peaks.
      const bass = Math.min(1, Math.pow(averageRange(frequencyData, 0.0, 0.09) * 1.35, 1.12));
      const mids = Math.min(1, Math.pow(averageRange(frequencyData, 0.10, 0.42) * 1.56, 1.0));
      const treble = Math.min(1, Math.pow(averageRange(frequencyData, 0.42, 1.0) * 2.55, 0.72));
      let rmsTotal = 0;
      for (let i = 0; i < waveformData.length; i += 1) {
        const centered = (waveformData[i] - 128) / 128;
        rmsTotal += centered * centered;
      }
      const volume = Math.min(1, Math.sqrt(rmsTotal / waveformData.length) * 3.4);
      const easing = 0.32;
      smoothedBass += (bass - smoothedBass) * easing;
      smoothedMids += (mids - smoothedMids) * easing;
      smoothedTreble += (treble - smoothedTreble) * easing;
      smoothedVolume += (volume - smoothedVolume) * easing;
      return { bass: smoothedBass, mids: smoothedMids, treble: smoothedTreble, volume: smoothedVolume };
    }

    function updateHud(levels) {
      hudBass.textContent = Math.round(levels.bass * 100) + '%';
      hudMids.textContent = Math.round(levels.mids * 100) + '%';
      hudTreble.textContent = Math.round(levels.treble * 100) + '%';
      hudVolume.textContent = Math.round(levels.volume * 100) + '%';
    }

    function createParticles() {
      const { performance, density } = controlValues();
      const desiredCount = Math.max(performance ? 4 : 8, Math.floor((performance ? 24 : 72) * density));
      if (particles.length > desiredCount) particles.length = desiredCount;
      while (particles.length < desiredCount) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 220 + 30,
          speed: Math.random() * 0.014 + 0.004,
          size: Math.random() * 3.4 + 0.8,
          hueOffset: Math.random() * 120
        });
      }
    }

    function clearBackground(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { performance, intensity } = controlValues();
      const hue = (time * 0.03 + levels.mids * 210 + levels.treble * 80) % 360;
      ctx.clearRect(0, 0, width, height);
      if (performance) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(1, 5, 16, 0.98)');
        gradient.addColorStop(0.5, 'hsla(' + hue + ', 90%, ' + (10 + levels.volume * 10) + '%, 0.96)');
        gradient.addColorStop(1, 'rgba(3, 5, 18, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        return;
      }
      const bg = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.08, width * 0.5, height * 0.5, width * 0.72);
      bg.addColorStop(0, 'hsla(' + hue + ', 100%, ' + (12 + levels.volume * 18 * intensity) + '%, ' + (0.34 + levels.volume * 0.28 * intensity) + ')');
      bg.addColorStop(0.42, 'hsla(' + ((hue + 80) % 360) + ', 100%, 12%, ' + (0.22 + levels.bass * 0.18) + ')');
      bg.addColorStop(1, 'rgba(1, 3, 10, 0.98)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }

    function drawStars(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { performance } = controlValues();
      const step = performance ? 3 : 1;
      ctx.save();
      for (let i = 0; i < stars.length; i += step) {
        const star = stars[i];
        const x = star.x * width;
        const y = (star.y * height + time * star.drift) % height;
        const glow = star.size + levels.treble * (performance ? 2 : 7) + levels.volume * (performance ? 1 : 2);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(0.82, 0.16 + levels.treble * 0.55 + levels.volume * 0.16) + ')';
        ctx.arc(x, y, glow, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawNebula(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, density, performance } = controlValues();
      const centerX = width / 2;
      const centerY = height / 2;
      const pulse = 1 + levels.bass * 2.4 * sensitivity + levels.volume * 0.45;
      const layerCount = Math.max(1, Math.floor((performance ? 2 : 6) * density));
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < layerCount; i += 1) {
        const radius = (120 + i * 62) * pulse;
        const angle = time * 0.00034 * (i + 1) * (0.6 + sensitivity * 0.25) + levels.mids * 4.2;
        const x = centerX + Math.cos(angle) * radius * 0.22;
        const y = centerY + Math.sin(angle * 1.35) * radius * 0.18;
        const hue = (185 + i * 34 + time * 0.025 + levels.treble * 180) % 360;
        const gradient = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
        gradient.addColorStop(0, 'hsla(' + hue + ', 100%, 70%, ' + Math.min(0.5, 0.09 * intensity + levels.volume * 0.14) + ')');
        gradient.addColorStop(1, 'hsla(' + ((hue + 120) % 360) + ', 90%, 40%, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawGrid(levels, time) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, density, performance } = controlValues();
      const spacing = Math.max(performance ? 34 : 18, 58 - levels.bass * 30 - density * 9);
      ctx.save();
      ctx.globalAlpha = Math.min(performance ? 0.28 : 0.55, 0.1 + levels.volume * 0.24 + intensity * 0.05);
      ctx.strokeStyle = 'rgba(126, 255, 236, 0.46)';
      ctx.lineWidth = 1 + levels.bass * (performance ? 0.6 : 1.4);
      for (let x = 0; x < width + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(time * 0.0016 + x * 0.01) * levels.mids * 16 * sensitivity, 0);
        ctx.lineTo(x - Math.cos(time * 0.001 + x * 0.01) * levels.treble * 12 * sensitivity, height);
        ctx.stroke();
      }
      for (let y = 0; y < height + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.cos(time * 0.0018 + y * 0.01) * levels.mids * 14 * sensitivity);
        ctx.lineTo(width, y - Math.sin(time * 0.001 + y * 0.01) * levels.bass * 16 * sensitivity);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawGeometry(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, density, shadowScale, performance } = controlValues();
      const centerX = width / 2;
      const centerY = height / 2;
      const layers = Math.max(2, Math.floor((performance ? 5 : 10) * density));
      ctx.save();
      ctx.lineWidth = 1.2 + levels.volume * 1.6 * sensitivity;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < layers; i += 1) {
        const sides = 3 + (i % 6);
        const rotation = time * 0.00036 * (i + 1) * sensitivity + levels.mids * (i + 1) * 0.85;
        const radius = 42 + i * 24 + levels.bass * 180 * sensitivity;
        const hue = (165 + i * 30 + levels.treble * 210 + time * 0.012) % 360;
        ctx.beginPath();
        for (let point = 0; point <= sides; point += 1) {
          const angle = rotation + (Math.PI * 2 * point) / sides;
          const wavePush = Math.sin(time * 0.0032 + point + i) * levels.mids * 34 * sensitivity;
          const x = centerX + Math.cos(angle) * (radius + wavePush);
          const y = centerY + Math.sin(angle) * (radius + wavePush);
          if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'hsla(' + hue + ', 100%, ' + Math.min(82, 54 + intensity * 12) + '%, ' + Math.min(0.9, 0.2 + levels.volume * 0.65 + intensity * 0.06) + ')';
        ctx.shadowBlur = (14 + 22 * intensity + levels.bass * 24) * shadowScale;
        ctx.shadowColor = 'hsla(' + hue + ', 100%, 70%, 0.82)';
        ctx.stroke();
      }
      ctx.restore();
      drawGrid(levels, time);
    }

    function drawWaveform(levels, time) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, density, shadowScale, performance, sampleStep } = controlValues();
      const centerY = height / 2;
      const lineCount = Math.max(1, Math.floor((performance ? 2 : 5) * density));
      const samples = waveformData || [];
      const sampleCount = samples.length || 180;
      ctx.save();
      ctx.globalCompositeOperation = performance ? 'source-over' : 'lighter';
      for (let layer = 0; layer < lineCount; layer += 1) {
        ctx.beginPath();
        for (let i = 0; i < sampleCount; i += sampleStep) {
          const x = (i / Math.max(1, sampleCount - 1)) * width;
          const sample = samples.length ? (samples[i] - 128) / 128 : Math.sin((i / sampleCount) * Math.PI * 4 + layer * 0.8) * 0.14;
          const offset = (layer - (lineCount - 1) / 2) * (20 + levels.volume * 14);
          const amplitude = 48 + levels.bass * (performance ? 140 : 240) * sensitivity + levels.volume * (performance ? 44 : 90) + layer * 14;
          const sineCurve = Math.sin((i / sampleCount) * Math.PI * (6 + levels.treble * 8) + time * 0.004 * sensitivity) * (levels.mids * (performance ? 30 : 58) * sensitivity + 8);
          const y = centerY + sample * amplitude + offset + sineCurve;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const hue = (175 + layer * 42 + levels.treble * 220 + time * 0.018) % 360;
        ctx.strokeStyle = 'hsla(' + hue + ', 100%, ' + Math.min(84, 58 + intensity * 10) + '%, ' + Math.min(0.95, 0.32 + 0.22 * intensity + levels.volume * 0.28) + ')';
        ctx.lineWidth = 1.8 + layer * 0.7 + levels.treble * (performance ? 1.2 : 3.2);
        ctx.shadowBlur = (18 + intensity * 16 + levels.treble * 20) * shadowScale;
        ctx.shadowColor = 'hsla(' + hue + ', 100%, 70%, 0.85)';
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawSpiral(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, density, shadowScale, performance } = controlValues();
      const centerX = width / 2;
      const centerY = height / 2;
      const loops = Math.max(performance ? 80 : 120, Math.floor((performance ? 180 : 380) * density));
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 1.3 + levels.volume * 1.8;
      const armCount = performance ? 2 : 3;
      for (let arm = 0; arm < armCount; arm += 1) {
        ctx.beginPath();
        for (let i = 0; i < loops; i += 1) {
          const t = i / loops;
          const angle = t * Math.PI * (10 + levels.treble * 8) + arm * ((Math.PI * 2) / armCount) + time * 0.00072 * (0.8 + sensitivity + levels.mids * 1.6);
          const radius = 28 + t * Math.min(width, height) * 0.36 * (1 + levels.bass * 1.4 * sensitivity + levels.volume * 0.25);
          const ripple = Math.sin(t * 28 - time * 0.005 * sensitivity + arm) * levels.treble * 28 * sensitivity;
          const x = centerX + Math.cos(angle) * (radius + ripple);
          const y = centerY + Math.sin(angle) * (radius + ripple);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const hue = (245 + arm * 65 + levels.volume * 180 + time * 0.016) % 360;
        ctx.strokeStyle = 'hsla(' + hue + ', 100%, ' + Math.min(82, 56 + intensity * 12) + '%, ' + Math.min(0.86, 0.2 + levels.mids * 0.52 + intensity * 0.08) + ')';
        ctx.shadowBlur = (20 + intensity * 16 + levels.bass * 26) * shadowScale;
        ctx.shadowColor = 'hsla(' + hue + ', 100%, 68%, 0.85)';
        ctx.stroke();
      }
ctx.restore();
}

function drawGeoFace(time, levels) {
  function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const { sensitivity, intensity, density, shadowScale, performance } = controlValues();
  const centerX = width / 2;
  const centerY = height / 2;
  const bassRaw = Math.min(1, levels.bass);
  const midsRaw = Math.min(1, levels.mids);
  const trebleRaw = Math.min(1, levels.treble);
  const bassPulse = Math.pow(bassRaw, 1.7);
  const midsPulse = Math.pow(midsRaw, 1.6);
  const treblePulse = Math.pow(trebleRaw, 1.2);
  const bass = clampValue(bassPulse * sensitivity, 0, 1);
  const mids = clampValue(midsPulse * sensitivity, 0, 1);
  const treble = clampValue(treblePulse * sensitivity, 0, 1);
  const headPulse = clampValue(1 + bass * 0.08, 1, 1.09);
  const headSize = Math.min(width, height) * (performance ? 0.24 : 0.27) * headPulse;
  const jawWidth = headSize * (0.76 + bass * 0.22);
  const smileBounce = Math.sin(time * 0.011) * (1.5 + bass * 5.5);
  const maxTilt = 0.12;
  const faceTilt = clampValue(Math.sin(time * 0.0014) * mids * 0.12, -maxTilt, maxTilt);
  const hueBase = (182 + time * 0.02 + mids * 140 + treble * 90) % 360;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(faceTilt);
  ctx.globalCompositeOperation = performance ? 'source-over' : 'lighter';

  // Outer angular mask.
  ctx.beginPath();
  const sides = 8;
  const maskScale = 1 + bass * (performance ? 0.06 : 0.12);
  for (let i = 0; i <= sides; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / sides;
    const radialJitter = (i % 2 === 0 ? 1.06 : 0.84) + treble * 0.08;
    const x = Math.cos(angle) * headSize * radialJitter * maskScale;
    const y = Math.sin(angle) * headSize * radialJitter * maskScale;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineWidth = 2.4 + bass * 4.2;
  ctx.strokeStyle = 'hsla(' + hueBase + ', 100%, 68%, ' + (performance ? 0.72 : 0.88) + ')';
  ctx.shadowBlur = (14 + intensity * 12 + treble * 18) * shadowScale;
  ctx.shadowColor = 'hsla(' + hueBase + ', 100%, 70%, 0.9)';
  ctx.stroke();

  const eyeOffsetX = headSize * 0.36;
  const eyeY = -headSize * 0.19;
  const eyeSize = headSize * (0.15 + mids * 0.1);
  const eyeCoreSize = eyeSize * (0.33 + mids * 0.12);
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const a = (Math.PI * 2 * i) / 6 + Math.PI / 6;
      const rx = (i % 2 === 0 ? 1 : 0.72) * eyeSize;
      const x = side * eyeOffsetX + Math.cos(a) * rx;
      const y = eyeY + Math.sin(a) * eyeSize;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'hsla(' + ((hueBase + 42) % 360) + ', 100%, 76%, 0.96)';
    ctx.lineWidth = 2.2 + mids * 2.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(side * eyeOffsetX, eyeY, eyeCoreSize, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + ((hueBase + 165) % 360) + ', 100%, 74%, 0.38)';
    ctx.fill();

    const tremble = treble * (performance ? 0.45 : 1.1);
    ctx.beginPath();
    ctx.arc(
      side * eyeOffsetX + Math.sin(time * 0.015 + side) * tremble,
      eyeY + Math.cos(time * 0.016 + side) * tremble,
      eyeCoreSize * 0.46,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'hsla(' + ((hueBase + 188) % 360) + ', 100%, 88%, 0.95)';
    ctx.fill();

    const browLift = treble * (performance ? 10 : 18);
    const browY = eyeY - eyeSize * 0.95 - browLift;
    ctx.beginPath();
    ctx.moveTo(side * (eyeOffsetX - eyeSize * 0.8), browY + eyeSize * 0.3);
    ctx.lineTo(side * eyeOffsetX, browY - eyeSize * 0.16);
    ctx.lineTo(side * (eyeOffsetX + eyeSize * 0.86), browY + eyeSize * 0.16);
    ctx.strokeStyle = 'hsla(' + ((hueBase + 20) % 360) + ', 100%, 76%, ' + (0.6 + treble * 0.3) + ')';
    ctx.lineWidth = 1.6 + treble * 1.8;
    ctx.stroke();
  }

  // Nose.
  ctx.beginPath();
  ctx.moveTo(0, -headSize * 0.04);
  ctx.lineTo(headSize * 0.08, headSize * 0.16 + mids * 6);
  ctx.lineTo(-headSize * 0.08, headSize * 0.16 + mids * 6);
  ctx.closePath();
  ctx.strokeStyle = 'hsla(' + ((hueBase + 80) % 360) + ', 100%, 74%, 0.88)';
  ctx.lineWidth = 1.6 + mids * 2;
  ctx.stroke();

  // Singing mouth with clear upper/lower edges.
  const mouthCenterY = headSize * 0.35 + smileBounce;
  const mouthHalf = jawWidth * 0.34;
  const shortBeatBounce = Math.sin(time * 0.023) * (headSize * 0.015 + bass * headSize * 0.025);
  const baseMouth = headSize * (performance ? 0.07 : 0.065);
  const mouthRange = headSize * (performance ? 0.14 : 0.18);
  const mouthOpen = clampValue(baseMouth + bass * mouthRange + shortBeatBounce, headSize * 0.05, headSize * 0.24);
  const grinLift = headSize * (0.055 + bass * 0.045);

  ctx.beginPath();
  ctx.moveTo(-mouthHalf, mouthCenterY);
  ctx.lineTo(-mouthHalf * 0.4, mouthCenterY + grinLift);
  ctx.lineTo(0, mouthCenterY + grinLift + mouthOpen * 0.18);
  ctx.lineTo(mouthHalf * 0.4, mouthCenterY + grinLift);
  ctx.lineTo(mouthHalf, mouthCenterY);
  ctx.strokeStyle = 'hsla(' + ((hueBase + 202) % 360) + ', 100%, 80%, 0.95)';
  ctx.lineWidth = 2.2 + bass * 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-mouthHalf * 0.92, mouthCenterY + mouthOpen * 0.1);
  ctx.lineTo(-mouthHalf * 0.45, mouthCenterY + grinLift + mouthOpen);
  ctx.lineTo(0, mouthCenterY + grinLift + mouthOpen * 1.14);
  ctx.lineTo(mouthHalf * 0.45, mouthCenterY + grinLift + mouthOpen);
  ctx.lineTo(mouthHalf * 0.92, mouthCenterY + mouthOpen * 0.1);
  ctx.closePath();
  ctx.fillStyle = 'hsla(' + ((hueBase + 274) % 360) + ', 58%, 18%, ' + (performance ? 0.74 : 0.86) + ')';
  ctx.fill();
  ctx.strokeStyle = 'hsla(' + ((hueBase + 230) % 360) + ', 100%, 74%, 0.9)';
  ctx.lineWidth = 1.8 + bass * 2.8;
  ctx.stroke();

  const cheekSpread = mouthHalf * (0.9 + mids * 0.45);
  const cheekY = mouthCenterY + grinLift * 0.65;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(side * cheekSpread, cheekY - 6);
    ctx.lineTo(side * (cheekSpread + 14 + mids * 14), cheekY + 8 + mids * 4);
    ctx.strokeStyle = 'hsla(' + ((hueBase + 8) % 360) + ', 100%, 72%, ' + (0.35 + mids * 0.42) + ')';
    ctx.lineWidth = 1.2 + mids * 1.6;
    ctx.stroke();
  }

  const spikes = performance ? 6 : 11;
  for (let i = 0; i < spikes; i += 1) {
    const spikeAngle = -Math.PI * 0.9 + (i / Math.max(1, spikes - 1)) * Math.PI * 1.8;
    const startR = headSize * 1.02;
    const endR = headSize * (1.08 + treble * 0.24 + Math.sin(time * 0.012 + i) * 0.03);
    ctx.beginPath();
    ctx.moveTo(Math.cos(spikeAngle) * startR, Math.sin(spikeAngle) * startR);
    ctx.lineTo(Math.cos(spikeAngle) * endR, Math.sin(spikeAngle) * endR);
    ctx.strokeStyle = 'hsla(' + ((hueBase + 230) % 360) + ', 100%, 74%, ' + (0.16 + treble * 0.6) + ')';
    ctx.lineWidth = 1 + treble * 1.6;
    ctx.stroke();
  }

  const accents = performance ? 4 : 8;
  for (let i = 0; i < accents; i += 1) {
    const a = (Math.PI * 2 * i) / accents + time * 0.0008;
    const r1 = headSize * (1.18 + (i % 2) * 0.06);
    const r2 = r1 + 8 + treble * 22;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    ctx.strokeStyle = 'hsla(' + ((hueBase + 280) % 360) + ', 100%, 78%, ' + (0.14 + treble * 0.45) + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, shadowScale, performance } = controlValues();
      const centerX = width / 2;
      const centerY = height / 2;
      createParticles();
      ctx.save();
      ctx.globalCompositeOperation = performance ? 'source-over' : 'lighter';
      for (const particle of particles) {
        particle.angle += particle.speed * (0.8 + sensitivity * 0.35) + levels.mids * 0.018 * sensitivity;
        const burst = levels.treble * (performance ? 32 : 95) * sensitivity + levels.volume * (performance ? 16 : 35);
        const radius = particle.distance + Math.sin(time * 0.003 + particle.distance) * levels.bass * (performance ? 24 : 60) * sensitivity + burst;
        const x = centerX + Math.cos(particle.angle) * radius;
        const y = centerY + Math.sin(particle.angle * 1.08) * radius * (0.66 + levels.mids * 0.16);
        const size = particle.size + levels.treble * (performance ? 2.2 : 6.8) + levels.volume * (performance ? 1.4 : 3.2);
        const hue = (170 + particle.hueOffset + levels.treble * 210 + time * 0.035) % 360;
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + hue + ', 100%, ' + Math.min(86, 58 + intensity * 12) + '%, ' + Math.min(0.86, 0.16 + 0.16 * intensity + levels.treble * 0.28) + ')';
        ctx.shadowBlur = (10 + intensity * 12 + levels.treble * 18) * shadowScale;
        ctx.shadowColor = 'hsla(' + hue + ', 100%, 70%, 0.8)';
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        if (!performance && levels.treble > 0.1) {
          ctx.strokeStyle = 'hsla(' + hue + ', 100%, 75%, ' + Math.min(0.65, levels.treble * 0.9) + ')';
          ctx.lineWidth = 1 + levels.treble * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(particle.angle) * (14 + levels.treble * 58 * sensitivity), y + Math.sin(particle.angle) * (14 + levels.treble * 58 * sensitivity));
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawCenterCircle(time, levels) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { sensitivity, intensity, shadowScale, performance } = controlValues();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 28 + levels.bass * (performance ? 80 : 160) * sensitivity + levels.volume * (performance ? 24 : 42);
      const hue = (190 + time * 0.035 + levels.mids * 210 + levels.treble * 80) % 360;
      ctx.save();
      ctx.globalCompositeOperation = performance ? 'source-over' : 'screen';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + hue + ', 100%, 72%, ' + Math.min(0.42, 0.07 + levels.volume * 0.24 * intensity) + ')';
      ctx.fill();
      ctx.lineWidth = 2 + levels.bass * 3;
      ctx.strokeStyle = 'hsla(' + ((hue + 55) % 360) + ', 100%, 78%, ' + Math.min(0.9, 0.25 + levels.bass * 0.6 + intensity * 0.08) + ')';
      ctx.shadowBlur = (22 + intensity * 18 + levels.bass * 28) * shadowScale;
      ctx.shadowColor = 'hsla(' + hue + ', 100%, 74%, 0.9)';
      ctx.stroke();
      ctx.restore();
    }

    function drawFrame(time) {
      const levels = updateAudioData();
      const mode = modeSelect.value;
      const { performance } = controlValues();
      clearBackground(time, levels);
      if (!performance || mode !== 'waveform') drawStars(time, levels);
      if (!performance && (mode === 'mixed' || mode === 'nebula')) drawNebula(time, levels);
      if (mode === 'nebula') { drawNebula(time, levels); drawParticles(time, levels); drawCenterCircle(time, levels); }
      else if (mode === 'geometry') { drawGeometry(time, levels); if (!performance) drawParticles(time, levels); }
      else if (mode === 'waveform') { drawWaveform(levels, time); drawCenterCircle(time, levels); }
      else if (mode === 'spiral') { drawSpiral(time, levels); if (!performance) drawParticles(time, levels); }
      else if (mode === 'geoface') { drawGeoFace(time, levels); if (!performance) drawParticles(time, levels); }
      else {
        drawWaveform(levels, time);
        drawGeometry(time, levels);
        if (!performance) {
          drawSpiral(time, levels);
          drawParticles(time, levels);
        }
        drawCenterCircle(time, levels);
      }
      updateHud(levels);
      animationFrameId = requestAnimationFrame(drawFrame);
    }

    function startAnimation() {
      if (!animationFrameId) animationFrameId = requestAnimationFrame(drawFrame);
    }

    function stopAnimation() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    async function playAudio() {
      if (!audioElement.src) {
        updateStatus('Choose an MP3 or WAV file before pressing Play.', 'No audio loaded.');
        return;
      }
      try {
        await ensureAudioSetup();
        await audioElement.play();
        startAnimation();
        updateButtonStates(true, true);
        updateStatus('The visualizer is reacting live to the music.', 'Playing: ' + loadedFileName);
      } catch (error) {
        updateStatus('Chrome blocked playback or analysis setup. Try pressing Play again after interacting with the page.', 'Playback paused.');
      }
    }

    function pauseAudio() {
      audioElement.pause();
      updateButtonStates(Boolean(audioElement.src), false);
      updateStatus('Press Play to continue the animation with the same file.', 'Paused: ' + loadedFileName);
    }

    function stopAudio() {
      audioElement.pause();
      safelyRestartFromBeginning();
      resetAudioLevels();
      updateButtonStates(Boolean(audioElement.src), false);
      updateStatus('Playback has stopped. Press Play to start again.', 'Stopped: ' + loadedFileName);
    }

    function restartAudio() {
      if (!audioElement.src) { updateStatus('Choose an audio file first.', 'No audio loaded.'); return; }
      safelyRestartFromBeginning();
      playAudio();
    }

    async function toggleFullscreen() {
      if (!document.fullscreenElement) await app.requestFullscreen();
      else await document.exitFullscreen();
    }

    function updateFullscreenUi() {
      const isFullscreen = Boolean(document.fullscreenElement);
      app.classList.toggle('fullscreen-mode', isFullscreen);
      fullscreenButton.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    }

    function bindHelpButtons() {
      document.querySelectorAll('[data-help-target]').forEach((button) => {
        button.addEventListener('click', () => {
          const target = $(button.dataset.helpTarget);
          if (!target) return;
          document.querySelectorAll('.help-popup').forEach((popup) => { if (popup !== target) popup.hidden = true; });
          target.hidden = !target.hidden;
        });
      });
    }

    audioFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) loadAudioBlob(file, file.name, 'Uploaded file ready. Press Play when you are ready.');
    });
    saveSongButton.addEventListener('click', () => storeSongLocally().catch(() => updateStatus('This song could not be saved locally in the browser right now.', 'Save failed.')));
    randomSongButton.addEventListener('click', () => playRandomTeacherTrack().catch(() => updateStatus('The random song could not start. Try tapping Play again.', 'Playback paused.')));
    miniRandomButton.addEventListener('click', () => playRandomTeacherTrack().catch(() => updateStatus('The random song could not start. Try tapping Play again.', 'Playback paused.')));
    miniPauseButton.addEventListener('click', pauseAudio);
    miniNextButton.addEventListener('click', () => playNextTeacherTrack().catch(() => updateStatus('The next song could not start. Try tapping Play again.', 'Playback paused.')));
    miniExitFullscreenButton.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); });
    playButton.addEventListener('click', playAudio);
    pauseButton.addEventListener('click', pauseAudio);
    stopButton.addEventListener('click', stopAudio);
    restartButton.addEventListener('click', restartAudio);
    clearSavedSongsButton.addEventListener('click', () => clearSavedSongs().catch(() => updateStatus('The saved songs could not be cleared right now.', 'Clear failed.')));
    fullscreenButton.addEventListener('click', () => toggleFullscreen().catch(() => updateStatus('Fullscreen is not available right now.', 'Fullscreen unavailable.')));
    modeSelect.addEventListener('change', updateSliderLabels);
    sensitivitySlider.addEventListener('input', updateSliderLabels);
    colorSlider.addEventListener('input', updateSliderLabels);
    densitySlider.addEventListener('input', () => { createParticles(); updateSliderLabels(); });
    performanceModeToggle.addEventListener('change', () => {
      refreshAnalyserResolution();
      setCanvasSize();
      createParticles();
      updateSliderLabels();
    });
    hudProgress.addEventListener('input', seekFromProgress);
    hudProgress.addEventListener('change', seekFromProgress);
    audioElement.addEventListener('play', () => updateButtonStates(Boolean(audioElement.src), true));
    audioElement.addEventListener('pause', () => { if (audioElement.currentTime > 0 && !audioElement.ended) updateButtonStates(Boolean(audioElement.src), false); });
    audioElement.addEventListener('loadedmetadata', updateProgressHud);
    audioElement.addEventListener('durationchange', updateProgressHud);
    audioElement.addEventListener('timeupdate', updateProgressHud);
    audioElement.addEventListener('error', () => updateStatus('This audio file could not be loaded for playback or analysis.', 'Audio load error.'));
    audioElement.addEventListener('ended', () => {
      if (currentTeacherTrackIndex >= 0 && teacherAudioLibrary.length > 1) {
        playNextTeacherTrack().catch(() => updateStatus('The next teacher song is selected. Tap Play if Chrome pauses autoplay.', 'Next song ready.'));
        return;
      }
      updateButtonStates(Boolean(audioElement.src), false);
      updateStatus('Playback finished. Press Restart or Play to hear it again.', 'Finished: ' + loadedFileName);
    });
    window.addEventListener('resize', setCanvasSize);
    document.addEventListener('fullscreenchange', updateFullscreenUi);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    });
    window.addEventListener('beforeunload', revokeCurrentObjectUrl);

    setCanvasSize();
    createParticles();
    updateSliderLabels();
    updateProgressHud();
    updateButtonStates(false, false);
    updateFullscreenUi();
    bindHelpButtons();
    renderTeacherLibrary();
    if (teacherAudioLibrary.length) selectRandomTeacherTrack();
    else {
      randomSongButton.disabled = true;
      updateNowPlaying('');
      updateStatus('Upload an MP3 or WAV file to begin. Add teacher tracks to assets/audio and list them in teacherAudioLibrary to enable Random Song.', 'No teacher songs available.');
    }
    loadSavedSongsFromDb().catch(renderSavedSongs);
    startAnimation();
  
