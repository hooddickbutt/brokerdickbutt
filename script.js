/* =========================================================
   BROKER DICKBUTT — SHARED SCRIPT
   Vanilla JS only. No frameworks, no build step.
   ========================================================= */

/* ---------------- CONFIG ---------------- */
const IMAGE_CID  = 'bafybeifoa27og6pmdby45xpt55nfhvyk3a4vgrs5u7qjt3jvpokec3gl2y';
const META_CID   = 'bafybeiexd6gb5h2df6fti7xskyccxxmhhapoxqrkpwnj6a27lwirfspqj4';
const GATEWAY    = 'https://ipfs.io/ipfs/';
const MAX_SUPPLY = 10000;
const FIRST_LOGO_ID = 3;

function imageUrl(id){ return `${GATEWAY}${IMAGE_CID}/${id}.png`; }
function metaUrl(id){ return `${GATEWAY}${META_CID}/${id}`; }
function randId(){ return Math.floor(Math.random() * MAX_SUPPLY) + 1; }
function pad(n){ return String(n).padStart(2, '0'); }
function padId(id){ return String(id).padStart(4, '0'); }
function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ---------------- TOAST ---------------- */
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- RIPPLE (touch/click feedback) ---------------- */
function attachRipple(){
  document.querySelectorAll('.btn').forEach(btn => {
    if(btn._rippleBound) return;
    btn._rippleBound = true;
    btn.addEventListener('pointerdown', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (e.clientX ?? rect.left + rect.width/2) - rect.left - size/2;
      const y = (e.clientY ?? rect.top + rect.height/2) - rect.top - size/2;
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 600);
    });
  });
}

/* ---------------- IMAGE FADE SWAP ---------------- */
function fadeSwap(imgEl, url, onDone){
  if(!imgEl) return;
  const probe = new Image();
  probe.onload = () => {
    imgEl.src = url;
    imgEl.classList.add('show');
    if(onDone) onDone(true);
  };
  probe.onerror = () => { if(onDone) onDone(false); };
  imgEl.classList.remove('show');
  probe.src = url;
}

/* ---------------- LOGO ROTATOR (nav + footer, site-wide) ---------------- */
function startLogoRotator(){
  const logo = document.getElementById('logoImg');
  const footerLogo = document.getElementById('footerLogoImg');
  if(!logo && !footerLogo) return;
  let first = true;
  const tick = () => {
    const id = first ? FIRST_LOGO_ID : randId();
    first = false;
    fadeSwap(logo, imageUrl(id));
    fadeSwap(footerLogo, imageUrl(id));
  };
  tick();
  setInterval(tick, 3500);
}

/* ---------------- HERO / PREVIEW ROTATOR (reusable) ---------------- */
function startHeroRotator(imgId = 'heroImg', tagId = 'heroTag', interval = 4000){
  const heroImg = document.getElementById(imgId);
  const heroTag = tagId ? document.getElementById(tagId) : null;
  if(!heroImg) return;
  const tick = () => {
    const id = randId();
    fadeSwap(heroImg, imageUrl(id));
    if(heroTag) heroTag.textContent = '#' + padId(id);
  };
  tick();
  setInterval(tick, interval);
}

