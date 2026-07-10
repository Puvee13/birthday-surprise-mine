document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation & State ---
    let currentPage = 0;

    // --- Background Music Control ---
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    let isPlaying = false;

    // Music will be started after passcode unlock (needed for mobile autoplay policy)
    // musicBtn wired below
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.innerText = "PLAY MUSIC 🎶";
            isPlaying = false;
        } else {
            bgMusic.play().catch(() => {});
            musicBtn.innerText = "PAUSE MUSIC 🎶";
            isPlaying = true;
        }
    });

    // --- Page 0: Passcode Lock ---
    // Passcode stored as Base64 for basic obfuscation (not visible in plain text)
    // Current passcode: "iloveyou" — you can change it here
    const ENCODED_PASS = btoa('iloveyou');

    const passcodeInput = document.getElementById('passcode-input');
    const btnUnlock    = document.getElementById('btn-unlock');
    const passcodeErr  = document.getElementById('passcode-error');

    function tryUnlock() {
        const entered = passcodeInput.value.trim();
        if (btoa(entered) === ENCODED_PASS) {
            // Correct! Start music (this is a user gesture so mobile allows it)
            bgMusic.play().then(() => {
                isPlaying = true;
                musicBtn.innerText = "PAUSE MUSIC 🎶";
            }).catch(() => {});
            goToPage(1);
        } else {
            // Wrong — shake the error
            passcodeErr.classList.remove('hidden');
            // Re-trigger shake animation
            passcodeErr.style.animation = 'none';
            void passcodeErr.offsetWidth; // reflow
            passcodeErr.style.animation = 'shake 0.5s ease-in-out';
            passcodeInput.value = '';
            passcodeInput.focus();
        }
    }

    btnUnlock.addEventListener('click', tryUnlock);
    passcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryUnlock();
    });

    // Start continuous hearts immediately, valid for all pages as requested
    createFallingHearts();

    // Expose goBack to global scope
    window.goBack = function (fromPage) {
        // Navigate to previous page
        // Page 2 -> 1
        // Page 3 -> 2 (reset state?)
        // Page 4 -> 3
        // Page 5 -> 4
        // Depending on user intent, typically strictly sequential reverse.

        let targetPage = fromPage - 1;
        if (targetPage < 1) targetPage = 1;
        // Never go below page 1 (passcode page is one-way)
        if (targetPage < 1) targetPage = 1;

        // Special handling for undoing "Decoration" state if going back from 3 to 2? 
        // Or if going back from 4 to 3? 
        // For simplicity, just navigation.
        if (fromPage === 3) {
            document.body.classList.remove('bg-dark-purple');
            resetDecorationState();
        } else if (fromPage === 4) {
            document.body.classList.add('bg-dark-purple');
        }

        goToPage(targetPage);
    };

    // --- Page 1 Logic ---
    const btnCelebration = document.getElementById('btn-lets-celebrate');
    btnCelebration.addEventListener('click', () => {
        createConfetti();
        setTimeout(() => {
            goToPage(2);
        }, 800);
    });

    // --- Page 2 Logic (The Box) ---
    const btnBoxNext = document.getElementById('btn-box-next');
    const btnBoxYes = document.getElementById('btn-box-yes');
    const btnBoxNo = document.getElementById('btn-box-no');
    const btnBoxGo = document.getElementById('btn-box-go');

    const state1 = document.getElementById('box-state-1');
    const state2 = document.getElementById('box-state-2');
    const state3 = document.getElementById('box-state-3');

    // State 1 -> 2
    btnBoxNext.addEventListener('click', () => {
        animateOut(state1, () => {
            state1.classList.add('hidden');
            state2.classList.remove('hidden');
            state2.classList.remove('exit-up'); // Ensure it's clean
            swoopIn(state2);
        });
    });

    // State 2 (No) -> Back to 1 (As previously requested)
    btnBoxNo.addEventListener('click', () => {
        goToPage(1);
        setTimeout(() => {
            resetBoxState();
        }, 1000);
    });

    // State 2 (Yes) -> 3
    btnBoxYes.addEventListener('click', () => {
        animateOut(state2, () => {
            state2.classList.add('hidden');
            state3.classList.remove('hidden');
            state3.classList.remove('exit-up');
            swoopIn(state3);
            createConfetti();
        });
    });

    // State 3 -> Page 3
    btnBoxGo.addEventListener('click', () => {
        // Animation change of background colour (Flash Pink temp)
        const oldBg = document.body.style.backgroundImage;
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#f48fb1'; // Flash
        document.body.style.transition = 'background-color 0.5s';

        setTimeout(() => {
            document.body.style.backgroundImage = oldBg; // Reset
            document.body.style.backgroundColor = '';
        }, 800);

        const magicBox = document.getElementById('magic-box-content');
        animateOut(magicBox, () => {
            goToPage(3);
        });
    });

    function resetBoxState() {
        state1.classList.remove('hidden', 'exit-up');
        state2.classList.add('hidden');
        state3.classList.add('hidden');
        // Reset magic box container anims if any
        const magicBox = document.getElementById('magic-box-content');
        magicBox.classList.remove('exit-up');
    }

    // --- Page 3 Logic (Decoration) ---
    const btnDecorate = document.getElementById('btn-decorate');
    const bulbsContainer = document.getElementById('light-bulbs');
    const bannersContainer = document.getElementById('banners');
    const cakeContainer = document.getElementById('cake-container');
    const balloonsContainer = document.getElementById('balloons-container');
    const headerText = document.querySelector('.decorate-header');

    let decorationStep = 0;

    btnDecorate.addEventListener('click', () => {
        if (decorationStep === 0) {
            // Step 1: Turn on Lights
            document.body.classList.add('bg-dark-purple');
            headerText.style.color = '#FFFFFF';
            headerText.innerHTML = "Decorating... <span style='font-size:1.5rem'>✨</span>";

            btnDecorate.innerText = "BRING THE CAKE!!";

            bulbsContainer.classList.remove('hidden');
            createBulbs();

            decorationStep++;
        } else if (decorationStep === 1) {
            // Step 2: Bring Cake

            // 1. Hide text/button immediately (opacity 0)
            const centerContent = document.querySelector('#page-3 .center-content');
            centerContent.classList.add('fade-out-content');

            // 2. Show Cake
            cakeContainer.classList.remove('hidden');
            cakeContainer.classList.remove('cake-exit'); // Ensure reset

            // 3. Wait 8 seconds -> Animate Cake Out
            setTimeout(() => {
                cakeContainer.classList.add('cake-exit');
            }, 8000);

            // 4. Wait 10 seconds (Total) -> Show text/button, Change Button Text
            setTimeout(() => {
                btnDecorate.innerText = "FLY THE BALLOONS";
                centerContent.classList.remove('fade-out-content');
                centerContent.classList.add('fade-in-content');

                // Hide cake container cleanly after it's gone
                setTimeout(() => {
                    cakeContainer.classList.add('hidden');
                    cakeContainer.classList.remove('cake-exit');
                }, 1000); // Allow exit anim to finish visual

            }, 10000);

            decorationStep++;
        } else if (decorationStep === 2) {
            // Step 3: Fly Balloons
            createBalloons();
            btnDecorate.innerText = "I HAVE A MESSAGE FOR YOU";
            decorationStep++;
        } else if (decorationStep === 3) {
            // Step 4: Go to Page 4
            document.body.classList.remove('bg-dark-purple');
            goToPage(4);
        }
    });


    function resetDecorationState() {
        decorationStep = 0;
        document.body.classList.remove('bg-dark-purple');

        // Reset Text and Button
        headerText.style.color = ''; // Reset to default (was white)
        headerText.innerHTML = 'Let\'s Celebrate 🎂';
        btnDecorate.innerText = "TURN ON THE LIGHTS";

        // Hide Elements
        bulbsContainer.classList.add('hidden');
        cakeContainer.classList.add('hidden');
        cakeContainer.classList.remove('cake-exit');
        balloonsContainer.innerHTML = ''; // Clear balloons

        // Ensure center content is visible
        const centerContent = document.querySelector('#page-3 .center-content');
        centerContent.classList.remove('fade-out-content', 'fade-in-content');
    }

    function createBulbs() {
        bulbsContainer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const bulb = document.createElement('div');
            bulb.classList.add('bulb');
            bulb.style.background = i % 2 === 0 ? '#ffeb3b' : '#03a9f4';
            bulb.style.boxShadow = `0 0 15px ${i % 2 === 0 ? '#ffeb3b' : '#03a9f4'}`;
            bulb.style.animationDelay = (Math.random()) + 's';
            bulbsContainer.appendChild(bulb);
        }
    }

    function createBalloons() {
        balloonsContainer.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const b = document.createElement('div');
            b.classList.add('balloon');
            b.style.left = Math.random() * 95 + '%';
            b.style.backgroundColor = getRandomColor();
            b.style.animationDuration = (5 + Math.random() * 5) + 's';
            balloonsContainer.appendChild(b);
        }
    }

    // --- Page 4 Logic (Letter) ---
    const btnOpenLetter = document.getElementById('btn-open-letter');
    const letterContent = document.getElementById('letter-content');
    const auditoriumScreen = document.querySelector('.auditorium-screen');

    btnOpenLetter.addEventListener('click', () => {
        auditoriumScreen.classList.add('screen-open');
        // Hide button after click for cleaner look?
        // btnOpenLetter.style.opacity = 0;

        setTimeout(() => {
            letterContent.classList.remove('hidden');
            swoopIn(letterContent);
        }, 800);
    });

    const btnMemories = document.getElementById('btn-memories');
    btnMemories.addEventListener('click', () => {
        goToPage(5);
    });

    // Page 5: Go Home Button Logic
    const btnGoHome = document.getElementById('btn-go-home');
    if (btnGoHome) {
        btnGoHome.addEventListener('click', () => {
            // Reset all states when jumping back to start
            resetBoxState();
            resetDecorationState();
            goToPage(1);
        });
    }

    // Audio Resilience: Keep isPlaying in sync if audio is played/paused by browser
    bgMusic.addEventListener('play', () => {
        isPlaying = true;
        musicBtn.innerText = "PAUSE MUSIC 🎶";
    });
    bgMusic.addEventListener('pause', () => {
        isPlaying = false;
        musicBtn.innerText = "PLAY MUSIC 🎶";
    });


    // --- Helpers ---
    function goToPage(pageNum) {
        let activePage = null;
        document.querySelectorAll('.page').forEach(p => {
            if (p.classList.contains('active')) {
                activePage = p;
                p.style.opacity = 0;
                p.classList.remove('active');
            }
        });

        const showTarget = () => {
            const target = document.getElementById(`page-${pageNum}`);
            if (target) {
                target.style.display = 'flex';
                // Force reflow
                void target.offsetWidth;
                target.classList.add('active');
                target.style.opacity = 1;

                // Trigger Page 5 Gallery Animations
                if (pageNum === 5) {
                    const frames = target.querySelectorAll('.frame');
                    frames.forEach((frame, index) => {
                        // Reset if already there
                        frame.classList.remove('gallery-animate');
                        frame.style.animationDelay = '';

                        // Force reflow to restart animation
                        void frame.offsetWidth;

                        frame.style.animationDelay = (index * 0.1) + 's';
                        frame.classList.add('gallery-animate');
                    });
                }
            }
            currentPage = pageNum;
        };

        if (activePage) {
            // Wait for exit transition
            setTimeout(() => {
                activePage.style.display = 'none';
                showTarget();
            }, 800);
        } else {
            // No active page (initial load), show immediately
            showTarget();
        }
    }

    function animateOut(element, callback) {
        element.classList.add('exit-up');
        setTimeout(() => {
            if (callback) callback();
            element.classList.remove('exit-up');
        }, 600);
    }

    function swoopIn(element) {
        element.style.opacity = 0;
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        requestAnimationFrame(() => {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        });
    }

    function createFallingHearts() {
        // Continuous loop that runs always
        setInterval(() => {
            const heart = document.createElement('div');
            heart.classList.add('bg-heart');
            heart.innerText = "❤️";
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (4 + Math.random() * 4) + 's';

            // Random sizes
            const size = Math.random() * 20 + 10;
            heart.style.fontSize = size + 'px';
            heart.style.opacity = Math.random() * 0.6 + 0.2;

            // Colors: Pink/Purple gradient feel
            heart.style.color = Math.random() > 0.5 ? '#FFCCE0' : '#E1BEE7';

            document.body.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 8000); // Remove after animation
        }, 400); // Spawn frequency
    }

    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10vh';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.zIndex = '9999';
            confetti.style.transition = 'top 3s ease-in, transform 3s linear';
            document.body.appendChild(confetti);

            requestAnimationFrame(() => {
                confetti.style.top = '110vh';
                confetti.style.transform = `rotate(${Math.random() * 1000}deg)`;
            });

            setTimeout(() => confetti.remove(), 3000);
        }
    }

    function getRandomColor() {
        const colors = ['#FFEB3B', '#FF4081', '#E040FB', '#536DFE', '#69F0AE'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});
