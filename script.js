/* ========== PRELOADER ========== */
window.addEventListener("load", () => {
    setTimeout(() => {
        const p = document.getElementById("preloader");
        p.classList.add("fade-out");
        setTimeout(() => {
            p.style.display = "none";
            // Trigger hero animations after preloader fades
            triggerHeroAnimations();
        }, 600);
    }, 800);
});

/* ========== HERO ON-LOAD ANIMATION SEQUENCE ========== */
function triggerHeroAnimations() {
    const heroAnims = document.querySelectorAll(".hero-anim");
    heroAnims.forEach((el) => {
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => {
            el.classList.add("is-visible");
        }, delay);
    });
}

/* ========== THREE.JS HERO CANVAS — ETHEREAL PARTICLES ========== */
(function initThreeJS() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.z = 35;

    // Ethereal particle system — slow, dreamy, AI + dental neural network
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = [];
    const phases = []; // for gentle sine-wave floating

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 70;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 35;

        // Light gray/white particles — visible on dark backgrounds
        const isAccent = Math.random() > 1;
        if (isAccent) {
            colors[i * 3] = 0.9 + Math.random() * 0.1;
            colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
            colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
        } else {
            const gray = 0.6 + Math.random() * 0.3;
            colors[i * 3] = gray;
            colors[i * 3 + 1] = gray;
            colors[i * 3 + 2] = gray + Math.random() * 0.05;
        }

        sizes[i] = 0.08 + Math.random() * 0.12;

        velocities.push({
            x: (Math.random() - 0.5) * 0.008,
            y: (Math.random() - 0.5) * 0.008,
            z: (Math.random() - 0.5) * 0.004,
        });
        phases.push(Math.random() * Math.PI * 2);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
    );
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Subtle connection lines
    const lineMat = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.1,
    });
    let lineGeo = new THREE.BufferGeometry();
    const lineGroup = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineGroup);

    // Mouse tracking for parallax
    let mouseX = 0,
        mouseY = 0,
        targetMouseX = 0,
        targetMouseY = 0;

    document.addEventListener("mousemove", (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Fade in canvas
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 2s ease";
    setTimeout(() => {
        canvas.style.opacity = "1";
    }, 300);

    let time = 0;
    const connectionDistance = 5.5;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.003;

        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            // Base velocity + gentle sine-wave floating
            pos[i * 3] += velocities[i].x + Math.sin(time + phases[i]) * 0.003;
            pos[i * 3 + 1] +=
                velocities[i].y + Math.cos(time * 0.7 + phases[i]) * 0.003;
            pos[i * 3 + 2] += velocities[i].z;

            // Soft boundary bounce
            if (Math.abs(pos[i * 3]) > 35) velocities[i].x *= -1;
            if (Math.abs(pos[i * 3 + 1]) > 25) velocities[i].y *= -1;
            if (Math.abs(pos[i * 3 + 2]) > 18) velocities[i].z *= -1;
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Update connection lines (only check ~60 nearest for performance)
        const linePositions = [];
        const checkLimit = Math.min(particleCount, 80);
        for (let i = 0; i < checkLimit; i++) {
            for (let j = i + 1; j < checkLimit; j++) {
                const dx = pos[i * 3] - pos[j * 3];
                const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < connectionDistance) {
                    linePositions.push(
                        pos[i * 3],
                        pos[i * 3 + 1],
                        pos[i * 3 + 2],
                    );
                    linePositions.push(
                        pos[j * 3],
                        pos[j * 3 + 1],
                        pos[j * 3 + 2],
                    );
                }
            }
        }
        lineGroup.geometry.dispose();
        const newLineGeo = new THREE.BufferGeometry();
        newLineGeo.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(linePositions, 3),
        );
        lineGroup.geometry = newLineGeo;

        // Smooth mouse-follow camera parallax
        mouseX += (targetMouseX - mouseX) * 0.015;
        mouseY += (targetMouseY - mouseY) * 0.015;

        camera.position.x = mouseX * 2.5;
        camera.position.y = -mouseY * 1.8;
        camera.lookAt(scene.position);

        // Very slow rotation for ethereal feel
        particles.rotation.y += 0.00015;
        particles.rotation.x = Math.sin(time * 0.3) * 0.02;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

/* ========== HERO PARALLAX ON MOUSE MOVE ========== */
(function initHeroParallax() {
    const heroContent = document.getElementById("hero-content");
    if (!heroContent) return;

    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        heroContent.style.transform = `translate(${x * -6}px, ${y * -4}px)`;
    });
})();

