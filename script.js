const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) document.querySelectorAll('details').forEach((other) => { if (other !== item) other.open = false; });
  });
});

window.addEventListener('load', () => {
  const screen = document.querySelector('.loading-screen');
  const number = screen?.querySelector('span');
  if (!screen) return;
  let count = 0;
  const timer = window.setInterval(() => {
    count = Math.min(count + 8, 100);
    number.textContent = count;
    if (count === 100) { window.clearInterval(timer); window.setTimeout(() => screen.classList.add('is-loaded'), 180); }
  }, 35);
});

if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mouseX = -50, mouseY = -50, ringX = -50, ringY = -50;
  window.addEventListener('pointermove', (event) => { mouseX = event.clientX; mouseY = event.clientY; dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`; });
  const followCursor = () => { ringX += (mouseX - ringX) * .16; ringY += (mouseY - ringY) * .16; ring.style.transform = `translate(${ringX}px, ${ringY}px)`; requestAnimationFrame(followCursor); };
  followCursor();
  document.querySelectorAll('a, summary, .tilt-card').forEach((el) => { el.addEventListener('pointerenter', () => ring.classList.add('is-hover')); el.addEventListener('pointerleave', () => ring.classList.remove('is-hover')); });
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => { const r = card.getBoundingClientRect(); const x = (event.clientX-r.left)/r.width-.5; const y = (event.clientY-r.top)/r.height-.5; card.style.transform = `perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) translateY(-6px)`; });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const nav = document.querySelector('.nav-wrap');
window.addEventListener('scroll', () => nav?.classList.toggle('is-scrolled', window.scrollY > 30), { passive: true });

const revealTargets = document.querySelectorAll('.section > *, .route-card, .note, .output-line');
revealTargets.forEach((item) => item.classList.add('reveal'));
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), { threshold: .12 });
revealTargets.forEach((item) => observer.observe(item));

if (!reduceMotion) {
  const parallaxItems = document.querySelectorAll('[data-parallax]');
  window.addEventListener('scroll', () => { parallaxItems.forEach((item) => { const speed = Number(item.dataset.parallax); const rect = item.getBoundingClientRect(); item.style.transform = `translateY(${(window.innerHeight / 2 - rect.top) * speed}px)`; }); }, { passive: true });
}

const visualLayer = document.createElement('link');
visualLayer.rel = 'stylesheet';
visualLayer.href = 'site-v2.css';
document.head.appendChild(visualLayer);

if (document.body.classList.contains('inner-page')) {
  const innerLayout = document.createElement('link');
  innerLayout.rel = 'stylesheet';
  innerLayout.href = 'inner-page-layout.css';
  document.head.appendChild(innerLayout);
}

const motionLayer = document.createElement('link');
motionLayer.rel = 'stylesheet';
motionLayer.href = 'motion-tokens.css';
document.head.appendChild(motionLayer);

document.querySelectorAll('.page-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank' || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    const wipe = document.querySelector('.page-wipe');
    if (!wipe) { window.location.href = href; return; }
    wipe.classList.add('is-active');
    window.setTimeout(() => { window.location.href = href; }, 560);
  });
});

if (document.body.classList.contains('archive-page')) {
  const domeStyle = document.createElement('link');
  domeStyle.rel = 'stylesheet';
  domeStyle.href = 'dome-gallery.css';
  document.head.appendChild(domeStyle);
  const domeRingFix = document.createElement('link');
  domeRingFix.rel = 'stylesheet';
  domeRingFix.href = 'dome-ring-fix.css';
  document.head.appendChild(domeRingFix);

  const archiveMain = document.querySelector('main');
  const domeSection = document.createElement('section');
  domeSection.className = 'dome-section';
  domeSection.innerHTML = `
    <div class="dome-heading">
      <div><p class="section-tag">INTERACTIVE ARCHIVE / 动态影像墙</p><h2>拖动，让记忆<br>在光里旋转。</h2></div>
      <p>这是数字档案的动态预览。实地调研后，可将每一格替换成团队拍摄的器物、展厅和市场照片。</p>
    </div>
    <div class="dome-root" aria-label="可拖拽旋转的陶琉影像墙"><div class="dome"></div><div class="dome-overlay"></div><span class="dome-hint"><b>→</b> DRAG TO EXPLORE · 点击图片放大</span></div>`;
  archiveMain?.insertBefore(domeSection, archiveMain.querySelector('.archive-stats'));

  const videoStyle = document.createElement('link');
  videoStyle.rel = 'stylesheet';
  videoStyle.href = 'archive-video.css';
  document.head.appendChild(videoStyle);
  const videoSection = document.createElement('section');
  videoSection.className = 'archive-video';
  videoSection.innerHTML = `<div class="archive-video__frame"><video controls playsinline preload="metadata" aria-label="淄博陶琉数字档案视频"><source src="assets/zibo-liuli-archive.mp4" type="video/mp4">你的浏览器暂不支持视频播放。</video><div class="archive-video__copy"><p>VIDEO ARCHIVE / 影像档案</p><h2>把瞬间，<br>留在光影里。</h2><p>这段影像将作为数字档案的一部分，记录淄博陶琉文化的现场感与流动的细节。</p><small>实践团队影像资料 · 本地播放</small></div></div>`;
  archiveMain?.insertBefore(videoSection, archiveMain.querySelector('.archive-stats'));

  const domeRoot = domeSection.querySelector('.dome-root');
  const dome = domeSection.querySelector('.dome');
  const sourceImage = 'https://dimg04.c-ctrip.com/images/25t0e12000gkhucin9310_W_2048_1536.png_.webp?_fr=wc';
  const labels = ['陶琉博物馆 · 外观', '火与土的结晶', '走进淄博陶琉', '待实拍归档', '器物与光', '博山行走记录'];
  const rows = [-3, -1.5, 0, 1.5, 3];
  // 36 columns × 10° = a complete 360° ring, rather than a front-facing half dome.
  const cols = Array.from({ length: 36 }, (_, i) => i - 18);
  cols.forEach((x, colIndex) => rows.forEach((y, rowIndex) => {
    const tile = document.createElement('div');
    tile.className = 'dome-tile';
    tile.style.setProperty('--x', x);
    tile.style.setProperty('--y', y + (colIndex % 2 ? .65 : 0));
    const label = labels[(colIndex + rowIndex) % labels.length];
    tile.innerHTML = `<button type="button" aria-label="查看：${label}"><img src="${sourceImage}" alt="${label}"></button>`;
    dome.appendChild(tile);
  }));

  const modal = document.createElement('div');
  modal.className = 'dome-modal';
  modal.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure><button class="dome-close" type="button" aria-label="关闭">×</button>`;
  document.body.appendChild(modal);
  const closeModal = () => modal.classList.remove('open');
  modal.addEventListener('click', (event) => { if (event.target === modal || event.target.closest('.dome-close')) closeModal(); });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  dome.addEventListener('click', (event) => {
    if (domeRoot.dataset.dragged === 'true') return;
    const button = event.target.closest('button');
    if (!button) return;
    const img = button.querySelector('img');
    modal.querySelector('img').src = img.src;
    modal.querySelector('img').alt = img.alt;
    modal.querySelector('figcaption').textContent = img.alt;
    modal.classList.add('open');
  });

  let rotationX = 0, rotationY = 0, startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false, velocityX = 0, velocityY = 0, previousX = 0, previousY = 0, previousTime = 0, inertiaFrame;
  const renderDome = () => { domeRoot.style.setProperty('--rotation-x', `${Math.max(-7, Math.min(7, rotationX))}deg`); domeRoot.style.setProperty('--rotation-y', `${rotationY}deg`); };
  const stopInertia = () => { if (inertiaFrame) cancelAnimationFrame(inertiaFrame); inertiaFrame = null; };
  const glide = () => { velocityX *= .94; velocityY *= .94; if (Math.abs(velocityX) < .01 && Math.abs(velocityY) < .01) return; rotationY += velocityX; rotationX -= velocityY; renderDome(); inertiaFrame = requestAnimationFrame(glide); };
  domeRoot.addEventListener('pointerdown', (event) => { stopInertia(); dragging = true; domeRoot.dataset.dragged = 'false'; startX = event.clientX; startY = event.clientY; baseX = rotationX; baseY = rotationY; previousX = event.clientX; previousY = event.clientY; previousTime = performance.now(); domeRoot.setPointerCapture(event.pointerId); });
  domeRoot.addEventListener('pointermove', (event) => { if (!dragging) return; const dx = event.clientX - startX, dy = event.clientY - startY; if (Math.abs(dx) + Math.abs(dy) > 5) domeRoot.dataset.dragged = 'true'; rotationY = baseY + dx / 9; rotationX = baseX - dy / 16; const now = performance.now(), elapsed = Math.max(1, now - previousTime); velocityX = ((event.clientX - previousX) / elapsed) * .65; velocityY = ((event.clientY - previousY) / elapsed) * .45; previousX = event.clientX; previousY = event.clientY; previousTime = now; renderDome(); });
  const releaseDome = (event) => { if (!dragging) return; dragging = false; try { domeRoot.releasePointerCapture(event.pointerId); } catch (_) {} window.setTimeout(() => { if (domeRoot.dataset.dragged === 'true') glide(); }, 0); };
  domeRoot.addEventListener('pointerup', releaseDome); domeRoot.addEventListener('pointercancel', releaseDome);
}

