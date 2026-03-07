/* ============================================================
   Hariprasaath J — Portfolio Scripts
   Includes: intro shader, nav, scroll reveal, liquid crystal bg,
             hamburger menu, EmailJS contact form, footer clock
   ============================================================ */

// Intro helpers defined FIRST (before IIFE)
var _dismissed = false;

function dismissIntro() {
  if (_dismissed) return;
  _dismissed = true;
  if (window._shaderRaf) cancelAnimationFrame(window._shaderRaf);
  var el = document.getElementById("intro");
  if (el) {
    el.classList.add("hidden");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 950);
  }
}

function skipIntro() {
  dismissIntro();
}

// Shader
(function () {
  var canvas = document.getElementById("shader-canvas");
  if (!canvas || typeof THREE === "undefined") {
    dismissIntro();
    return;
  }

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var camera = new THREE.Camera();
  camera.position.z = 1;
  var scene = new THREE.Scene();

  var uniforms = {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
  };

  // Shader uses a helper function + explicit r/g/b channels to avoid
  // dynamic vec3 indexing (which causes the X4000 warning on some drivers)
  var frag = [
    "precision highp float;",
    "uniform vec2 resolution;",
    "uniform float time;",
    "float band(float fj, float t, vec2 uv){",
    "  float lw=0.002; float s=0.0;",
    "  s+=lw*0.0 /max(abs(fract(t-0.01*fj+0.00)*5.0-length(uv)+mod(uv.x+uv.y,0.2)),0.0001);",
    "  s+=lw*1.0 /max(abs(fract(t-0.01*fj+0.01)*5.0-length(uv)+mod(uv.x+uv.y,0.2)),0.0001);",
    "  s+=lw*4.0 /max(abs(fract(t-0.01*fj+0.02)*5.0-length(uv)+mod(uv.x+uv.y,0.2)),0.0001);",
    "  s+=lw*9.0 /max(abs(fract(t-0.01*fj+0.03)*5.0-length(uv)+mod(uv.x+uv.y,0.2)),0.0001);",
    "  s+=lw*16.0/max(abs(fract(t-0.01*fj+0.04)*5.0-length(uv)+mod(uv.x+uv.y,0.2)),0.0001);",
    "  return s;",
    "}",
    "void main(void){",
    "  vec2 uv=(gl_FragCoord.xy*2.0-resolution.xy)/min(resolution.x,resolution.y);",
    "  float t=time*0.05;",
    "  float r=band(0.0,t,uv);",
    "  float g=band(1.0,t,uv);",
    "  float b=band(2.0,t,uv);",
    "  vec3 col=vec3(r,g,b);",
    "  float lum=dot(col,vec3(0.299,0.587,0.114));",
    "  col=mix(col,vec3(lum),0.5)*0.45;",
    "  col.b*=1.3; col.r*=0.8;",
    "  gl_FragColor=vec4(col,1.0);",
    "}",
  ].join("\n");

  var mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: "void main(){gl_Position=vec4(position,1.0);}",
    fragmentShader: frag,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.set(
      renderer.domElement.width,
      renderer.domElement.height,
    );
  }
  resize();
  window.addEventListener("resize", resize);

  var rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    window._shaderRaf = rafId;
    uniforms.time.value += 0.05;
    renderer.render(scene, camera);
  }
  animate();
  setTimeout(dismissIntro, 4400);
})();

// Nav scroll
var nav = document.getElementById("mainnav");
window.addEventListener("scroll", function () {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

// Reveal
var revEls = document.querySelectorAll(".reveal");
var revObs = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        revObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
revEls.forEach(function (el) {
  revObs.observe(el);
});

// Tech bar animation
var tg = document.querySelector(".tech-grid");
if (tg) {
  new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".tc-fill").forEach(function (b) {
            b.classList.add("on");
          });
        }
      });
    },
    { threshold: 0.25 },
  ).observe(tg);
}

// ── EmailJS Config ────────────────────────────────────────
// STEP: Replace these 3 values after signing up at emailjs.com
var EMAILJS_SERVICE_ID = "service_ngknjxh"; // e.g. 'service_abc123'
var EMAILJS_TEMPLATE_ID = "template_g2uclgp"; // e.g. 'template_xyz789'
var EMAILJS_PUBLIC_KEY = "UYxMn0Q6guRlVHsqU"; // e.g. 'aBcDeFgHiJkLmNoP'

// Load EmailJS SDK dynamically
(function () {
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  s.onload = function () {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  };
  document.head.appendChild(s);
})();