/* ========== NAVBAR SCROLL ========== */
const navbar = document.getElementById("navbar");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-menu a:not(.nav-cta)");

window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle("scrolled", scrollY > 80);

    // Active nav highlight
    sections.forEach((sec) => {
        const top = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        const id = sec.getAttribute("id");
        if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach((l) => l.classList.remove("active"));
            const active = document.querySelector(`.nav-menu a[href="#${id}"]`);
            if (active) active.classList.add("active");
        }
    });

    // Scroll progress bar
    const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / docHeight) * 100;
    document.getElementById("scroll-progress").style.width = progress + "%";

    // Back to top visibility
    document
        .getElementById("back-to-top")
        .classList.toggle("visible", scrollY > 500);
});

/* ========== HAMBURGER ========== */
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("open");
});
navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("open");
    });
});

/* ========== SCROLL REVEAL (IntersectionObserver) ========== */
const revealEls = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale",
);
const revealObs = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
);
revealEls.forEach((el) => revealObs.observe(el));

/* ========== MODAL ========== */
function openModal(id) {
    document.getElementById(id).classList.add("active");
    document.body.style.overflow = "hidden";
}
function closeModal(id) {
    document.getElementById(id).classList.remove("active");
    document.body.style.overflow = "";
}
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
});

/* ========== BACK TO TOP ========== */
document.getElementById("back-to-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ========== SMOOTH ANCHOR LINKS ========== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
    });
});

/* ==========================================================================
   ABOUT SECTION — THREE.JS INTERACTIVE BACKGROUND + ANIMATIONS
   ==========================================================================
   • Floating glowing nodes with neural-network connection lines
   • Parallax-reactive on mouse move (scoped to about-section)
   • Only renders when the about section is in the viewport (perf)
   • IntersectionObserver entrance animations for header / text / cards
   • 3D card tilt on mouse hover with dynamic glow position
   ========================================================================== */

