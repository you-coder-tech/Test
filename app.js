// انتظر حتى يتم تحميل كل شيء في الصفحة
document.addEventListener('DOMContentLoaded', () => {
    
    // --- تعريف كل عناصر الواجهة ---
    const dom = {
        audioPlayer: document.getElementById("audio-player"),
        uploadBtn: document.getElementById("upload-btn"),
        uploadInput: document.getElementById("upload-input"),
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

    // --- الوظيفة الرئيسية: تحميل وتشغيل تراك معين ---
    function loadTrack(trackIndex) {
        if (trackIndex < 0 || trackIndex >= playlistFiles.length) {
            // لو مفيش أغاني، رجع كل حاجة لوضعها الطبيعي
            dom.songTitle.textContent = "No Song Loaded";
            dom.songArtist.textContent = "Upload music to begin";
            dom.albumArt.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,3..."></svg>';
            dom.audioPlayer.src = "";
            return;
        }

        currentTrackIndex = trackIndex;
        const currentFile = playlistFiles[trackIndex];
        
        // هنا بنستخدم الرابط المؤقت اللي عملناه للأغنية
        dom.audioPlayer.src = currentFile.url;
        dom.songTitle.textContent = currentFile.title || "Unknown Title";
        dom.songArtist.textContent = currentFile.artist || "Unknown Artist";

        // تحديث الواجهة لتظهير الأغنية النشطة
        document.querySelectorAll('.playlist li').forEach((item, index) => {
            item.classList.toggle('active', index === currentTrackIndex);
        });

        playMusic();
    }

    // --- وظائف التحكم في التشغيل ---
    function playMusic() {
        dom.audioPlayer.play();
        dom.playIcon.style.display = 'none';
        dom.pauseIcon.style.display = 'block';
        dom.albumArt.classList.add('playing');
    }

    function pauseMusic() {
        dom.audioPlayer.pause();
        dom.playIcon.style.display = 'block';
        dom.pauseIcon.style.display = 'none';
        dom.albumArt.classList.remove('playing');
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlistFiles.length) % playlistFiles.length;
        loadTrack(currentTrackIndex);
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlistFiles.length;
        loadTrack(currentTrackIndex);
    }
    
    // --- (المنطق الجديد) التعامل مع رفع الأغاني ---
    dom.uploadBtn.addEventListener('click', () => {
        // لما نضغط على زرار الرفع، كأننا ضغطنا على زرار الملفات المخفي
        dom.uploadInput.click();
    });

    dom.uploadInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length === 0) return;

        // حول كل الملفات اللي تم رفعها لروابط مؤقتة وأضفها لقائمة التشغيل
        Array.from(files).forEach(file => {
            playlistFiles.push({
                url: URL.createObjectURL(file),
                title: file.name.replace('.mp3', ''),
                artist: 'Unknown Artist'
            });
        });

        renderPlaylist();
        
        // لو دي أول أغنية تضاف، شغلها
        if (playlistFiles.length === files.length) {
            loadTrack(0);
        }
    });

    // --- وظيفة عرض قائمة التشغيل في الواجهة ---
    function renderPlaylist() {
        dom.playlist.innerHTML = ''; // فضي القائمة القديمة
        playlistFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            li.innerHTML = `<span class="song-name">${file.title}</span>`;
            
            // لما نضغط على أغنية في القائمة، شغلها
            li.addEventListener('click', () => {
                loadTrack(index);
            });
            
            dom.playlist.appendChild(li);
        });
    }

    // --- ربط الأزرار بالوظائف ---
    dom.playPauseBtn.addEventListener('click', () => {
        dom.audioPlayer.paused? playMusic() : pauseMusic();
    });

    dom.prevBtn.addEventListener('click', prevTrack);
    dom.nextBtn.addEventListener('click', nextTrack);
    dom.audioPlayer.addEventListener('ended', nextTrack);

    // --- تحديث شريط التقدم والوقت ---
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
        if(duration) {
            dom.audioPlayer.currentTime = (clickX / width) * duration;
        }
    });

    // وظيفة مساعدة لتحويل الثواني لصيغة 0:00
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10? '0' : ''}${secs}`;
    }

});