function sendMsg() {
  var name = document.getElementById("f-name").value.trim();
  var email = document.getElementById("f-email").value.trim();
  var subject =
    document.getElementById("f-subject").value.trim() || "Portfolio Enquiry";
  var message = document.getElementById("f-message").value.trim();
  var btn = document.getElementById("f-btn");
  var status = document.getElementById("form-status");

  // Basic validation
  if (!name || !email || !message) {
    status.style.display = "block";
    status.style.background = "rgba(251,113,133,0.1)";
    status.style.border = "1px solid rgba(251,113,133,0.3)";
    status.style.color = "#fb7185";
    status.textContent = "✗  Please fill in Name, Email and Message.";
    return;
  }

  // Check if configured
  if (EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID") {
    status.style.display = "block";
    status.style.background = "rgba(167,139,250,0.1)";
    status.style.border = "1px solid rgba(167,139,250,0.3)";
    status.style.color = "var(--accent)";
    status.textContent =
      "⚙  EmailJS not configured yet. Follow the setup steps below.";
    return;
  }

  btn.textContent = "Sending…";
  btn.style.opacity = "0.6";
  btn.disabled = true;
  status.style.display = "none";

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      name: name,
      email: email,
      title: subject,
      message: message,
    })
    .then(
      function () {
        btn.textContent = "✓  Message Sent!";
        btn.style.background = "var(--green)";
        btn.style.color = "#0a0a0f";
        btn.style.opacity = "1";
        btn.disabled = false;
        status.style.display = "block";
        status.style.background = "rgba(52,211,153,0.08)";
        status.style.border = "1px solid rgba(52,211,153,0.25)";
        status.style.color = "var(--green)";
        status.textContent =
          "✓  Your message was sent successfully! Hariprasaath will get back to you soon.";
        // Clear fields
        ["f-name", "f-email", "f-subject", "f-message"].forEach(function (id) {
          document.getElementById(id).value = "";
        });
        setTimeout(function () {
          btn.textContent = "Send Message →";
          btn.style.background = "var(--text)";
          btn.style.color = "var(--bg)";
        }, 4000);
      },
      function (err) {
        btn.textContent = "Send Message →";
        btn.style.opacity = "1";
        btn.disabled = false;
        btn.style.background = "var(--text)";
        btn.style.color = "var(--bg)";
        status.style.display = "block";
        status.style.background = "rgba(251,113,133,0.1)";
        status.style.border = "1px solid rgba(251,113,133,0.3)";
        status.style.color = "#fb7185";
        status.textContent =
          "✗  Failed to send: " +
          (err.text || "Unknown error. Please email directly.");
      },
    );
}

// ── Footer clock ──────────────────────────────────────────
function tick() {
  var c = document.getElementById("ft-clock");
  if (c)
    c.textContent =
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " IST";
}
setInterval(tick, 1000);
tick();

// ── DOTTED SURFACE BACKGROUND (Three.js Wave Animation) ──────────────
(function () {
  var canvas = document.getElementById("lc-bg");
  if (!canvas || typeof THREE === "undefined") return;

  // Enhance canvas visibility for the particle effect
  canvas.style.opacity = "1";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "0";

  var SEPARATION = 150;
  var AMOUNTX = 40;
  var AMOUNTY = 60;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0a, 2000, 10000); // match dark bg

  var camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 355, 1220);

  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color, 0);

  var positions = [];
  var colors = [];
  var geometry = new THREE.BufferGeometry();

  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      var x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
      var y = 0;
      var z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

      positions.push(x, y, z);
      // Modern Neon Blue accent color (3B82F6 -> 59, 130, 246)
      colors.push(59 / 255, 130 / 255, 246 / 255);
    }
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  var material = new THREE.PointsMaterial({
    size: 5,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  var points = new THREE.Points(geometry, material);
  scene.add(points);

  var count = 0;
  var rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);

    var positionAttribute = geometry.attributes.position;
    var posArray = positionAttribute.array;

    var i = 0;
    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        var index = i * 3;
        // Animate Y position with sine waves
        posArray[index + 1] =
          Math.sin((ix + count) * 0.3) * 50 +
          Math.sin((iy + count) * 0.5) * 50;
        i++;
      }
    }

    positionAttribute.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.1;
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", resize);
  animate();
})();

/* ─────────────────────────── */

// ── PHOTO PANEL — all event listeners, no inline onclick ──

/* ─────────────────────────── */

// ── HAMBURGER MENU ──────────────────────────────────────────
var mobBtn = document.getElementById("mob-menu-btn");
var mobDrawer = document.getElementById("mob-drawer");

if (mobBtn && mobDrawer) {
  mobBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpen = mobDrawer.classList.toggle("open");
    mobBtn.classList.toggle("is-open", isOpen);
    mobBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  // Close on outside click
  document.addEventListener("click", function (e) {
    if (!mobBtn.contains(e.target) && !mobDrawer.contains(e.target)) {
      mobDrawer.classList.remove("open");
      mobBtn.classList.remove("is-open");
    }
  });
  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      mobDrawer.classList.remove("open");
      mobBtn.classList.remove("is-open");
    }
  });
}

function closeMobMenu() {
  if (mobDrawer) mobDrawer.classList.remove("open");
  if (mobBtn) mobBtn.classList.remove("is-open");
}



// ── SMOOTH SCROLL — easeInOutQuart, 700ms ───────────────────
function smoothScrollTo(targetEl) {
  if (!targetEl) return;

  const navH = 64;
  const start = window.scrollY;
  const end = targetEl.getBoundingClientRect().top + window.scrollY - navH;
  const dist = end - start;

  // Longer duration = smoother motion
  const duration = 1200;

  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateScroll(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const ease = easeInOutCubic(progress);

    window.scrollTo(0, start + dist * ease);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener("click", function(e) {

    const href = this.getAttribute("href");
    if (href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    closeMobMenu();

    setTimeout(function() {
      smoothScrollTo(target);
    }, 80);

  });
});
// ── FOOTER CLOCK ────────────────────────────────────────────
function tick() {
  var c = document.getElementById("ft-clock");
  if (c)
    c.textContent =
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " IST";
}
setInterval(tick, 1000);
tick();

// ── DOTTED SURFACE V2 (HERO) ────────────────────────────────
function createDottedSurface(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0); 
    container.appendChild(renderer.domElement);

    const positions = [];
    const colors = [];
    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            const y = 0;
            const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
            positions.push(x, y, z);
            colors.push(200 / 255, 200 / 255, 200 / 255); // Light grey/white color equivalent
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    function animate() {
        requestAnimationFrame(animate);
        const positionAttribute = geometry.attributes.position;
        const posArray = positionAttribute.array;
        
        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const index = i * 3;
                posArray[index + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
                i++;
            }
        }
        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
        count += 0.1;
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    });
}

document.addEventListener('DOMContentLoaded', () => {
   createDottedSurface('dotted-surface-container');
});