(function initAboutSection() {
    /* ------------------------------------------------------------------ */
    /*  1.  THREE.JS — FLOATING NEURAL NETWORK NODES                      */
    /* ------------------------------------------------------------------ */
    const aboutSection = document.getElementById("about");
    const canvas = document.getElementById("about-canvas");
    if (!canvas || !aboutSection) return;

    /* Renderer — scoped to the about section dimensions */
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
    });
    function setSize() {
        const rect = aboutSection.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        return rect;
    }
    let sectionRect = setSize();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        50,
        sectionRect.width / sectionRect.height,
        0.1,
        500,
    );
    camera.position.z = 40;

    /* ---- Particle (node) system ---- */
    const nodeCount = 220;
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);
    const velocities = [];
    const phases = [];

    for (let i = 0; i < nodeCount; i++) {
        /* Spread nodes across the visible area */
        positions[i * 3] = (Math.random() - 0.5) * 80; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

        /* Colour palette: mix of soft orange, white, and light blue tones */
        const pick = Math.random();
        if (pick < 0.3) {
            /* Accent orange nodes */
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.0;
        } else if (pick < 0.55) {
            /* White nodes */
            const w = 0.85 + Math.random() * 0.15;
            colors[i * 3] = w;
            colors[i * 3 + 1] = w;
            colors[i * 3 + 2] = w;
        } else {
            /* Soft blue/purple tones */
            colors[i * 3] = 0.35 + Math.random() * 0.15;
            colors[i * 3 + 1] = 0.4 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
        }

        velocities.push({
            x: (Math.random() - 0.5) * 0.012,
            y: (Math.random() - 0.5) * 0.012,
            z: (Math.random() - 0.5) * 0.005,
        });
        phases.push(Math.random() * Math.PI * 2);
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const nodeMat = new THREE.PointsMaterial({
        size: 0.45,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodes);

    /* ---- Connection lines (neural-network look) ---- */
    const lineMat = new THREE.LineBasicMaterial({
        color: 0xff9944,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
    });
    let lineGroup = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat);
    scene.add(lineGroup);

    /* ---- Mouse tracking (scoped to section) ---- */
    let aboutMouseX = 0,
        aboutMouseY = 0,
        targetAboutMouseX = 0,
        targetAboutMouseY = 0;

    aboutSection.addEventListener("mousemove", (e) => {
        const rect = aboutSection.getBoundingClientRect();
        targetAboutMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetAboutMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    /* ---- Visibility flag — only render when in viewport ---- */
    let aboutInView = false;
    const aboutVisObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                aboutInView = entry.isIntersecting;
                if (aboutInView) canvas.classList.add("visible");
            });
        },
        { threshold: 0.05 },
    );
    aboutVisObs.observe(aboutSection);

    /* ---- Animation loop ---- */
    let t = 0;
    const connDist = 8;

    function animateAbout() {
        requestAnimationFrame(animateAbout);
        if (!aboutInView) return; // pause when off-screen
        t += 0.0025;

        const pos = nodeGeo.attributes.position.array;
        for (let i = 0; i < nodeCount; i++) {
            pos[i * 3] += velocities[i].x + Math.sin(t + phases[i]) * 0.004;
            pos[i * 3 + 1] +=
                velocities[i].y + Math.cos(t * 0.8 + phases[i]) * 0.004;
            pos[i * 3 + 2] += velocities[i].z;

            /* Soft boundary wrap */
            if (Math.abs(pos[i * 3]) > 40) velocities[i].x *= -1;
            if (Math.abs(pos[i * 3 + 1]) > 25) velocities[i].y *= -1;
            if (Math.abs(pos[i * 3 + 2]) > 10) velocities[i].z *= -1;
        }
        nodeGeo.attributes.position.needsUpdate = true;

        /* Build connection lines (check subset for perf) */
        const linePos = [];
        const checkMax = Math.min(nodeCount, 100);
        for (let i = 0; i < checkMax; i++) {
            for (let j = i + 1; j < checkMax; j++) {
                const dx = pos[i * 3] - pos[j * 3];
                const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d < connDist) {
                    linePos.push(
                        pos[i * 3],
                        pos[i * 3 + 1],
                        pos[i * 3 + 2],
                        pos[j * 3],
                        pos[j * 3 + 1],
                        pos[j * 3 + 2],
                    );
                }
            }
        }
        lineGroup.geometry.dispose();
        const newGeo = new THREE.BufferGeometry();
        newGeo.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(linePos, 3),
        );
        lineGroup.geometry = newGeo;

        /* Smooth mouse parallax */
        aboutMouseX += (targetAboutMouseX - aboutMouseX) * 0.02;
        aboutMouseY += (targetAboutMouseY - aboutMouseY) * 0.02;
        camera.position.x = aboutMouseX * 3;
        camera.position.y = -aboutMouseY * 2;
        camera.lookAt(scene.position);

        /* Gentle rotation */
        nodes.rotation.y += 0.0002;
        nodes.rotation.x = Math.sin(t * 0.35) * 0.018;

        renderer.render(scene, camera);
    }
    animateAbout();

    /* Handle resize */
    window.addEventListener("resize", () => {
        sectionRect = setSize();
        camera.aspect = sectionRect.width / sectionRect.height;
        camera.updateProjectionMatrix();
    });

    /* ------------------------------------------------------------------ */
    /*  2.  ENTRANCE ANIMATIONS  (IntersectionObserver)                    */
    /* ------------------------------------------------------------------ */
    const aboutAnims = document.querySelectorAll(".about-anim");
    const aboutAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    aboutAnimObs.unobserve(el); // fire once
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    aboutAnims.forEach((el) => aboutAnimObs.observe(el));

    /* Also stagger the header (badge + title + line) */
    const aboutHeader = document.getElementById("about-header");
    if (aboutHeader) {
        const hdrObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        aboutHeader.style.transition =
                            "opacity 0.9s var(--ease-premium), transform 0.9s var(--ease-premium)";
                        aboutHeader.style.opacity = "0";
                        aboutHeader.style.transform = "translateY(25px)";
                        requestAnimationFrame(() => {
                            aboutHeader.style.opacity = "1";
                            aboutHeader.style.transform = "translateY(0)";
                        });
                        hdrObs.unobserve(aboutHeader);
                    }
                });
            },
            { threshold: 0.3 },
        );
        hdrObs.observe(aboutHeader);
    }

    /* ------------------------------------------------------------------ */
    /*  3.  3D CARD TILT + GLOW FOLLOW  (vanilla JS)                      */
    /* ------------------------------------------------------------------ */
    const tiltCards = document.querySelectorAll("[data-tilt]");
    tiltCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            /* Tilt angles (max ±8°) */
            const rotateY = ((x - centerX) / centerX) * 8;
            const rotateX = ((centerY - y) / centerY) * 6;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;

            /* Move glow radial gradient to cursor position */
            const glow = card.querySelector(".about-card-glow");
            if (glow) {
                const percX = ((x / rect.width) * 100).toFixed(1);
                const percY = ((y / rect.height) * 100).toFixed(1);
                glow.style.setProperty("--glow-x", percX + "%");
                glow.style.setProperty("--glow-y", percY + "%");
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
})();

