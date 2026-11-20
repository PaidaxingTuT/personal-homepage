/* =========================================================
   1. WebGL 3D 流体 — 天蓝色液态玻璃 metaballs
   ========================================================= */
(() => {
  const canvas = document.getElementById('gl');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (!gl) { canvas.remove(); return; }

  const vert = `
    attribute vec2 aPos;
    void main(){ gl_Position = vec4(aPos, 0., 1.); }
  `;
  const frag = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uMouse;   // -1..1
    uniform float uScroll;  // 0..1 页面进度
    uniform float uVel;     // 滚动速度(平滑)

    float smin(float a, float b, float k){
      float h = clamp(.5 + .5*(b-a)/k, 0., 1.);
      return mix(b, a, h) - k*h*(1.-h);
    }

    float map(vec3 p){
      float t = uTime * .45;
      // 滚动让整团流体下潜/上浮 + 融合度变化(非线性形态)
      p.y += uScroll * 2.6 - .6;
      float k = .55 + uVel * 1.4 + sin(uScroll*6.283)*.12;

      vec3 c1 = vec3(sin(t)*1.05,        cos(t*.8)*.55,  sin(t*.5)*.45);
      vec3 c2 = vec3(cos(t*.7)*1.25,     sin(t*.6)*.75,  cos(t*.4)*.55);
      vec3 c3 = vec3(sin(t*.9+2.)*1.35,  cos(t*.5+1.)*.85, sin(t*.7+4.)*.6);
      vec3 c4 = vec3(cos(t*.55+3.)*.85,  sin(t*.75+2.)*.95, cos(t*.6+1.)*.5);

      float d = length(p - c1) - .68;
      d = smin(d, length(p - c2) - .5,  k);
      d = smin(d, length(p - c3) - .42, k);
      d = smin(d, length(p - c4) - .36, k);
      // 鼠标搅动的一颗
      vec3 m = vec3(uMouse * vec2(1.9, 1.1), .35);
      d = smin(d, length(p - m) - .42, .8);
      return d;
    }

    vec3 normalAt(vec3 p){
      vec2 e = vec2(.002, 0.);
      return normalize(vec3(
        map(p+e.xyy)-map(p-e.xyy),
        map(p+e.yxy)-map(p-e.yxy),
        map(p+e.yyx)-map(p-e.yyx)));
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy*2. - uRes) / uRes.y;
      vec3 ro = vec3(0., 0., 3.6);
      vec3 rd = normalize(vec3(uv, -2.1));

      float tt = 0.; float d;
      for(int i=0;i<64;i++){
        d = map(ro + rd*tt);
        if(d < .0015 || tt > 8.) break;
        tt += d * .9;
      }

      vec4 col = vec4(0.);
      if(tt < 8.){
        vec3 p = ro + rd*tt;
        vec3 n = normalAt(p);
        vec3 l = normalize(vec3(.6, .8, .5));
        float diff = max(dot(n, l), 0.);
        float fres = pow(1. - max(dot(n, -rd), 0.), 3.);
        float spec = pow(max(dot(reflect(-l, n), -rd), 0.), 72.);

        // 冷夜基底
        vec3 base = vec3(.025, .055, .14);
        vec3 c = base + diff * vec3(.06, .14, .31);

        // 假环境反射:天光/地面二分 → 液态水银质感
        vec3 r = reflect(rd, n);
        float band = smoothstep(-.35, .45, r.y);
        vec3 env = mix(vec3(.045, .15, .35), vec3(.71, .86, 1.00), band);
        c += env * .35;

        // 菲涅尔反光随滚动在冰蓝、天蓝和亮蓝之间变化。
        vec3 iridA = vec3(.72, .86, 1.00);
        vec3 iridM = vec3(.35, .69, 1.00);
        vec3 iridB = vec3(.16, .58, 1.00);
        float ph = .5 + .5*sin(n.y*4. + n.x*2. + uTime*.6 + uVel*1.5);
        ph = clamp(ph + (uScroll - .5)*.45, 0., 1.);
        vec3 irid = mix(mix(iridA, iridM, smoothstep(0., .55, ph)), iridB, smoothstep(.45, 1., ph));
        c += fres * irid * 1.0;

        // 冰白柔高光
        c += spec * vec3(.91, .96, 1.00);

        float a = .92 - smoothstep(5., 8., tt)*.5;
        col = vec4(c, a);
      }
      gl_FragColor = col;
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'),
        uScroll = U('uScroll'), uVel = U('uVel');

  const DPR = Math.min(devicePixelRatio || 1, 1.5) * 0.75; // 降采样保帧率
  function resize(){
    canvas.width  = innerWidth  * DPR;
    canvas.height = innerHeight * DPR;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', resize); resize();

  const state = { mx: 0, my: 0, tmx: 0, tmy: 0 };
  addEventListener('pointermove', e => {
    state.tmx = (e.clientX / innerWidth) * 2 - 1;
    state.tmy = -((e.clientY / innerHeight) * 2 - 1);
  });

  window.__fluid = { scroll: 0, vel: 0 }; // 由滚动系统写入

  function frame(t){
    state.mx += (state.tmx - state.mx) * .04; // 流体般的迟滞
    state.my += (state.tmy - state.my) * .04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t * .001);
    gl.uniform2f(uMouse, state.mx, state.my);
    gl.uniform1f(uScroll, window.__fluid.scroll);
    gl.uniform1f(uVel, Math.min(Math.abs(window.__fluid.vel) * .02, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* =========================================================
   2. 非线性惯性滚动 + 速度倾斜 + 星云交叉淡变
   ========================================================= */
const Scroll = (() => {
  const wrap = document.getElementById('scroll-wrap');
  const nebBlue = document.getElementById('nebBlue');
  const nebSky = document.getElementById('nebSky');
  let current = 0, target = 0, vel = 0, max = 0;
  const skewEls = [...document.querySelectorAll('[data-skew]')];

  function measure(){
    max = wrap.scrollHeight - innerHeight;
    document.body.style.height = wrap.scrollHeight + 'px';
  }
  addEventListener('resize', measure);
  // 字体加载后高度会变
  document.fonts?.ready.then(measure);
  measure(); setTimeout(measure, 600);

  addEventListener('scroll', () => { target = scrollY; }, { passive: true });

  function raf(){
    const prev = current;
    current += (target - current) * .085;         // 惯性
    if (Math.abs(target - current) < .05) current = target;
    vel += ((current - prev) - vel) * .12;        // 平滑速度
    wrap.style.transform = `translate3d(0, ${-current}px, 0)`;

    const skew = Math.max(-4, Math.min(4, vel * .12));
    for (const el of skewEls) el.style.transform = `skewY(${skew}deg)`;

    const p = max > 0 ? current / max : 0;
    window.__fluid.scroll = p;
    window.__fluid.vel = vel;
    nebBlue.style.opacity = (1 - p).toFixed(3);   // 顶部淡蓝
    nebSky.style.opacity = p.toFixed(3);          // 底部过渡到亮蓝
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return {
    to(y){ scrollTo({ top: y, behavior: 'auto' }); },
    get vel(){ return vel; }
  };
})();

/* 锚点导航 → 平滑目标 */
document.querySelectorAll('[data-nav]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id?.startsWith('#')) return;
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) Scroll.to(el.offsetTop - 40);
  });
});

/* 顶部导航：首屏保持轻量，越过首屏起点后收成悬浮玻璃胶囊。 */
(() => {
  const nav = document.querySelector('body > header .nav');
  if (!nav) return;
  let ticking = false;
  const update = () => {
    const docked = scrollY > 20;
    nav.classList.toggle('is-docked', docked);
    ticking = false;
  };
  update();
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive:true });
})();

