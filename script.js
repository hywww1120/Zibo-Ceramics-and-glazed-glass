const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (document.querySelector('.pixel-blast-intro__canvas') && !reduceMotion) {
  const canvas = document.querySelector('.pixel-blast-intro__canvas');
  const stage = canvas.closest('.pixel-blast-intro');
  const context = canvas.getContext('2d');
  const ripples = [];
  let width = 0, height = 0, frame;
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  const resizePixelBlast = () => {
    const bounds = stage.getBoundingClientRect();
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
  };
  resizePixelBlast();
  window.addEventListener('resize', resizePixelBlast, { passive: true });

  const addRipple = (event) => {
    const box = stage.getBoundingClientRect();
    ripples.push({ x: event.clientX - box.left, y: event.clientY - box.top, time: performance.now() });
    if (ripples.length > 4) ripples.shift();
  };
  stage.addEventListener('pointerdown', addRipple);
  stage.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse' && event.buttons === 1) addRipple(event); });

  const paintPixelBlast = (now) => {
    context.clearRect(0, 0, width, height);
    const step = width < 760 ? 8 : 9;
    const size = 6;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * .32;
    const activeRipples = ripples.filter((ripple) => now - ripple.time < 2700);
    ripples.splice(0, ripples.length, ...activeRipples);
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.hypot(dx, dy);
        let liquid = Math.sin(angle * 5 + now * .003) * 8 + Math.cos(angle * 2 - now * .002) * 5;
        let ripplePower = 0;
        activeRipples.forEach((ripple) => {
          const rippleDistance = Math.hypot(x - ripple.x, y - ripple.y);
          const age = (now - ripple.time) * .12;
          ripplePower += Math.sin(rippleDistance * .095 - age) * Math.exp(-Math.abs(rippleDistance - age * 8) * .025) * 13;
        });
        const edge = baseRadius + liquid + ripplePower;
        if (distance > edge) continue;
        const edgeFade = Math.max(0, Math.min(1, (edge - distance) / (baseRadius * .25)));
        const pattern = bayer[(Math.floor(y / step) % 4 + 4) % 4][(Math.floor(x / step) % 4 + 4) % 4] / 15;
        const pulse = (Math.sin(x * .043 + y * .028 + now * .0006) + 1) * .5;
        const alpha = (.17 + pulse * .48 + (1 - pattern) * .22) * edgeFade;
        const wobbleX = Math.sin(y * .036 + now * .002) * 2.4 + ripplePower * .08;
        const wobbleY = Math.cos(x * .032 - now * .0025) * 2.1;
        context.fillStyle = `rgba(223,184,105,${alpha})`;
        context.fillRect(x + wobbleX, y + wobbleY, size + pattern * 3, size + pattern * 3);
      }
    }
    frame = requestAnimationFrame(paintPixelBlast);
  };
  frame = requestAnimationFrame(paintPixelBlast);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = null; }
    if (!document.hidden && !frame) frame = requestAnimationFrame(paintPixelBlast);
  });
}

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

if (document.querySelector('.factory-feature')) {
  const factoryEmphasis = document.createElement('link');
  factoryEmphasis.rel = 'stylesheet';
  factoryEmphasis.href = 'factory-emphasis.css';
  document.head.appendChild(factoryEmphasis);
}

if (document.querySelector('.accordion-gallery')) {
  const accordionGalleryStyle = document.createElement('link');
  accordionGalleryStyle.rel = 'stylesheet';
  accordionGalleryStyle.href = 'accordion-gallery.css';
  document.head.appendChild(accordionGalleryStyle);
  document.querySelectorAll('.accordion-gallery__item').forEach((item) => {
    item.addEventListener('pointerenter', () => document.querySelectorAll('.accordion-gallery__item').forEach((other) => other.classList.toggle('is-active', other === item)));
    item.addEventListener('focus', () => document.querySelectorAll('.accordion-gallery__item').forEach((other) => other.classList.toggle('is-active', other === item)));
    item.addEventListener('click', () => { document.querySelectorAll('.accordion-gallery__item').forEach((other) => other.classList.toggle('is-active', other === item)); });
  });
}

if (document.querySelector('.hero-photo')) {
  const homePhotoTreatments = document.createElement('link');
  homePhotoTreatments.rel = 'stylesheet';
  homePhotoTreatments.href = 'home-photo-treatments.css';
  document.head.appendChild(homePhotoTreatments);
}

