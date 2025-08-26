
document.addEventListener('DOMContentLoaded', () => {
    initInfiniteScroller();
    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    const nameEl = document.getElementById('name');
    const subtitleEl = document.getElementById('subtitle');

    const originalName = nameEl.textContent.trim();
    nameEl.textContent = ''; // Clear name for scramble effect
    subtitleEl.textContent = ''; // Clear subtitle for scramble effect

    window.addEventListener('load', () => {
        preloader.classList.add('loaded');
        // NEW: Text Scramble Effect
        class TextScramble {
            constructor(el) {
                this.el = el;
                this.chars = '!<>-_\\/[]{}—=+*^?#________';
                this.update = this.update.bind(this);
            }
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise((resolve) => this.resolve = resolve);
                this.queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    this.queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            update() {
                let output = '';
                let complete = 0;
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.randomChar();
                            this.queue[i].char = char;
                        }
                        output += `<span class="dud" style="opacity: 0.5">${char}</span>`;
                    } else {
                        output += from;
                    }
                }
                this.el.innerHTML = output;
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
            randomChar() {
                return this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }
        const nameFx = new TextScramble(nameEl);
        const subtitleFx = new TextScramble(subtitleEl);

        const subtitles = [
            'UX Designer | Storyteller | Creator',
            'Crafting Experiences, One Pixel at a Time',
            'Turning Ideas into Intuitive Designs'
        ];
        let subtitleCounter = 0;

        const nextSubtitle = () => {
            subtitleFx.setText(subtitles[subtitleCounter]).then(() => {
                setTimeout(nextSubtitle, 4000); // Wait 4s before next scramble
            });
            subtitleCounter = (subtitleCounter + 1) % subtitles.length;
        };

        setTimeout(() => {
            nameFx.setText(originalName).then(() => {
                setTimeout(nextSubtitle, 1000); // Start subtitle cycle after name is done
            });
        }, 500); // Delay after preloader fades
    });

    // --- Custom Cursor & Aura ---
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.cursor-follower');
    const aura = document.querySelector('.aura');
    let mouseX = 0, mouseY = 0;
    let clientX = 0, clientY = 0;
    window.addEventListener('mousemove', (e) => {
        clientX = e.clientX;
        clientY = e.clientY;
    });

    const renderCursor = () => {
        mouseX += (clientX - mouseX) * 0.1;
        mouseY += (clientY - mouseY) * 0.1;

        cursor.style.transform = `translate(${clientX - 2}px, ${clientY - 2}px)`;
        follower.style.transform = `translate(${mouseX - 15}px, ${mouseY - 15}px)`;
        aura.style.transform = `translate(${mouseX - 200}px, ${mouseY - 200}px)`;
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // --- Three.js Particle System ---
    const canvas = document.getElementById('hero-3d-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const mouse = new THREE.Vector2();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const particlesGeometry = new THREE.BufferGeometry;
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    const originalPos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
        originalPos[i] = posArray[i];
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x9f7aea,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        particlesMesh.rotation.y = -0.05 * elapsedTime;

        // NEW: Enhanced mouse interaction
        const positions = particlesGeometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const dx = mouse.x * 5 - originalPos[ix];
            const dy = mouse.y * 5 - originalPos[iy];
            const dist = Math.sqrt(dx * dx + dy * dy);

            const force = Math.max(0, 1 - dist * 0.5);

            positions[ix] = originalPos[ix] + dx * force * 0.1;
            positions[iy] = originalPos[iy] + dy * force * 0.1;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- GSAP Scroll & Interactive Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // 1. Animate 3D Camera on Scroll
    gsap.timeline({
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        }
    }).to(camera.position, { z: 10, y: -2 }) // FIXED: Reduced zoom out
        .to(camera.rotation, { x: -0.4, ease: "power1.inOut" }, "<");

    // 2. Animate Section Titles
    gsap.utils.toArray('h2.neon-text').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 90%',
                toggleActions: 'restart none none reverse',
            },
            opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
        });
    });

    // 3. Animate Individual Sections
    gsap.from('#about img', { scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'restart none none reverse' }, opacity: 0, x: -50, duration: 1, ease: 'power3.out' });
    gsap.from('#about .md\\:w-2\\/3 > *', { scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'restart none none reverse' }, opacity: 0, x: 50, duration: 1, stagger: 0.2, ease: 'power3.out' });

    gsap.utils.toArray('.timeline-item').forEach(item => {
        gsap.from(item, { scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'restart none none reverse' }, opacity: 0, x: -40, duration: 0.8, ease: 'power3.out' });
    });

    // 4. Skills Section pop-up animation
    gsap.from('.skill-icon-container', {
        scrollTrigger: {
            trigger: '#skills',
            start: 'top 80%',
            toggleActions: 'restart none none reverse'
        },
        opacity: 0,
        y: 30,
        scale: 0.8,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    });

    // 5. Timeline Spotlight Animation
    const spotlight = document.getElementById('timeline-spotlight');
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => gsap.to(spotlight, { y: item.offsetTop + 20, duration: 0.8, ease: 'power3.out' }),
            onEnterBack: () => gsap.to(spotlight, { y: item.offsetTop + 20, duration: 0.8, ease: 'power3.out' }),
        });
    });

    // 6. Magnetic Buttons Effect
    const magneticItems = document.querySelectorAll('.magnetic-item');
    magneticItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(item, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: 'power2.out' });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // 7. Card animations for Projects, Case Studies, and Certifications
    ['#case-studies', '#certifications', '#process', '#projects'].forEach(sectionId => {
        const items = sectionId === '#process' ? `${sectionId} .process-item` : `${sectionId} .interactive-card, ${sectionId} .project-card`;
        gsap.from(items, {
            scrollTrigger: {
                trigger: sectionId,
                start: 'top 80%',
                toggleActions: 'restart none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power3.out'
        });
    });

    // 8. Testimonial Carousel Logic
    const slides = gsap.utils.toArray('.testimonial-slide');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let currentIndex = 0;
    let autoPlayInterval;

    function updateSlidePositions(animated = true) {
        slides.forEach((slide, i) => {
            const offset = (i - currentIndex + slides.length) % slides.length;
            let xPercent, scale, opacity, zIndex, rotationY;

            if (offset === 0) { // Center slide
                xPercent = 0;
                scale = 1;
                opacity = 1;
                zIndex = 10;
                rotationY = 0;
            } else if (offset === 1) { // Right slide
                xPercent = 75; // FIXED: Pulled card inwards
                scale = 0.8;
                opacity = 0.5;
                zIndex = 5;
                rotationY = -45;
            } else if (offset === slides.length - 1) { // Left slide
                xPercent = -75; // FIXED: Pulled card inwards
                scale = 0.8;
                opacity = 0.5;
                zIndex = 5;
                rotationY = 45;
            } else { // Other slides (hidden)
                xPercent = offset > slides.length / 2 ? -200 : 200;
                scale = 0.7;
                opacity = 0;
                zIndex = 0;
                rotationY = offset > slides.length / 2 ? 90 : -90;
            }

            gsap.to(slide, {
                xPercent: xPercent,
                scale: scale,
                opacity: opacity,
                zIndex: zIndex,
                rotationY: rotationY,
                duration: animated ? 0.8 : 0,
                ease: 'power3.out'
            });
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlidePositions();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlidePositions();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    document.getElementById('testimonial-carousel-container').addEventListener('mouseenter', stopAutoPlay);
    document.getElementById('testimonial-carousel-container').addEventListener('mouseleave', startAutoPlay);

    updateSlidePositions(false); // Initial position without animation
    startAutoPlay(); // Start the auto-play

    // 9. Animations for Testimonials and Contact
    gsap.from('#testimonials > *', {
        scrollTrigger: { trigger: '#testimonials', start: 'top 80%', toggleActions: 'restart none none reverse' },
        y: 50, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out'
    });
    gsap.from('#contact .max-w-2xl > *', {
        scrollTrigger: { trigger: '#contact', start: 'top 80%', toggleActions: 'restart none none reverse' },
        y: 50, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out'
    });

    // 10. Infinite Auto-Scroll & Manual Drag for Projects
    const scrollers = document.querySelectorAll(".scroller");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
    }

    function addAnimation() {
        scrollers.forEach((scroller) => {
            scroller.setAttribute("data-animated", true);
            const scrollerInner = scroller.querySelector(".scroller__inner");
            const scrollerContent = Array.from(scrollerInner.children);

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicatedItem);
            });

            // Drag-to-scroll logic
            let isDown = false;
            let startX;
            let scrollLeft;

            scroller.addEventListener('mousedown', (e) => {
                isDown = true;
                scroller.style.cursor = 'grabbing';
                startX = e.pageX - scroller.offsetLeft;
                scrollLeft = scroller.scrollLeft;
            });
            scroller.addEventListener('mouseleave', () => {
                isDown = false;
                scroller.style.cursor = 'grab';
            });
            scroller.addEventListener('mouseup', () => {
                isDown = false;
                scroller.style.cursor = 'grab';
            });
            scroller.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - scroller.offsetLeft;
                const walk = (x - startX) * 2; // The multiplier makes scrolling faster
                scroller.scrollLeft = scrollLeft - walk;
            });
        });
    }

    function initInfiniteScroller() {
        const scroller = document.querySelector(".scroller__inner");
        if (scroller) {
            const scrollerContent = Array.from(scroller.children);
            scrollerContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scroller.appendChild(duplicatedItem);
            });
        }
    }

    // --- Sound Effects ---
    let isMuted = true;
    const muteButton = document.getElementById('mute-button');
    const muteIcon = document.getElementById('mute-icon');
    const synth = new Tone.FMSynth().toDestination();
    const ambientSynth = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, envelope: { attack: 5, decay: 0.1, sustain: 1, release: 5 }, volume: -25 }).toDestination();
    const ambientPattern = new Tone.Pattern((time, note) => { ambientSynth.triggerAttackRelease(note, "2n", time); }, ["C2", "G2", "Eb3"], "random").start(0);
    ambientPattern.interval = "2m";
    Tone.Transport.bpm.value = 60;

    const iconMuted = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>`;
    const iconUnmuted = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.586a2 2 0 01-2.828 0L2 14.828a2 2 0 010-2.828l1.172-1.172a2 2 0 012.828 0l.707.707a2 2 0 010 2.828l-1.172 1.172z"></path>`;

    const updateMuteIcon = () => { muteIcon.innerHTML = isMuted ? iconMuted : iconUnmuted; };
    updateMuteIcon();

    muteButton.addEventListener('click', async () => {
        if (Tone.context.state !== 'running') await Tone.start();
        isMuted = !isMuted;
        isMuted ? Tone.Transport.stop() : Tone.Transport.start();
        updateMuteIcon();
    });

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => { if (!isMuted) synth.triggerAttackRelease('C5', '8n'); });
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileNavLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('open')));

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        formStatus.textContent = 'Sending...';
        formStatus.style.color = 'var(--secondary-neon)';
        setTimeout(() => {
            formStatus.textContent = 'Message Sent! Thank you.';
            formStatus.style.color = 'var(--secondary-neon)';
            contactForm.reset();
            setTimeout(() => formStatus.textContent = '', 3000);
        }, 1500);
    });

    // --- Certificate Modal Logic ---
    const certModal = document.getElementById('cert-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');

    const openModal = (el) => {
        const imgSrc = el.closest('.card-content').querySelector('.cert-image').src;
        modalImage.src = imgSrc;
        certModal.classList.add('visible');
    }

    document.querySelectorAll('.cert-image, .cert-view-btn').forEach(el => {
        el.addEventListener('click', () => openModal(el));
    });

    closeModal.addEventListener('click', () => certModal.classList.remove('visible'));
    certModal.addEventListener('click', (e) => { if (e.target === certModal) certModal.classList.remove('visible'); });
});