/* ==========================================================================
   SPEAKER SECTION — ENTRANCE ANIMATIONS + CARD TILT + GLOW
   ========================================================================== */

(function initSpeakerSection() {
    /* 1. ENTRANCE ANIMATIONS (IntersectionObserver) */
    const speakerAnims = document.querySelectorAll(".speaker-anim");
    const speakerAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    speakerAnimObs.unobserve(el);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    speakerAnims.forEach((el) => speakerAnimObs.observe(el));

    /* Stagger the header */
    const speakerHeader = document.getElementById("speaker-header");
    if (speakerHeader) {
        const hdrObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        speakerHeader.style.transition =
                            "opacity 0.9s var(--ease-premium), transform 0.9s var(--ease-premium)";
                        speakerHeader.style.opacity = "0";
                        speakerHeader.style.transform = "translateY(25px)";
                        requestAnimationFrame(() => {
                            speakerHeader.style.opacity = "1";
                            speakerHeader.style.transform = "translateY(0)";
                        });
                        hdrObs.unobserve(speakerHeader);
                    }
                });
            },
            { threshold: 0.3 },
        );
        hdrObs.observe(speakerHeader);
    }

    /* 2. 3D CARD TILT + GLOW FOLLOW */
    const speakerCards = document.querySelectorAll("[data-tilt-speaker]");
    speakerCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 6;
            const rotateX = ((centerY - y) / centerY) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.01)`;

            const glow = card.querySelector(".speaker-card-glow");
            if (glow) {
                const percX = ((x / rect.width) * 100).toFixed(1);
                const percY = ((y / rect.height) * 100).toFixed(1);
                glow.style.setProperty("--glow-x", percX + "%");
                glow.style.setProperty("--glow-y", percY + "%");
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
})();

/* ==========================================================================
   WHY ATTEND SECTION — ENTRANCE ANIMATIONS + CARD TILT + GLOW
   ========================================================================== */

(function initWhySection() {
    /* 1. ENTRANCE ANIMATIONS (IntersectionObserver) */
    const whyAnims = document.querySelectorAll(".why-anim");
    const whyAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    whyAnimObs.unobserve(el);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    whyAnims.forEach((el) => whyAnimObs.observe(el));

    /* Stagger the header */
    const whyHeader = document.getElementById("why-header");
    if (whyHeader) {
        const hdrObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        whyHeader.style.transition =
                            "opacity 0.9s var(--ease-premium), transform 0.9s var(--ease-premium)";
                        whyHeader.style.opacity = "0";
                        whyHeader.style.transform = "translateY(25px)";
                        requestAnimationFrame(() => {
                            whyHeader.style.opacity = "1";
                            whyHeader.style.transform = "translateY(0)";
                        });
                        hdrObs.unobserve(whyHeader);
                    }
                });
            },
            { threshold: 0.3 },
        );
        hdrObs.observe(whyHeader);
    }

    /* 2. 3D CARD TILT + GLOW FOLLOW */
    const whyCards = document.querySelectorAll("[data-tilt-why]");
    whyCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 5;
            const rotateX = ((centerY - y) / centerY) * 5;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;

            const glow = card.querySelector(".why-card-glow");
            if (glow) {
                const percX = ((x / rect.width) * 100).toFixed(1);
                const percY = ((y / rect.height) * 100).toFixed(1);
                glow.style.setProperty("--glow-x", percX + "%");
                glow.style.setProperty("--glow-y", percY + "%");
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
})();

/* ==========================================================================
   REGISTRATION SECTION — ENTRANCE ANIMATIONS
   ========================================================================== */

(function initRegSection() {
    const regAnims = document.querySelectorAll(".reg-anim");
    const regAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    regAnimObs.unobserve(el);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    regAnims.forEach((el) => regAnimObs.observe(el));

    /* Header entrance */
    const regHeader = document.getElementById("reg-header");
    if (regHeader) {
        const hdrObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        regHeader.style.transition =
                            "opacity 0.9s var(--ease-premium), transform 0.9s var(--ease-premium)";
                        regHeader.style.opacity = "0";
                        regHeader.style.transform = "translateY(25px)";
                        requestAnimationFrame(() => {
                            regHeader.style.opacity = "1";
                            regHeader.style.transform = "translateY(0)";
                        });
                        hdrObs.unobserve(regHeader);
                    }
                });
            },
            { threshold: 0.3 },
        );
        hdrObs.observe(regHeader);
    }
})();

/* ==========================================================================
   CALL FOR ABSTRACTS SECTION — ENTRANCE ANIMATIONS + CARD TILT + GLOW
   ========================================================================== */

(function initCfaSection() {
    /* 1. ENTRANCE ANIMATIONS (IntersectionObserver) */
    const cfaAnims = document.querySelectorAll(".cfa-anim");
    const cfaAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    cfaAnimObs.unobserve(el);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    cfaAnims.forEach((el) => cfaAnimObs.observe(el));

    /* Stagger the header */
    const cfaHeader = document.getElementById("cfa-header");
    if (cfaHeader) {
        const hdrObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        cfaHeader.style.transition =
                            "opacity 0.9s var(--ease-premium), transform 0.9s var(--ease-premium)";
                        cfaHeader.style.opacity = "0";
                        cfaHeader.style.transform = "translateY(25px)";
                        requestAnimationFrame(() => {
                            cfaHeader.style.opacity = "1";
                            cfaHeader.style.transform = "translateY(0)";
                        });
                        hdrObs.unobserve(cfaHeader);
                    }
                });
            },
            { threshold: 0.3 },
        );
        hdrObs.observe(cfaHeader);
    }

    /* 2. 3D CARD TILT + GLOW FOLLOW */
    const cfaCards = document.querySelectorAll("[data-tilt-cfa]");
    cfaCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 5;
            const rotateX = ((centerY - y) / centerY) * 5;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;

            const glow = card.querySelector(".cfa-card-glow");
            if (glow) {
                const percX = ((x / rect.width) * 100).toFixed(1);
                const percY = ((y / rect.height) * 100).toFixed(1);
                glow.style.setProperty("--glow-x", percX + "%");
                glow.style.setProperty("--glow-y", percY + "%");
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
})();

/* ==========================================================================
   VENUE SECTION — ENTRANCE ANIMATIONS
   ========================================================================== */
(function initVenueSection() {
    const venueAnims = document.querySelectorAll(".venue-anim");
    const venueAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    venueAnimObs.unobserve(el);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    venueAnims.forEach((el) => venueAnimObs.observe(el));
})();

/* ==========================================================================
   COMMITTEE SECTION — ENTRANCE ANIMATIONS + 3D CARD TILT + GLOW
   ========================================================================== */

(function initCommitteeSection() {
    /* 1. ENTRANCE ANIMATIONS (IntersectionObserver) */
    const commAnims = document.querySelectorAll(".comm-anim");
    const commAnimObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay || 0) * 1000;
                    setTimeout(() => el.classList.add("is-visible"), delay);
                    commAnimObs.unobserve(el);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    commAnims.forEach((el) => commAnimObs.observe(el));

    /* Stagger the header */
    const commHeader = document.getElementById("comm-header");
    if (commHeader) {
        const hdrObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        commHeader.style.transition =
                            "opacity 0.9s var(--ease-premium), transform 0.9s var(--ease-premium)";
                        commHeader.style.opacity = "0";
                        commHeader.style.transform = "translateY(25px)";
                        requestAnimationFrame(() => {
                            commHeader.style.opacity = "1";
                            commHeader.style.transform = "translateY(0)";
                        });
                        hdrObs.unobserve(commHeader);
                    }
                });
            },
            { threshold: 0.3 },
        );
        hdrObs.observe(commHeader);
    }

    /* 2. 3D CARD TILT + GLOW FOLLOW */
    const commCards = document.querySelectorAll("[data-tilt-comm]");
    commCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 6;
            const rotateX = ((centerY - y) / centerY) * 5;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;

            const glow = card.querySelector(".comm-card-glow");
            if (glow) {
                const percX = ((x / rect.width) * 100).toFixed(1);
                const percY = ((y / rect.height) * 100).toFixed(1);
                glow.style.setProperty("--glow-x", percX + "%");
                glow.style.setProperty("--glow-y", percY + "%");
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
})();