if (document.body.classList.contains('inner-page')) {
  const innerLayout = document.createElement('link');
  innerLayout.rel = 'stylesheet';
  innerLayout.href = 'inner-page-layout.css';
  document.head.appendChild(innerLayout);
}

if (document.body.classList.contains('museum-page')) {
  const museumVisitStyle = document.createElement('link');
  museumVisitStyle.rel = 'stylesheet';
  museumVisitStyle.href = 'museum-visit.css';
  document.head.appendChild(museumVisitStyle);
  const lightbox = document.createElement('div');
  lightbox.className = 'museum-lightbox';
  lightbox.innerHTML = '<img alt="博物馆走访实拍放大图">';
  document.body.appendChild(lightbox);
  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
  document.querySelectorAll('.museum-shot, .museum-hero-image').forEach((item) => item.addEventListener('click', () => {
    const image = item.querySelector('img');
    if (!image) return;
    const preview = lightbox.querySelector('img');
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    lightbox.classList.add('open');
  }));
}

if (document.body.classList.contains('research-page')) {
  const researchStyle = document.createElement('link');
  researchStyle.rel = 'stylesheet';
  researchStyle.href = 'research.css';
  document.head.appendChild(researchStyle);
}

const motionLayer = document.createElement('link');
motionLayer.rel = 'stylesheet';
motionLayer.href = 'motion-tokens.css';
document.head.appendChild(motionLayer);

const premiumMotion = document.createElement('link');
premiumMotion.rel = 'stylesheet';
premiumMotion.href = 'premium-motion.css';
document.head.appendChild(premiumMotion);