/* 导航状态只在对应区块进入当前视窗时高亮。 */
const navLinks = [...document.querySelectorAll('.nav-links [data-nav]')];
const navSections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let activeNavLink = null;

/* 液态选中指示器:单个 3D 气泡平滑滑向当前项,移动时像液滴般轻微拉伸 */
const navBubble = (() => {
  const el = document.querySelector('.nav-links .nav-bubble');
  const cur = { x: 0, w: 0 };
  let box = null, pop = 0, targetPop = 0;

  function measure(){
    if (!activeNavLink) return;
    box = {
      x: activeNavLink.offsetLeft, y: activeNavLink.offsetTop,
      w: activeNavLink.offsetWidth, h: activeNavLink.offsetHeight
    };
  }
  addEventListener('resize', measure);
  document.fonts?.ready.then(measure);

  function raf(){
    if (box){
      const vx = (box.x - cur.x) * .14;
      cur.x += vx;
      cur.w += (box.w - cur.w) * .14;
      pop += (targetPop - pop) * .12;
      // 速度越快拉得越长压得越扁 — 被拖动的液滴
      const sx = 1 + Math.min(Math.abs(vx) * .006, .12);
      const sy = 1 - Math.min(Math.abs(vx) * .003, .08);
      el.style.width = cur.w + 'px';
      el.style.height = box.h + 'px';
      el.style.transform = `translate3d(${cur.x}px,${box.y}px,0) scale(${pop}) scaleX(${sx}) scaleY(${sy})`;
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return {
    to(){
      measure();
      if (!box) return;
      if (pop < .05){ cur.x = box.x; cur.w = box.w; } // 隐藏状态:在原地如气泡冒出
      targetPop = 1;
    },
    hide(){ targetPop = 0; } // 回到首页:气泡缩回消失
  };
})();

function setActiveNav(nextLink) {
  if (nextLink === activeNavLink) return;
  activeNavLink?.classList.remove('acc');
  activeNavLink = nextLink || null;
  if (nextLink){
    nextLink.classList.add('acc');
    navBubble.to();
  } else {
    navBubble.hide();
  }
}
/* entries 只含跨越阈值的区块 — 若直接在其中选最大者,交界处两区块交替触发会来回横跳。
   改为维护全部区块的可见高度快照,每次从全局快照中选可见面积最大者,交界处只切换一次。 */
const heroSection = document.querySelector('.hero');
const navVisible = new Map();
const navObserver = new IntersectionObserver(entries => {
  for (const en of entries) navVisible.set(en.target, en.isIntersecting ? en.intersectionRect.height : 0);
  let best = null, bestH = 0;
  for (const [el, h] of navVisible) {
    if (h > bestH) { bestH = h; best = el; }
  }
  if (!best) return;
  if (best === heroSection) { setActiveNav(null); return; }
  setActiveNav(navLinks.find(link => link.getAttribute('href') === `#${best.id}`));
}, { threshold: Array.from({ length: 11 }, (_, i) => i / 10) });
[heroSection, ...navSections].forEach(section => navObserver.observe(section));

/* =========================================================
   3. 字符拆分 + 错落揭示
   ========================================================= */
document.querySelectorAll('[data-chars]').forEach(el => {
  const delay = +el.dataset.delay || 0;
  const chars = [...el.textContent];
  el.textContent = '';
  chars.forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? ' ' : ch;
    s.style.transition = `transform 1.1s cubic-bezier(.16,1,.3,1) ${delay + i * 38}ms`;
    el.appendChild(s);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => el.closest('.row, [data-reveal]')?.classList.add('revealed')));
});

