document.addEventListener('DOMContentLoaded', () => {
    
    // --- تعريف كل عناصر الواجهة ---
    const dom = {
        audioPlayer: document.getElementById("audio-player"),
        uploadBtn: document.getElementById("upload-btn"),
        uploadInput: document.getElementById("upload-input"),
        playlistContainer: document.getElementById("playlist-container"), // أضفنا الحاوية هنا
        playlist: document.getElementById("playlist"),
        albumArt: document.getElementById("album-art"),
        songTitle: document.getElementById("song-title"),
        songArtist: document.getElementById("song-artist"),
        progressContainer: document.getElementById("progress-container"),
        progress: document.getElementById("progress"),
        currentTime: document.getElementById("current-time"),
        totalDuration: document.getElementById("total-duration"),
        prevBtn: document.getElementById("prev-btn"),
        playPauseBtn: document.getElementById("play-pause-btn"),
        playIcon: document.getElementById("play-icon"),
        pauseIcon: document.getElementById("pause-icon"),
        nextBtn: document.getElementById("next-btn"),
    };

    let playlistFiles = [];
    let currentTrackIndex = 0;

    // --- (المنطق الجديد) التعامل مع رفع الملفات (لكل الحالات) ---
    function handleFiles(files) {
        if (!files || files.length === 0) return;

        const wasPlaylistEmpty = playlistFiles.length === 0;

        Array.from(files).forEach(file => {
            // نتأكد إنه ملف صوتي
            if (file.type.startsWith('audio/')) {
                playlistFiles.push({
                    url: URL.createObjectURL(file),
                    title: file.name.replace(/\.[^/.]+$/, ""), // يشيل الامتداد زي.mp3
                    artist: 'Unknown Artist'
                });
            }
        });

        renderPlaylist();
        
        if (wasPlaylistEmpty && playlistFiles.length > 0) {
            loadTrack(0);
        }
    }
    
    // --- ربط زر الرفع بالوظيفة الجديدة ---
    dom.uploadBtn.addEventListener('click', () => dom.uploadInput.click());
    dom.uploadInput.addEventListener('change', (event) => handleFiles(event.target.files));

    // ===============================================
    // ====== منطق السحب والإفلات الجديد ======
    // ===============================================
    const dropZone = dom.playlistContainer;

    // منع السلوك الافتراضي للمتصفح
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // إضافة تأثير بصري عند السحب فوق المنطقة
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    // إزالة التأثير البصري عند مغادرة المنطقة
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    // التعامل مع الملفات عند إفلاتها
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files); // استخدام نفس الوظيفة
    }, false);

    // --- باقي الوظائف (زي ما هي بدون تغيير) ---
    function loadTrack(trackIndex) { /*... نفس الكود... */ }
    function playMusic() { /*... نفس الكود... */ }
    function pauseMusic() { /*... نفس الكود... */ }
    function prevTrack() { /*... نفس الكود... */ }
    function nextTrack() { /*... نفس الكود... */ }
    function renderPlaylist() { /*... نفس الكود... */ }
    function formatTime(seconds) { /*... نفس الكود... */ }
    
    // باقي الأكواد اللي كانت موجودة في الملف القديم (نسخ ولصق)
    function loadTrack(trackIndex) {
        if (trackIndex < 0 || trackIndex >= playlistFiles.length) {
            dom.songTitle.textContent = "No Song Loaded";
            dom.songArtist.textContent = "Upload music to begin";
            dom.albumArt.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8,12 6,14 6,16.5C6,19 8,21 10.5,21C13,21 15,19 15,16.5V6H19V3H12Z" /></svg>';
            dom.audioPlayer.src = "";
            pauseMusic();
            return;
        }

        currentTrackIndex = trackIndex;
        const currentFile = playlistFiles[trackIndex];
        
        dom.audioPlayer.src = currentFile.url;
        dom.songTitle.textContent = currentFile.title || "Unknown Title";
        dom.songArtist.textContent = currentFile.artist || "Unknown Artist";

        document.querySelectorAll('.playlist li').forEach((item, index) => {
            item.classList.toggle('active', index === currentTrackIndex);
        });

        playMusic();
    }
    
    function playMusic() { dom.audioPlayer.play(); dom.playIcon.style.display = 'none'; dom.pauseIcon.style.display = 'block'; dom.albumArt.classList.add('playing'); }
    function pauseMusic() { dom.audioPlayer.pause(); dom.playIcon.style.display = 'block'; dom.pauseIcon.style.display = 'none'; dom.albumArt.classList.remove('playing'); }
    function prevTrack() { currentTrackIndex = (currentTrackIndex - 1 + playlistFiles.length) % playlistFiles.length; loadTrack(currentTrackIndex); }
    function nextTrack() { currentTrackIndex = (currentTrackIndex + 1) % playlistFiles.length; loadTrack(currentTrackIndex); }
    
    function renderPlaylist() {
        dom.playlist.innerHTML = '';
        if (playlistFiles.length === 0) return;
        playlistFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            li.innerHTML = `<span class="song-name">${file.title}</span>`;
            li.addEventListener('click', () => { loadTrack(index); });
            dom.playlist.appendChild(li);
        });
    }

    dom.playPauseBtn.addEventListener('click', () => { dom.audioPlayer.paused? playMusic() : pauseMusic(); });
    dom.prevBtn.addEventListener('click', prevTrack);
    dom.nextBtn.addEventListener('click', nextTrack);
    dom.audioPlayer.addEventListener('ended', nextTrack);

    dom.audioPlayer.addEventListener('timeupdate', () => {
        const { currentTime, duration } = dom.audioPlayer;
        if (duration) {
            dom.progress.style.width = `${(currentTime / duration) * 100}%`;
            dom.currentTime.textContent = formatTime(currentTime);
            dom.totalDuration.textContent = formatTime(duration);
        }
    });

    dom.progressContainer.addEventListener('click', (e) => {
        const width = dom.progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = dom.audioPlayer.duration;
        if(duration) { dom.audioPlayer.currentTime = (clickX / width) * duration; }
    });
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10? '0' : ''}${secs}`;
    }
});