if (!reduceMotion) {
  const splitTargets = document.querySelectorAll('.hero h1, .inner-hero h1, .intro h2, .craft h2, .notes h2, .chapter-grid h2, .method-grid h2, .watch h2, .field h2, .dome-heading h2, .field-notes h2');
  splitTargets.forEach((heading) => {
    if (heading.dataset.splitReady) return;
    heading.dataset.splitReady = 'true';
    heading.classList.add('split-reveal');
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    let offset = 0;
    textNodes.forEach((node) => {
      const pieces = node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      pieces.forEach((piece) => {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { fragment.appendChild(document.createTextNode(piece)); return; }
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = piece;
        word.style.transitionDelay = `${Math.min(offset * 52, 780)}ms`;
        offset += 1;
        fragment.appendChild(word);
      });
      node.parentNode.replaceChild(fragment, node);
    });
  });
  const wordObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('words-visible'); wordObserver.unobserve(entry.target); }
  }), { threshold: .28 });
  document.querySelectorAll('.split-reveal').forEach((heading) => wordObserver.observe(heading));
}

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
  const archiveResearchStyle = document.createElement('link');
  archiveResearchStyle.rel = 'stylesheet';
  archiveResearchStyle.href = 'research.css';
  document.head.appendChild(archiveResearchStyle);
  const archiveResearchDetailsStyle = document.createElement('link');
  archiveResearchDetailsStyle.rel = 'stylesheet';
  archiveResearchDetailsStyle.href = 'archive-research.css';
  document.head.appendChild(archiveResearchDetailsStyle);
  document.querySelector('.archive-page .nav-wrap nav')?.insertAdjacentHTML('beforeend', '<a href="#digital-research">数字研究</a>');
  const domeStyle = document.createElement('link');
  domeStyle.rel = 'stylesheet';
  domeStyle.href = 'decay-card.css';
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
      <div><p class="section-tag">FACTORY VISIT / 工厂走访影像</p><h2>拖动，让现场<br>在光里旋转。</h2></div>
      <p>这是我们走进琉璃工厂后的第一批实拍档案：展柜观察、工坊操作与器物细节，共同构成对工艺现场的初步认识。</p>
    </div>
    <div class="dome-root" aria-label="可拖拽旋转的陶琉影像墙"><div class="dome"></div><div class="dome-overlay"></div><span class="dome-hint"><b>→</b> DRAG TO EXPLORE · 点击图片放大</span></div>`;
  archiveMain?.insertBefore(domeSection, archiveMain.querySelector('.archive-stats'));

  // Replace the spherical wall with a tactile, image-led archive card collection.
  domeSection.className = 'decay-section';
  domeSection.innerHTML = `
    <div class="decay-heading">
      <div><p class="section-tag">FACTORY VISIT / 工厂走访影像</p><h2>让一张照片，<br><em>慢慢显影。</em></h2></div>
      <p>从展柜、窑火到工匠手中的料坨——每一张实拍照片都是一次对现场的重新靠近。移动鼠标，让影像从时间的薄雾中浮现。</p>
    </div>
    <div class="decay-grid" aria-label="工厂与博物馆实拍影像卡片"></div>
    <p class="decay-hint"><b>↗</b> HOVER TO REVEAL · 点击卡片放大</p>`;

  const decayImages = [
    { src: 'assets/factory-visit-craftsperson.png', alt: '工匠在工坊中进行琉璃操作', label: '窑火之前' },
    { src: 'assets/factory-visit-display.png', alt: '团队参观琉璃作品展柜', label: '看见器物' },
    { src: 'assets/factory-visit-glassworks.png', alt: '琉璃作品展柜细节', label: '光的层次' },
    { src: 'assets/factory-visit-detail.png', alt: '绿色琉璃器物细节', label: '一抹绿色' },
    { src: 'assets/museum-tang-glass-bottles.jpg', alt: '唐代琉璃小瓶', label: '时间样本' },
    { src: 'assets/museum-blue-glass-installation.jpg', alt: '蓝色琉璃艺术装置', label: '流动的光' },
    { src: 'assets/museum-lotus-glass.jpg', alt: '琉璃莲花作品', label: '掌中莲华' },
    { src: 'assets/museum-modern-red-ceramics.jpg', alt: '近现代红色陶瓷作品', label: '色彩记忆' },
    { src: 'assets/museum-green-glass.jpg', alt: '绿色琉璃作品', label: '石色与火' }
  ];
  const decayGrid = domeSection.querySelector('.decay-grid');
  decayImages.forEach((image, index) => {
    const card = document.createElement('button');
    card.className = 'decay-card';
    card.type = 'button';
    card.style.setProperty('--delay', `${index * 70}ms`);
    card.style.setProperty('--tilt', `${(index % 3 - 1) * 1.8}deg`);
    card.innerHTML = `<img src="${image.src}" alt="${image.alt}"><span class="decay-card__wash"></span><span class="decay-card__meta"><i>0${index + 1}</i>${image.label}</span>`;
    card.addEventListener('click', () => openDecayModal(image));
    decayGrid.appendChild(card);
  });

  const decayModal = document.createElement('div');
  decayModal.className = 'decay-modal';
  decayModal.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button class="decay-modal__close" type="button" aria-label="关闭">×</button>';
  document.body.appendChild(decayModal);
  const openDecayModal = (image) => {
    const preview = decayModal.querySelector('img');
    preview.src = image.src;
    preview.alt = image.alt;
    decayModal.querySelector('figcaption').textContent = image.alt;
    decayModal.classList.add('open');
  };
  const closeDecayModal = () => decayModal.classList.remove('open');
  decayModal.addEventListener('click', (event) => { if (event.target === decayModal || event.target.closest('.decay-modal__close')) closeDecayModal(); });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDecayModal(); });

  const videoStyle = document.createElement('link');
  videoStyle.rel = 'stylesheet';
  videoStyle.href = 'archive-video.css';
  document.head.appendChild(videoStyle);
  const videoSection = document.createElement('section');
  videoSection.className = 'archive-video';
  videoSection.innerHTML = `<div class="archive-video__frame"><video controls playsinline preload="metadata" aria-label="淄博陶琉数字档案视频"><source src="assets/zibo-liuli-archive.mp4" type="video/mp4">你的浏览器暂不支持视频播放。</video><div class="archive-video__copy"><p>FACTORY VISIT / 工厂走访记录</p><h2>把工坊里的火，<br>留在光影里。</h2><p>这段影像记录了团队走进琉璃工厂的所见所闻，与现场照片共同构成这次调研的第一份动态档案。</p><a class="archive-research-link page-link" href="research.html">阅读数字传承研究 ↗</a><small>基米小队实拍资料 · 2026 夏</small></div></div>`;
  archiveMain?.insertBefore(videoSection, archiveMain.querySelector('.archive-stats'));

  const notesStyle = document.createElement('link');
  notesStyle.rel = 'stylesheet';
  notesStyle.href = 'field-notes.css';
  document.head.appendChild(notesStyle);
  const notesSection = document.createElement('section');
  notesSection.className = 'field-notes';
  notesSection.innerHTML = `<div class="field-notes__head"><div><p class="section-tag">FIELD NOTES / 工厂走访手记</p><h2>窑火旁的<br>日与夜。</h2></div><p class="field-notes__intro">一千多度的高温、几十年的手感、一秒钟的决断。我们从展厅走到车间，在琉璃从砂到器的过程里，看见了技术、时间与匠心如何彼此交织。</p></div><div class="field-notes__list"><article class="field-note"><span class="field-note__number">01</span><h3>从展厅到车间</h3><p>在展厅聆听器型与釉色背后的故事后，我们走进生产车间。理解一门手艺，是记录它的第一步。</p></article><article class="field-note"><span class="field-note__number">02</span><h3>一切从原料开始</h3><p>石英砂、纯碱与各类矿物配色材料，是琉璃的“前身”。看似普通的原料，决定着成品的质感与色彩。</p></article><article class="field-note"><span class="field-note__number">03</span><h3>火中取宝</h3><p>窑炉前最考验经验：料坯在高温中不断变化，火候相差片刻，颜色与形态便可能不同。</p></article><article class="field-note"><span class="field-note__number">04</span><h3>手里的时间感</h3><p>在有限的可塑期里，夹、拉、剪、转都要快、准、稳。工坊中的专注，让时间仿佛只剩下手与料坯。</p></article><article class="field-note"><span class="field-note__number">05</span><h3>慢下来，才出得了细活</h3><p>冷却后的切割、打磨、拼接与修饰，是另一种耐心。细节的完成，往往来自安静而重复的精修。</p></article></div><p class="field-notes__closing">我们想记录的，不只是从砂到器的过程，更是窑火旁每一双专注的手。<em>窑火不灭，匠心不息。</em></p>`;
  archiveMain?.insertBefore(notesSection, archiveMain.querySelector('.archive-stats'));

  const researchSection = document.createElement('section');
  researchSection.className = 'archive-research research-model section';
  researchSection.id = 'digital-research';
  researchSection.innerHTML = `<p class="section-tag">DIGITAL HERITAGE / 数字传承研究</p><div class="research-model__head"><h2>让非遗从展柜走向<br>可感知的日常。</h2><p>基于本次博物馆与工厂的走访，我们进一步追问：数字技术如何帮助淄博琉璃从“物的展览”走向可感知、可参与、可共创的活态文化体验？</p></div><div class="archive-research__abstract"><p>淄博琉璃拥有千年历史积淀与完整工艺体系，但也面临技艺传承、文化认知与创新能力的多重挑战。数字技术的价值不在于替代匠人的手，而在于为器物、工艺与故事建立新的连接方式。</p><div class="archive-research__tags"><span>数字孪生</span><span>AIGC</span><span>VR / AR</span><span>活态传承</span></div></div><div class="model-orbit" aria-label="数字建档、智能创作、沉浸传播、产业闭环构成的循环模型"><div class="model-core">活态<br>传承</div><article class="model-node model-node--one"><b>01</b><h3>数字建档</h3><p>器物 · 工艺 · 匠人口述史</p></article><article class="model-node model-node--two"><b>02</b><h3>智能创作</h3><p>纹样 · 文创 · IP</p></article><article class="model-node model-node--three"><b>03</b><h3>沉浸传播</h3><p>VR/AR · 展陈 · 互动</p></article><article class="model-node model-node--four"><b>04</b><h3>产业闭环</h3><p>研学 · 制造 · 销售</p></article></div>`;
  archiveMain?.insertBefore(researchSection, archiveMain.querySelector('#coming'));

  const researchPaths = document.createElement('section');
  researchPaths.className = 'archive-research-paths research-action section';
  researchPaths.innerHTML = `<p class="section-tag">PRACTICE PATH / 实践路径</p><div class="research-copy"><h2>从数据底本，<br>走到现实工坊。</h2><div><p><b>数字建档：</b>用三维扫描、影像与口述史记录器物和工艺流程，建立可检索、可追溯的琉璃文化数字资产库。</p><p><b>智能创作：</b>以传统纹样、器型和色彩为灵感，运用AIGC辅助概念设计，降低创新试错成本，同时尊重工艺边界。</p><p><b>沉浸传播：</b>通过VR/AR和互动展陈，让受众在虚拟空间中体验从原料、火候到成品的完整过程。</p><p><b>产业联动：</b>让线上内容引流线下工坊与研学，促成“虚拟创意—实体制造—市场体验”的可持续循环。</p></div></div><p class="archive-research__note">研究初稿：统计数据、案例与引用将随调研资料持续核验、补充与更新。<a class="page-link" href="research.html">阅读完整研究专题 ↗</a></p>`;
  archiveMain?.insertBefore(researchPaths, archiveMain.querySelector('#coming'));

  if (false) {
  const domeRoot = domeSection.querySelector('.dome-root');
  const dome = domeSection.querySelector('.dome');
  const fieldImages = [
    { src: 'assets/factory-visit-display.png', alt: '团队参观琉璃作品展柜' },
    { src: 'assets/factory-visit-glassworks.png', alt: '琉璃作品展柜细节' },
    { src: 'assets/factory-visit-craftsperson.png', alt: '工匠在工坊中进行琉璃操作' },
    { src: 'assets/factory-visit-detail.png', alt: '绿色琉璃器物细节' }
  ];
  fieldImages.push(
    { src: 'assets/museum-gallery.jpg', alt: '淄博陶瓷琉璃博物馆展厅' },
    { src: 'assets/museum-ancient-black-glaze.jpg', alt: '黑釉古陶瓷展品' },
    { src: 'assets/museum-blue-white-jar.jpg', alt: '青花瓷罐展品' },
    { src: 'assets/museum-tang-glass-bottles.jpg', alt: '唐代琉璃小瓶' },
    { src: 'assets/museum-modern-red-ceramics.jpg', alt: '近现代红色陶瓷作品' },
    { src: 'assets/museum-blue-glass-installation.jpg', alt: '蓝色琉璃艺术装置' },
    { src: 'assets/museum-lotus-glass.jpg', alt: '琉璃莲花作品' },
    { src: 'assets/museum-porcelain-figures.jpg', alt: '陶瓷人物作品' },
    { src: 'assets/museum-dragon-cup.jpg', alt: '东方龙纹瓷杯' },
    { src: 'assets/museum-painted-vase.jpg', alt: '广彩开光人物瓶' },
    { src: 'assets/museum-porcelain-pillow.jpg', alt: '人物瓷枕' },
    { src: 'assets/museum-yellow-glass.jpg', alt: '黄色琉璃器物' },
    { src: 'assets/museum-green-glass.jpg', alt: '绿色琉璃作品' },
    { src: 'assets/museum-ceramic-civilization.jpg', alt: '陶艺文明主题作品' }
  );
  const rows = [-1.25, 1.25];
  // 36 columns × 10° = a complete 360° ring, rather than a front-facing half dome.
  const cols = Array.from({ length: 9 }, (_, i) => i - 4.5);
  cols.forEach((x, colIndex) => rows.forEach((y, rowIndex) => {
    const tile = document.createElement('div');
    tile.className = 'dome-tile';
    tile.style.setProperty('--x', x);
    tile.style.setProperty('--y', y + (colIndex % 2 ? .22 : 0));
    const image = fieldImages[colIndex * rows.length + rowIndex];
    tile.innerHTML = `<button type="button" aria-label="查看：${image.alt}"><img src="${image.src}" alt="${image.alt}"></button>`;
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

if (document.querySelector('.accordion-gallery')) {
  const galleryLightbox = document.createElement('div');
  galleryLightbox.className = 'gallery-lightbox';
  galleryLightbox.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button type="button" aria-label="关闭预览">×</button>';
  document.body.appendChild(galleryLightbox);

  const closeGalleryLightbox = () => galleryLightbox.classList.remove('open');
  galleryLightbox.addEventListener('click', (event) => {
    if (event.target === galleryLightbox || event.target.closest('button')) closeGalleryLightbox();
  });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeGalleryLightbox(); });

  document.querySelectorAll('.accordion-gallery__item').forEach((item) => {
    item.addEventListener('click', () => {
      const image = item.querySelector('img');
      if (!image) return;
      galleryLightbox.querySelector('img').src = image.currentSrc || image.src;
      galleryLightbox.querySelector('img').alt = image.alt;
      galleryLightbox.querySelector('figcaption').textContent = image.alt;
      galleryLightbox.classList.add('open');
    });
  });
}