if (!document.body.classList.contains('archive-page') && document.querySelector('.output')) {
  const maskStyle = document.createElement('link');
  maskStyle.rel = 'stylesheet';
  maskStyle.href = 'mask-reveal.css';
  document.head.appendChild(maskStyle);
  const maskSection = document.createElement('section');
  maskSection.className = 'mask-story';
  maskSection.innerHTML = `<div class="mask-stage" aria-label="互动文字蒙版效果"><p class="mask-kicker">REVEAL / 互动蒙版</p><p class="mask-copy">陶与琉，来自泥与火，<br>也在今天的街市与展柜中，<br>继续被 <em>看见</em>、被理解。</p><div class="mask-revealed"><p>从一件器物开始，<br>让 <strong>淄博陶琉</strong> 的光<br>照进更多人的日常。</p></div><i class="mask-cursor"></i><p class="mask-hint">移动鼠标 / 手指，发现另一层文字</p></div>`;
  const output = document.querySelector('.output');
  output.parentNode.insertBefore(maskSection, output);
  const stage = maskSection.querySelector('.mask-stage');
  const cursor = maskSection.querySelector('.mask-cursor');
  const moveMask = (event) => { const box = stage.getBoundingClientRect(); const x = event.clientX - box.left, y = event.clientY - box.top; stage.style.setProperty('--mask-x', `${x}px`); stage.style.setProperty('--mask-y', `${y}px`); stage.style.setProperty('--mask-size', `${Math.min(window.innerWidth < 760 ? 120 : 175, box.width * .28)}px`); cursor.style.left = `${x}px`; cursor.style.top = `${y}px`; };
  stage.addEventListener('pointermove', moveMask);
  stage.addEventListener('pointerenter', moveMask);
  stage.addEventListener('pointerleave', () => stage.style.setProperty('--mask-size', '0px'));
}