/* 滚动进入揭示(容器内 fade-el 逐个错落) */
document.querySelectorAll('[data-reveal]').forEach(el => {
  el.querySelectorAll('.fade-el').forEach((f, i) => {
    f.style.transitionDelay = `${i * 90}ms`;
  });
  const line = el.querySelector('.reveal-line > span');
  if (line) line.style.transition = 'transform 1.2s cubic-bezier(.16,1,.3,1) .05s';
});
const io = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
  }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

/* =========================================================
   4. 速度驱动的铬光扫字(signature)
   ========================================================= */
(() => {
  const els = [...document.querySelectorAll('.js-chrome')];
  if (!els.length) return;
  let t = 0;
  function raf(){
    // 静止时 ~8s 极缓往复;滚得越快铬光扫得越快
    t += .013 + Math.min(Math.abs(window.__fluid?.vel || 0) * .012, .14);
    const pos = (Math.sin(t) * .5 + .5) * 100;
    for (const el of els) el.style.backgroundPosition = pos + '% 0';
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* =========================================================
   5. 跑马灯:速度感应
   ========================================================= */
(() => {
  const track = document.getElementById('marquee');
  let x = 0;
  function raf(){
    x -= 1 + Math.min(Math.abs(Scroll.vel) * .25, 9); // 滚得越快跑得越快
    const w = track.scrollWidth / 3;
    if (-x >= w) x += w;
    track.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* =========================================================
   6. 自定义光标 + 磁吸
   ========================================================= */
(() => {
  const dot = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (matchMedia('(hover:none)').matches) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  function raf(){
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  document.querySelectorAll('a, button, .stack-row').forEach(el => {
    el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
  });
  // 磁吸按钮
  document.querySelectorAll('[data-magnet]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width/2);
      const dy = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${dx*.25}px,${dy*.35}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.style.transform = '';
      setTimeout(() => el.style.transition = '', 600);
    });
  });
})();

/* =========================================================
   7. 作品卡 3D 倾斜
   ========================================================= */
document.querySelectorAll('[data-tilt]').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    const base = el.matches(':nth-child(2)') && innerWidth > 880 ? 'translateY(9vh) ' : '';
    el.style.transform = `${base}perspective(900px) rotateY(${px*7}deg) rotateX(${-py*7}deg)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

function copyQQ() {
  const qqNumber = '428488368';
  navigator.clipboard?.writeText(qqNumber).catch(() => {
    const input = document.createElement('input');
    input.value = qqNumber;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  });
}

(() => {
  const trigger = document.getElementById('logTrigger');
  const modal = document.getElementById('logModal');
  const logBody = document.getElementById('logBody');
  if (!trigger || !modal || !logBody) return;

  /* 自绘滚动条:按滚动进度同步深蓝细条的位置与长度,支持拖拽 */
  const bar = document.getElementById('logScrollbar');
  const syncBar = () => {
    if (!bar) return;
    const sh = logBody.scrollHeight, ch = logBody.clientHeight;
    if (sh <= ch + 1) { bar.style.display = 'none'; return; }
    const h = Math.max(ch * ch / sh, 28);
    const y = logBody.offsetTop + (logBody.scrollTop / (sh - ch)) * (ch - h);
    bar.style.display = 'block';
    bar.style.height = h + 'px';
    bar.style.transform = `translateY(${y}px)`;
  };
  logBody.addEventListener('scroll', syncBar);
  if (bar) {
    let dragFrom = null;
    bar.addEventListener('pointerdown', e => {
      const sh = logBody.scrollHeight, ch = logBody.clientHeight;
      dragFrom = { y: e.clientY, top: logBody.scrollTop, ratio: (sh - ch) / (ch - Math.max(ch * ch / sh, 28)) };
      bar.classList.add('is-dragging');
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    bar.addEventListener('pointermove', e => {
      if (dragFrom) logBody.scrollTop = dragFrom.top + (e.clientY - dragFrom.y) * dragFrom.ratio;
    });
    const endDrag = () => { dragFrom = null; bar.classList.remove('is-dragging'); };
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);
  }

  let loaded = false;
  let previousFocus = null;
  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('log-open');
    previousFocus?.focus();
  };
  const open = async () => {
    previousFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('log-open');
    logBody.focus();
    requestAnimationFrame(syncBar);
    if (loaded) return;
    try {
      const response = await fetch('log.md?v=teal-1');
      if (!response.ok) throw new Error('Log file unavailable');
      const markdown = await response.text();
      logBody.innerHTML = window.marked ? window.marked.parse(markdown) : markdown;
      loaded = true;
      requestAnimationFrame(syncBar);
    } catch {
      logBody.textContent = '日志暂时无法读取。';
    }
  };

  trigger.addEventListener('click', open);
  modal.querySelectorAll('[data-log-close]').forEach(element => element.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
  modal.addEventListener('wheel', event => {
    if (!logBody.contains(event.target)) event.preventDefault();
  }, { passive: false });
})();

/* 右下角时钟 */
setInterval(() => {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('zh-CN', { hour12: false });
}, 1000);
