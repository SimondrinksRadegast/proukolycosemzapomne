// ==========================================================================
// RETRO 2005 MYSPACE INTERACTIVE SCRIPT - STARKILLER EDITION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Web Audio API Synthesizer for Force Sound Effects
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Play Lightsaber Ignition Sound Effect via Web Audio API
    function playSaberIgniteSound() {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            // Ignition sweep oscillator
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.6);

            // Humming sub-oscillator
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'square';
            sub.frequency.setValueAtTime(60, now + 0.15);
            subGain.gain.setValueAtTime(0.15, now + 0.15);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            sub.connect(subGain);
            subGain.connect(ctx.destination);

            sub.start(now + 0.15);
            sub.stop(now + 0.8);
        } catch (e) {
            console.log("Audio not allowed or supported yet:", e);
        }
    }

    // Play Force Lightning Sound Effect
    function playLightningSound() {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            // Crackling noise buffer
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.Q.setValueAtTime(3, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
            noise.stop(now + 0.5);
        } catch (e) {
            console.log("Audio error:", e);
        }
    }

    // Play Force Push Blast Sound
    function playForcePushSound() {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.45);
        } catch (e) {
            console.log("Audio error:", e);
        }
    }

    // Bind Sound FX Buttons
    document.getElementById('btn-fx-saber')?.addEventListener('click', playSaberIgniteSound);
    document.getElementById('btn-fx-lightning')?.addEventListener('click', playLightningSound);
    document.getElementById('btn-fx-push')?.addEventListener('click', playForcePushSound);


    // --------------------------------------------------------------------------
    // PROFILE THEME SWITCHER LOGIC
    // --------------------------------------------------------------------------
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTheme = e.target.getAttribute('data-theme');

            // Remove active status from all theme buttons
            themeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Apply body class
            document.body.className = '';
            document.body.classList.add(`theme-${selectedTheme}`);

            // Play saber sound effect on theme change
            playSaberIgniteSound();
        });
    });


    // --------------------------------------------------------------------------
    // WINAMP AUDIO PLAYER CONTROLS (SYNTHESIZED MIDI / AUDIO)
    // --------------------------------------------------------------------------
    const winampBox = document.getElementById('winamp-player');
    const playBtn = document.getElementById('wa-play');
    const pauseBtn = document.getElementById('wa-pause');
    const stopBtn = document.getElementById('wa-stop');
    const prevBtn = document.getElementById('wa-prev');
    const nextBtn = document.getElementById('wa-next');
    const trackTitleDisplay = document.getElementById('track-title');
    const playlistSelect = document.getElementById('playlist-select');
    const trackTimeDisplay = document.getElementById('track-time');

    const tracks = [
        { name: "1. Force Unleashed Metal Theme (320kbps)", duration: "03:45", freq: 220 },
        { name: "2. Imperial March (Sith Dubstep VIP Remix)", duration: "04:12", freq: 180 },
        { name: "3. Evanescence - Bring Me To Life (Galen Edit)", duration: "03:58", freq: 260 },
        { name: "4. Linkin Park - Numb (Force Lightning AMV)", duration: "03:07", freq: 300 }
    ];

    let currentTrackIdx = 0;
    let isPlaying = false;
    let musicOsc = null;
    let musicGain = null;
    let playTimer = null;
    let secondsElapsed = 0;

    function startMusicSynth(freq) {
        stopMusicSynth();
        try {
            const ctx = getAudioContext();
            musicOsc = ctx.createOscillator();
            musicGain = ctx.createGain();

            musicOsc.type = 'sawtooth';
            musicOsc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Arpeggio effect to sound like 2005 8-bit / tracker music
            let isHigh = false;
            setInterval(() => {
                if (isPlaying && musicOsc && ctx.state === 'running') {
                    musicOsc.frequency.setValueAtTime(isHigh ? freq * 1.25 : freq, ctx.currentTime);
                    isHigh = !isHigh;
                }
            }, 250);

            musicGain.gain.setValueAtTime(0.05, ctx.currentTime);

            musicOsc.connect(musicGain);
            musicGain.connect(ctx.destination);

            musicOsc.start();
        } catch (e) {
            console.log("Audio play blocked", e);
        }
    }

    function stopMusicSynth() {
        if (musicOsc) {
            try {
                musicOsc.stop();
                musicOsc.disconnect();
            } catch (e) {}
            musicOsc = null;
        }
    }

    function playTrack(idx) {
        currentTrackIdx = idx;
        const track = tracks[currentTrackIdx];
        trackTitleDisplay.textContent = track.name;
        playlistSelect.value = currentTrackIdx;
        isPlaying = true;
        winampBox.classList.add('playing');

        startMusicSynth(track.freq);

        if (playTimer) clearInterval(playTimer);
        playTimer = setInterval(() => {
            secondsElapsed++;
            const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
            const secs = String(secondsElapsed % 60).padStart(2, '0');
            trackTimeDisplay.textContent = `${mins}:${secs} / ${track.duration}`;
        }, 1000);
    }

    function pauseTrack() {
        isPlaying = false;
        winampBox.classList.remove('playing');
        stopMusicSynth();
        if (playTimer) clearInterval(playTimer);
    }

    function stopTrack() {
        pauseTrack();
        secondsElapsed = 0;
        const track = tracks[currentTrackIdx];
        trackTimeDisplay.textContent = `00:00 / ${track.duration}`;
    }

    playBtn?.addEventListener('click', () => playTrack(currentTrackIdx));
    pauseBtn?.addEventListener('click', pauseTrack);
    stopBtn?.addEventListener('click', stopTrack);

    prevBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
        playTrack(currentTrackIdx);
    });

    nextBtn?.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
        playTrack(currentTrackIdx);
    });

    playlistSelect?.addEventListener('change', (e) => {
        playTrack(parseInt(e.target.value, 10));
    });


    // --------------------------------------------------------------------------
    // CONTACT BUTTONS & AIM MODAL DIALOG LOGIC
    // --------------------------------------------------------------------------
    const aimModal = document.getElementById('aim-modal');
    const aimCloseBtn = document.getElementById('aim-close');
    const btnInstantMsg = document.getElementById('btn-instant-msg');
    const aimSendBtn = document.getElementById('aim-send-btn');
    const aimInput = document.getElementById('aim-input');
    const aimChatHistory = document.getElementById('aim-chat-history');

    btnInstantMsg?.addEventListener('click', () => {
        aimModal.classList.remove('hidden');
        playSaberIgniteSound();
    });

    aimCloseBtn?.addEventListener('click', () => {
        aimModal.classList.add('hidden');
    });

    function sendAimMessage() {
        const msg = aimInput.value.trim();
        if (!msg) return;

        // Append user msg
        const userDiv = document.createElement('div');
        userDiv.className = 'aim-msg aim-user';
        userDiv.innerHTML = `<b>You:</b> ${escapeHTML(msg)}`;
        aimChatHistory.appendChild(userDiv);

        aimInput.value = '';
        aimChatHistory.scrollTop = aimChatHistory.scrollHeight;

        // Auto reply from Starkiller after short delay
        setTimeout(() => {
            const replies = [
                "I don't have time for chatting, I have a Death Star to infiltrate!",
                "Have you seen Juno? Tell her the Rogue Shadow hyperdrive is making a weird hum.",
                "PROXY is disguised as a protocol droid right now... don't trust him!",
                "Vader is calling me on the Holonet again. Gotta go before he chokes me!",
                "May the Force be with you... or whatever."
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            const buddyDiv = document.createElement('div');
            buddyDiv.className = 'aim-msg aim-buddy';
            buddyDiv.innerHTML = `<b>xX_St4rk1ll3r_Xx:</b> ${randomReply}`;
            aimChatHistory.appendChild(buddyDiv);
            aimChatHistory.scrollTop = aimChatHistory.scrollHeight;
            playLightningSound();
        }, 800);
    }

    aimSendBtn?.addEventListener('click', sendAimMessage);
    aimInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAimMessage();
    });

    // Other contact buttons
    document.getElementById('btn-add-friend')?.addEventListener('click', () => {
        alert("✨ Friendship Request Sent to xX_St4rk1ll3r_Xx! Wait for approval on the Rogue Shadow!");
        playSaberIgniteSound();
    });

    document.getElementById('btn-send-msg')?.addEventListener('click', () => {
        alert("✉️ MySpace Mail Form Loaded! Sending message via Imperial Holonet relay...");
    });

    document.getElementById('btn-add-fav')?.addEventListener('click', () => {
        alert("⭐ Added xX_St4rk1ll3r_Xx to your MySpace Favorites!");
    });

    document.getElementById('btn-block-user')?.addEventListener('click', () => {
        alert("🚫 You cannot block Darth Vader's Secret Apprentice! Force Repulse overrides your block list!");
        playForcePushSound();
    });

    document.getElementById('btn-rank-user')?.addEventListener('click', () => {
        alert("📊 Rated Starkiller 10/10 Sith Stars! 🔥⚡");
    });


    // --------------------------------------------------------------------------
    // COMMENT SUBMISSION FORM LOGIC
    // --------------------------------------------------------------------------
    const btnPostComment = document.getElementById('btn-post-comment');
    const btnGlitterComment = document.getElementById('btn-glitter-comment');
    const commentAuthorInput = document.getElementById('comment-author');
    const commentTextInput = document.getElementById('comment-text');
    const commentsList = document.getElementById('comments-list');
    const commentCountNum = document.getElementById('comment-count-num');

    let totalComments = 4;

    btnGlitterComment?.addEventListener('click', () => {
        commentTextInput.value += " ✨~*~ xX_SITH_GLITTER_Xx ~*~✨ ";
    });

    btnPostComment?.addEventListener('click', () => {
        const author = commentAuthorInput.value.trim() || 'Anonymous Sith';
        const text = commentTextInput.value.trim();

        if (!text) {
            alert('Please enter a comment message before posting!');
            return;
        }

        const nowStr = new Date().toLocaleString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const newCommentItem = document.createElement('div');
        newCommentItem.className = 'comment-item';
        newCommentItem.innerHTML = `
            <div class="comment-user">
                <a href="#" class="comment-author">${escapeHTML(author)}</a>
                <div class="comment-avatar-mini">✨</div>
                <span class="comment-date">${nowStr}</span>
            </div>
            <div class="comment-body">
                <p>${sanitizeCommentText(text)}</p>
            </div>
        `;

        commentsList.insertBefore(newCommentItem, commentsList.firstChild);

        // Reset form
        commentAuthorInput.value = '';
        commentTextInput.value = '';

        // Increment count
        totalComments++;
        if (commentCountNum) commentCountNum.textContent = totalComments;

        playSaberIgniteSound();
    });


    // Helper functions
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function sanitizeCommentText(text) {
        // Allow basic nostalgic HTML like <font>, <b>, <i>, <u>, <marquee> safely
        let cleaned = escapeHTML(text);
        cleaned = cleaned.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<b>$1</b>');
        cleaned = cleaned.replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<i>$1</i>');
        cleaned = cleaned.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
        cleaned = cleaned.replace(/&lt;font color=(.*?)&gt;(.*?)&lt;\/font&gt;/gi, '<font color=$1>$2</font>');
        return cleaned;
    }

});
