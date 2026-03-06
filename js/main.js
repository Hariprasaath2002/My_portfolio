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

// ── LIQUID CRYSTAL BACKGROUND SHADER (WebGL2, blue palette) ──────────────
(function () {
  var canvas = document.getElementById("lc-bg");
  if (!canvas) return;

  var gl = canvas.getContext("webgl2");
  if (!gl) return;

  var vsSrc =
    "#version 300 es\nprecision highp float;\nin vec2 position;\nvoid main(){gl_Position=vec4(position,0.0,1.0);}";

  var fsSrc = [
    "#version 300 es",
    "precision highp float;",
    "uniform float u_time;",
    "uniform vec2 u_resolution;",
    "uniform float u_speed;",
    "uniform vec3 u_radii;",
    "uniform vec2 u_smoothK;",
    "out vec4 fragColor;",
    "",
    "float sdCircle(vec2 p, float r){ return length(p)-r; }",
    "",
    "float opSU(float d1, float d2, float k){",
    "  float h=clamp(0.5+0.5*(d2-d1)/k,0.0,1.0);",
    "  return mix(d2,d1,h)-k*h*(1.0-h);",
    "}",
    "",
    "float scene(vec2 uv){",
    "  float t=u_time*u_speed;",
    "  vec2 p1=vec2(cos(t*0.5),sin(t*0.5))*0.3;",
    "  vec2 p2=vec2(cos(t*0.7+2.1),sin(t*0.6+2.1))*0.4;",
    "  vec2 p3=vec2(cos(t*0.4+4.2),sin(t*0.8+4.2))*0.35;",
    "  float b1=sdCircle(uv-p1,u_radii.x);",
    "  float b2=sdCircle(uv-p2,u_radii.y);",
    "  float b3=sdCircle(uv-p3,u_radii.z);",
    "  return opSU(opSU(b1,b2,u_smoothK.x),b3,u_smoothK.y);",
    "}",
    "",
    "void main(){",
    "  vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)*2.0/u_resolution.y;",
    "  float d=scene(uv);",
    "  float rim=0.008/max(abs(d),0.001);",
    "  // Blue-cyan palette instead of violet",
    "  vec3 pha=0.5+0.5*cos(u_time*0.3+uv.xyx+vec3(1.8,2.4,3.0));",
    "  vec3 col=clamp(vec3(rim)*pha,0.0,1.0);",
    "  // Tint toward blue-cyan: suppress red, boost blue",
    "  col.r *= 0.3;",
    "  col.g *= 0.7;",
    "  col.b *= 1.2;",
    "  fragColor=vec4(col,1.0);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vsSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(prog));
    return;
  }

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
    gl.STATIC_DRAW,
  );
  var pos = gl.getAttribLocation(prog, "position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "u_resolution");
  var uTime = gl.getUniformLocation(prog, "u_time");
  var uSpd = gl.getUniformLocation(prog, "u_speed");
  var uRad = gl.getUniformLocation(prog, "u_radii");
  var uK = gl.getUniformLocation(prog, "u_smoothK");

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }
  resize();
  window.addEventListener("resize", resize);

  function draw(t) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform1f(uSpd, 0.55);
    gl.uniform3fv(uRad, [0.25, 0.18, 0.3]);
    gl.uniform2fv(uK, [0.2, 0.3]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
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
