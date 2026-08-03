/* =========================================================
   BROKER DICKBUTT — broker.js
   Powers broker.html: countdown, wallet, search/filter, live grid.
   Frontend only — no staking backend, exactly as specified.
   ========================================================= */

(function () {
  const STATUSES = ['holding', 'staked', 'listed'];
  let brokerData = [];
  let currentFilter = 'all';

  function seedData(count = 20){
    brokerData = Array.from({ length: count }, () => ({
      id: randId(),
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)]
    }));
  }

  function renderGrid(){
    const bg = document.getElementById('brokerGrid');
    const searchInput = document.getElementById('brokerSearch');
    if(!bg) return;

    const query = searchInput ? searchInput.value.trim() : '';
    let items = brokerData;
    if(currentFilter !== 'all') items = items.filter(x => x.status === currentFilter);
    if(query) items = items.filter(x => String(x.id).includes(query));

    bg.innerHTML = '';
    if(!items.length){
      bg.innerHTML = `<div class="empty-state">No Brokers match this view yet.</div>`;
      return;
    }

    items.forEach(item => {
      const card = buildNftCard({
        id: item.id,
        status: item.status,
        autoRotate: false,
        onClick: (id) => { window.location.href = `metadata.html?id=${id}`; }
      });
      bg.appendChild(card);
    });
  }

  function bindFilters(){
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderGrid();
      });
    });
    const search = document.getElementById('brokerSearch');
    if(search) search.addEventListener('input', renderGrid);
  }

  function startLiveRotation(){
    setInterval(() => {
      if(!brokerData.length) return;
      const idx = Math.floor(Math.random() * brokerData.length);
      brokerData[idx] = { id: randId(), status: STATUSES[Math.floor(Math.random() * STATUSES.length)] };
      renderGrid();
    }, 6000);
  }

  function bindWallet(){
    const btn1 = document.getElementById('walletBtn');
    const btn2 = document.getElementById('walletBtn2');
    const label1 = document.getElementById('walletLabel');
    const addrText = document.getElementById('walletAddrText');
    const dot = document.getElementById('walletDot');

    const handler = () => connectWallet([label1], addrText, dot);
    if(btn1) btn1.addEventListener('click', handler);
    if(btn2) btn2.addEventListener('click', handler);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCountdown('cd', 'miniCd');
    seedData(20);
    renderGrid();
    bindFilters();
    startLiveRotation();
    bindWallet();
  });
})();
