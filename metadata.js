/* =========================================================
   BROKER DICKBUTT — metadata.js
   Powers metadata.html?id=NFT_NUMBER
   ========================================================= */

(function () {
  function getIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('id');
    const id = parseInt(raw, 10);
    if(!raw || isNaN(id) || id < 1 || id > MAX_SUPPLY) return null;
    return id;
  }

  function renderLoading(){
    document.getElementById('metadataContent').innerHTML = `
      <div class="state-msg">Loading Broker metadata…</div>
    `;
  }

  function renderNotFound(){
    document.getElementById('metadataContent').innerHTML = `
      <div class="state-msg">
        No token ID provided or ID is out of range (1–${MAX_SUPPLY.toLocaleString()}).<br><br>
        <a class="btn btn-primary" href="index.html">← Back to Collection</a>
      </div>
    `;
  }

  function renderError(id){
    document.getElementById('metadataContent').innerHTML = `
      <div class="detail-media"><img src="${imageUrl(id)}" class="show" alt="Broker #${id}" onerror="this.style.opacity=0"></div>
      <div class="detail-tag">TOKEN #${padId(id)}</div>
      <h1 class="detail-name">Broker #${padId(id)}</h1>
      <p class="detail-desc">This token's metadata couldn't be retrieved from IPFS right now. The gateway may be rate-limited — try again in a moment.</p>
      <div class="detail-actions">
        <a class="btn btn-ghost btn-block" href="index.html#collection">← Back to Collection</a>
        <a class="btn btn-primary btn-block" href="broker.html">Go to Broker</a>
      </div>
    `;
  }

  function renderMeta(id, meta){
    const name = meta.name || `Broker #${padId(id)}`;
    const desc = meta.description || 'A unique pixel Broker from Robinhood Chain, permanently stored on IPFS.';
    const attrs = Array.isArray(meta.attributes) ? meta.attributes : [];
    const img = meta.image ? meta.image.replace('ipfs://', GATEWAY) : imageUrl(id);

    document.getElementById('metadataContent').innerHTML = `
      <div class="detail-media">
        <img id="detailImg" src="${img}" alt="${escapeHtml(name)}" onerror="this.src='${imageUrl(id)}'; this.classList.add('show');">
      </div>
      <div class="detail-tag">TOKEN #${padId(id)}</div>
      <h1 class="detail-name">${escapeHtml(name)}</h1>
      <p class="detail-desc">${escapeHtml(desc)}</p>
      <div class="attrs-title">Attributes (${attrs.length})</div>
      <div class="attrs-grid">
        ${attrs.map(a => `
          <div class="attr-chip">
            <div class="t">${escapeHtml(String(a.trait_type ?? 'Trait'))}</div>
            <div class="v">${escapeHtml(String(a.value ?? '—'))}</div>
          </div>
        `).join('') || '<div class="attr-chip"><div class="t">Traits</div><div class="v">Not provided</div></div>'}
      </div>
      <div class="detail-actions">
        <a class="btn btn-ghost btn-block" href="index.html#collection">← Back to Collection</a>
        <a class="btn btn-primary btn-block" href="https://opensea.io/collection/Brokerdickbutt" target="_blank" rel="noopener">View on OpenSea</a>
      </div>
      <div class="id-nav">
        <a class="btn btn-ghost" href="metadata.html?id=${Math.max(1, id - 1)}">← Prev</a>
        <a class="btn btn-ghost" href="metadata.html?id=${Math.min(MAX_SUPPLY, id + 1)}">Next →</a>
      </div>
    `;
    const img2 = document.getElementById('detailImg');
    if(img2){
      const probe = new Image();
      probe.onload = () => img2.classList.add('show');
      probe.src = img2.src;
    }
  }

  async function load(){
    const id = getIdFromUrl();
    if(!id){ renderNotFound(); return; }
    renderLoading();
    try{
      const res = await fetch(metaUrl(id));
      if(!res.ok) throw new Error('not found');
      const meta = await res.json();
      renderMeta(id, meta);
    }catch(err){
      renderError(id);
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