/* ---------------- ANIMATED COUNTER ---------------- */
function animateCounter(el, target, duration = 1200){
  if(!el) return;
  const start = performance.now();
  function step(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if(p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(step);
}

/* ---------------- COUNTDOWN (48h from page load) ---------------- */
function initCountdown(prefix = 'cd', miniId = 'miniCd'){
  const dEl = document.getElementById(prefix + '-d');
  if(!dEl) return;
  const target = Date.now() + 48 * 60 * 60 * 1000;
  const hEl = document.getElementById(prefix + '-h');
  const mEl = document.getElementById(prefix + '-m');
  const sEl = document.getElementById(prefix + '-s');
  const mini = document.getElementById(miniId);

  function tick(){
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    dEl.textContent = pad(d);
    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);
    if(mini) mini.textContent = `${pad(d*24+h)}:${pad(m)}:${pad(s)}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------------- NFT CARD FACTORY (used by collection grid + broker grid) ---------------- */
function buildNftCard({ id, status = null, autoRotate = true, onClick } = {}){
  const card = document.createElement('div');
  card.className = 'nft-card';

  const statusBadge = status ? `<span class="status-badge">${status}</span>` : '';
  card.innerHTML = `
    <div class="nft-media">
      <div class="skeleton"></div>
      ${statusBadge}
      <img alt="Broker NFT" loading="lazy">
      ${autoRotate ? '<div class="live-dot"></div>' : ''}
    </div>
    <div class="nft-info">
      <span class="name">Broker</span>
      <span class="id">#${padId(id)}</span>
    </div>
  `;

  const imgEl = card.querySelector('img');
  const idEl = card.querySelector('.id');
  const skel = card.querySelector('.skeleton');
  let currentId = id;

  const setImage = (tokenId) => {
    currentId = tokenId;
    const probe = new Image();
    probe.onload = () => { imgEl.src = imageUrl(tokenId); imgEl.classList.add('show'); skel.style.display = 'none'; };
    probe.onerror = () => { skel.style.display = 'none'; };
    probe.src = imageUrl(tokenId);
    idEl.textContent = '#' + padId(tokenId);
  };
  setImage(id);

  if(autoRotate){
    setInterval(() => setImage(randId()), 5000 + Math.random() * 4000);
  }

  card.addEventListener('click', () => {
    if(onClick) onClick(currentId);
    else window.location.href = `metadata.html?id=${currentId}`;
  });

  return card;
}

/* ---------------- HOME PAGE: COLLECTION GRID + LOAD MORE ---------------- */
function initCollectionGrid(){
  const grid = document.getElementById('nftGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if(!grid) return;

  let loadedCount = 0;

  function loadMore(count = 10){
    if(loadMoreBtn){ loadMoreBtn.disabled = true; loadMoreBtn.textContent = 'Loading…'; }
    setTimeout(() => {
      for(let i = 0; i < count; i++){
        grid.appendChild(buildNftCard({ id: randId() }));
      }
      loadedCount += count;
      if(loadMoreBtn){
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More';
        if(loadedCount >= MAX_SUPPLY) loadMoreBtn.style.display = 'none';
      }
    }, 200);
  }

  if(loadMoreBtn) loadMoreBtn.addEventListener('click', () => loadMore(10));
  loadMore(10);
}

/* ---------------- STAT COUNTER (home page) ---------------- */
function initStatCounter(){
  const el = document.getElementById('statSupply');
  if(!el) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCounter(el, MAX_SUPPLY, 1400);
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  obs.observe(el);
}

/* ---------------- WALLET CONNECT (frontend only, no backend) ---------------- */
async function connectWallet(labelEls = [], addrTextEl = null, dotEl = null){
  if(window.ethereum){
    try{
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0];
      const short = addr.slice(0, 6) + '…' + addr.slice(-4);
      labelEls.forEach(el => { if(el) el.textContent = short; });
      if(addrTextEl) addrTextEl.textContent = short;
      if(dotEl) dotEl.classList.add('on');
      showToast('Wallet connected');
    }catch(err){
      showToast('Wallet connection rejected');
    }
  }else{
    showToast('No wallet detected — install MetaMask or another Ethereum wallet');
  }
}

/* ---------------- INIT (runs on every page) ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  startLogoRotator();
  attachRipple();
  document.body.addEventListener('pointerdown', (e) => {
    if(e.target.closest && e.target.closest('.btn')) attachRipple();
  });

  // Home page only
  if(document.getElementById('nftGrid')){
    startHeroRotator('heroImg', 'heroTag', 4000);
    initCollectionGrid();
    initStatCounter();
    initCountdown('cd');
  }
});
