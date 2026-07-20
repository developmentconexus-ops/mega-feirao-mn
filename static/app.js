const app = document.querySelector('#app');
const storageKey = 'mega-feirao-user';
let pollTimer = null;

const users = [
  ['oscar','Oscar'],['francyelle','Francyelle'],['keila','Keila'],['beatriz','Beatriz'],['raphael','Raphael'],['joao','João'],['jose','Jose'],['daniel','Daniel'],['leandro','Leandro'],['izabel','Izabel'],
  ['thassya','Thassya'],['sthella','Sthella'],['leandrot','Leandro T'],['viniciust','Vinicius T'],['mauro','Mauro'],['vinicius','Vinicius']
];

async function request(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', headers: {'Content-Type':'application/json'}, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

function savedUser() {
  try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
}
function logout() { localStorage.removeItem(storageKey); clearInterval(pollTimer); renderLogin(); }
function waitingTime(iso) {
  if (!iso) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'agora';
  if (minutes === 1) return 'há 1 minuto';
  return `há ${minutes} minutos`;
}

function topbar(user) {
  return `<header class="topbar"><div><p>MEGA FEIRÃO</p><strong>Metal Nobre</strong>${user.role === 'viewer' ? '<span class="viewer-badge">Somente visualização</span>' : ''}</div><button class="button ghost" id="logout">Sair</button></header>`;
}

function renderLogin() {
  clearInterval(pollTimer);
  app.innerHTML = `<main class="page center"><section class="card login"><div class="brand">MN</div><p class="eyebrow">Metal Nobre apresenta</p><h1>MEGA FEIRÃO</h1><p class="subtitle">Organização da fila de vendedores</p><form class="form" id="login-form"><label>Usuário<select id="username">${users.map(([value,name]) => `<option value="${value}">${name}</option>`).join('')}</select></label><label>Senha<input id="password" type="password" autocomplete="current-password" placeholder="Digite sua senha" /></label><p class="error" id="login-error"></p><button class="button primary" type="submit">Entrar</button></form></section></main>`;
  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const error = document.querySelector('#login-error'); error.textContent = '';
    try {
      const user = await request('/api/login', {method:'POST', body:JSON.stringify({username:document.querySelector('#username').value,password:document.querySelector('#password').value})});
      localStorage.setItem(storageKey, JSON.stringify(user)); route();
    } catch (e) { error.textContent = e.message; }
  });
}

async function renderSeller(user) {
  clearInterval(pollTimer);
  app.innerHTML = `${topbar(user)}<main class="seller-layout"><section class="card seller-card"><p class="loading">Carregando...</p></section></main>`;
  document.querySelector('#logout').onclick = logout;
  const load = async () => {
    try {
      const data = await request('/api/state');
      const seller = data.sellers.find(item => item.username === user.username);
      if (!seller) return logout();
      const position = data.queue.findIndex(item => item.username === user.username) + 1;
      const available = seller.status === 'available';
      document.querySelector('.seller-card').innerHTML = `<p class="hello">Olá,</p><h1>${seller.name}</h1><div class="status-panel ${available ? 'available' : 'busy'}"><div class="status-label">STATUS ATUAL</div><div class="status-value">${available ? '● DISPONÍVEL' : '● EM ATENDIMENTO'}</div><div class="queue-position">${available ? `Você é o ${position}º da fila` : 'Quando finalizar, volte para o final da fila.'}</div></div><button class="button ${available ? 'danger' : 'success'}" id="toggle-status">${available ? 'INICIAR ATENDIMENTO' : 'FINALIZAR E FICAR DISPONÍVEL'}</button>`;
      document.querySelector('#toggle-status').onclick = async () => {
        const button = document.querySelector('#toggle-status'); button.disabled = true;
        try { await request('/api/status',{method:'POST',body:JSON.stringify({username:user.username,status:available ? 'busy' : 'available'})}); await load(); }
        catch(e){ alert(e.message); button.disabled = false; }
      };
    } catch (e) { document.querySelector('.seller-card').innerHTML = `<p class="error">${e.message}</p>`; }
  };
  await load(); pollTimer = setInterval(load, 1000);
}

async function renderReception(user) {
  clearInterval(pollTimer);
  app.innerHTML = `${topbar(user)}<main class="content"><p class="loading">Carregando...</p></main>`;
  document.querySelector('#logout').onclick = logout;
  const load = async () => {
    try {
      const data = await request('/api/state');
      const busy = data.sellers.filter(s => s.status === 'busy');
      const next = data.queue[0];
      document.querySelector('.content').innerHTML = `<section class="card next-card"><p class="eyebrow">PRÓXIMO VENDEDOR</p>${next ? `<div class="pulse"></div><h1>${next.name}</h1><p>Disponível ${waitingTime(next.availableSince)}</p>` : '<h1>Nenhum disponível</h1><p>Aguarde um vendedor finalizar o atendimento.</p>'}</section><div class="columns"><section class="card list-card"><div class="list-title"><h2>Fila de disponíveis</h2><span class="count green-count">${data.queue.length}</span></div><div class="seller-list">${data.queue.length ? data.queue.map((seller,index)=>`<article class="seller-row"><span class="position">${index+1}</span><div><strong>${seller.name}</strong><small>Disponível ${waitingTime(seller.availableSince)}</small></div><span class="dot available"></span></article>`).join('') : '<p class="empty">Fila vazia</p>'}</div></section><section class="card list-card"><div class="list-title"><h2>Em atendimento</h2><span class="count red-count">${busy.length}</span></div><div class="seller-list">${busy.length ? busy.map(seller=>`<article class="seller-row"><span class="avatar">${seller.name.slice(0,1)}</span><div><strong>${seller.name}</strong><small>Em atendimento</small></div><span class="dot busy"></span></article>`).join('') : '<p class="empty">Todos estão disponíveis</p>'}</div></section></div>`;
    } catch(e) { document.querySelector('.content').innerHTML = `<p class="error">${e.message}</p>`; }
  };
  await load(); pollTimer = setInterval(load, 1000);
}

function route() {
  const user = savedUser();
  if (!user) return renderLogin();
  if (user.role === 'seller') return renderSeller(user);
  if (user.role === 'reception' || user.role === 'viewer') return renderReception(user);
  logout();
}
route();
