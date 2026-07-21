from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = "0.0.0.0"
PORT = 3000
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
STATE_FILE = DATA_DIR / "state.json"
LOCK = threading.Lock()

USERS = [
    {"username": "oscar", "name": "Oscar", "password": "oscarMN", "role": "seller"},
    {"username": "francyelle", "name": "Francyelle", "password": "franMN", "role": "seller"},
    {"username": "keila", "name": "Keila", "password": "keilaMN", "role": "seller"},
    {"username": "beatriz", "name": "Beatriz", "password": "beatrizMN", "role": "seller"},
    {"username": "raphael", "name": "Raphael", "password": "raphaelMN", "role": "seller"},
    {"username": "joao", "name": "João", "password": "joaoMN", "role": "seller"},
    {"username": "jose", "name": "Jose", "password": "joseMN", "role": "seller"},
    {"username": "daniel", "name": "Daniel", "password": "danielMN", "role": "seller"},
    {"username": "leandro", "name": "Leandro", "password": "leandroMN", "role": "seller"},
    {"username": "izabel", "name": "Izabel", "password": "izabelMN", "role": "seller"},
    {"username": "thassya", "name": "Thassya", "password": "thassyaMN", "role": "reception"},
    {"username": "sthella", "name": "Sthella", "password": "SthellaMN", "role": "reception"},
    {"username": "leandrot", "name": "Leandro T", "password": "leandrotMN", "role": "viewer"},
    {"username": "viniciust", "name": "Vinicius T", "password": "viniciustMN", "role": "viewer"},
    {"username": "mauro", "name": "Mauro", "password": "mauroMN", "role": "viewer"},
    {"username": "vinicius", "name": "Vinicius", "password": "viniciusMN", "role": "viewer"},
]

HTML = r'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mega Feirão Metal Nobre</title><style>
:root{--wine:#71152d;--green:#198754;--red:#c0392b;--bg:#f6f2f3;--card:#fff;--text:#251b1e;--muted:#74676b}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:var(--bg);color:var(--text)}button,input,select{font:inherit}.hidden{display:none!important}.page{min-height:100vh}.center{display:grid;place-items:center;padding:24px}.card{background:var(--card);border-radius:22px;box-shadow:0 12px 35px #38101c18}.login{width:min(430px,100%);padding:32px}.brand{width:72px;height:72px;border-radius:20px;background:var(--wine);color:#fff;display:grid;place-items:center;font-weight:900;font-size:26px;margin:auto}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:12px;color:var(--wine);font-weight:800}.login h1{text-align:center;margin:14px 0 4px;color:var(--wine)}.subtitle{text-align:center;color:var(--muted);margin:0 0 28px}.field{display:grid;gap:7px;margin:15px 0;font-weight:700}.field select,.field input{width:100%;padding:14px;border:1px solid #d8cbcf;border-radius:12px;background:#fff}.primary,.danger,.success{border:0;border-radius:14px;padding:15px 18px;color:#fff;font-weight:800;cursor:pointer;width:100%}.primary{background:var(--wine)}.danger{background:var(--red)}.success{background:var(--green)}.error{color:var(--red);font-weight:700;text-align:center}.topbar{background:var(--wine);color:#fff;padding:16px 22px;display:flex;justify-content:space-between;align-items:center}.topbar strong{display:block;font-size:20px}.link{background:transparent;color:#fff;border:1px solid #ffffff66;border-radius:10px;padding:9px 13px;cursor:pointer}.content{max-width:1100px;margin:auto;padding:22px}.seller-card{max-width:560px;margin:30px auto;padding:28px;text-align:center}.status{font-size:30px;font-weight:900;margin:18px 0}.green{color:var(--green)}.red{color:var(--red)}.position-box{background:#f4edef;border-radius:14px;padding:16px;margin:18px 0;color:var(--muted)}.position-box strong{display:block;color:var(--wine);font-size:24px;margin-top:4px}.next{padding:28px;text-align:center;margin-bottom:22px;border-top:7px solid var(--green)}.next h1{font-size:42px;margin:8px 0;color:var(--wine)}.dot{display:inline-block;width:13px;height:13px;border-radius:50%;margin-right:8px}.available{background:var(--green)}.busy{background:var(--red)}.columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}.list{padding:20px}.list-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:12px}.count{color:#fff;border-radius:999px;padding:5px 10px;font-weight:800}.row{display:flex;align-items:center;gap:13px;padding:14px 2px;border-bottom:1px solid #eee}.pos{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f1e5e8;color:var(--wine);font-weight:900}.row-main{flex:1}.row-main small{display:block;color:var(--muted);margin-top:4px}.empty{color:var(--muted);text-align:center;padding:25px}@media(max-width:760px){.columns{grid-template-columns:1fr}.next h1{font-size:32px}.content{padding:14px}.seller-card{margin:18px auto;padding:22px}}
</style></head><body>
<section id="loginPage" class="page center"><div class="card login"><div class="brand">MN</div><p class="eyebrow" style="text-align:center">Metal Nobre apresenta</p><h1>MEGA FEIRÃO</h1><p class="subtitle">Organização da fila de vendedores</p><form id="loginForm"><label class="field">Usuário<select id="username"></select></label><label class="field">Senha<input id="password" type="password"></label><p id="loginError" class="error hidden"></p><button class="primary">Entrar</button></form></div></section>
<section id="sellerPage" class="page hidden"><header class="topbar"><div><span>MEGA FEIRÃO</span><strong>Metal Nobre</strong></div><button class="link" onclick="logout()">Sair</button></header><main class="content"><div class="card seller-card"><p class="eyebrow">Área do vendedor</p><h1 id="sellerName"></h1><div id="sellerStatus" class="status"></div><div id="sellerPosition" class="position-box"></div><button id="sellerAction" onclick="toggleStatus()"></button></div></main></section>
<section id="receptionPage" class="page hidden"><header class="topbar"><div><span>MEGA FEIRÃO</span><strong>Metal Nobre</strong><small id="viewMode"></small></div><button class="link" onclick="logout()">Sair</button></header><main class="content"><section class="card next"><p class="eyebrow">Próximo vendedor</p><h1 id="nextSeller">Nenhum disponível</h1><p id="nextWait">Aguardando alguém entrar na fila.</p></section><div class="columns"><section class="card list"><div class="list-head"><h2>Fila de disponíveis</h2><span id="queueCount" class="count available">0</span></div><div id="queueList"></div></section><section class="card list"><div class="list-head"><h2>Em atendimento</h2><span id="busyCount" class="count busy">0</span></div><div id="busyList"></div></section></div></main></section>
<script>
let currentUser=null,stateTimer=null,currentState=null;const $=id=>document.getElementById(id);function show(id){["loginPage","sellerPage","receptionPage"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}async function api(path,options={}){const r=await fetch(path,{cache:"no-store",headers:{"Content-Type":"application/json"},...options});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Erro no servidor");return d}function waitText(iso){if(!iso)return"";const m=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/60000));return m<1?"agora":`há ${m} min`}async function loadUsers(){const u=await api("/api/users");$("username").innerHTML=u.map(x=>`<option value="${x.username}">${x.name}</option>`).join("")}$("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginError").classList.add("hidden");try{currentUser=await api("/api/login",{method:"POST",body:JSON.stringify({username:$("username").value,password:$("password").value})});localStorage.setItem("mega-feirao-user",JSON.stringify(currentUser));startUser()}catch(err){$("loginError").textContent=err.message;$("loginError").classList.remove("hidden")}});function startUser(){clearInterval(stateTimer);if(currentUser.role==="seller"){show("sellerPage");$("sellerName").textContent=currentUser.name}else{show("receptionPage");$("viewMode").textContent=currentUser.role==="viewer"?" • Somente visualização":""}loadState();stateTimer=setInterval(loadState,1000)}async function loadState(){try{currentState=await api("/api/state");currentUser.role==="seller"?renderSeller():renderReception()}catch(e){console.error(e)}}function renderSeller(){const me=currentState.sellers.find(s=>s.username===currentUser.username);if(!me)return;const a=me.status==="available";$("sellerStatus").textContent=a?"● DISPONÍVEL":"● EM ATENDIMENTO";$("sellerStatus").className="status "+(a?"green":"red");const p=currentState.queue.findIndex(s=>s.username===me.username)+1;$("sellerPosition").innerHTML=a?`Sua posição na fila<strong>${p}º</strong>`:"Você está fora da fila enquanto atende.";$("sellerAction").textContent=a?"INICIAR ATENDIMENTO":"FINALIZAR E FICAR DISPONÍVEL";$("sellerAction").className=a?"danger":"success"}async function toggleStatus(){const me=currentState.sellers.find(s=>s.username===currentUser.username);await api("/api/status",{method:"POST",body:JSON.stringify({username:currentUser.username,status:me.status==="available"?"busy":"available"})});await loadState()}function renderReception(){const q=currentState.queue,b=currentState.sellers.filter(s=>s.status==="busy"),n=q[0];$("nextSeller").textContent=n?n.name:"Nenhum disponível";$("nextWait").textContent=n?`Disponível ${waitText(n.availableSince)}`:"Aguardando alguém entrar na fila.";$("queueCount").textContent=q.length;$("busyCount").textContent=b.length;$("queueList").innerHTML=q.length?q.map((s,i)=>`<div class="row"><span class="pos">${i+1}</span><div class="row-main"><strong>${s.name}</strong><small>Disponível ${waitText(s.availableSince)}</small></div><span class="dot available"></span></div>`).join(""):"<p class='empty'>Fila vazia</p>";$("busyList").innerHTML=b.length?b.map(s=>`<div class="row"><div class="row-main"><strong>${s.name}</strong><small>Em atendimento</small></div><span class="dot busy"></span></div>`).join(""):"<p class='empty'>Todos disponíveis</p>"}function logout(){clearInterval(stateTimer);localStorage.removeItem("mega-feirao-user");currentUser=null;$("password").value="";show("loginPage")}(async()=>{await loadUsers();const s=localStorage.getItem("mega-feirao-user");if(s){try{currentUser=JSON.parse(s);startUser()}catch{show("loginPage")}}else show("loginPage")})()
</script></body></html>'''

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def public_user(user):
    return {key: user[key] for key in ("username", "name", "role")}

def authenticate(username, password):
    for user in USERS:
        if user["username"] == username and user["password"] == password:
            return public_user(user)
    return None

def initial_state():
    stamp = now_iso()
    return [{"username": u["username"], "name": u["name"], "status": "busy", "availableSince": None, "updatedAt": stamp} for u in USERS if u["role"] == "seller"]

def write_state(state):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temporary = STATE_FILE.with_suffix(".tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temporary, STATE_FILE)

def read_state():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        write_state(initial_state())
    try:
        saved = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        saved = []
    by_username = {s.get("username"): s for s in saved if isinstance(s, dict)}
    stamp = now_iso()
    result = []
    for user in USERS:
        if user["role"] != "seller":
            continue
        current = by_username.get(user["username"])
        if current:
            current = dict(current)
            current["name"] = user["name"]
            result.append(current)
        else:
            result.append({"username": user["username"], "name": user["name"], "status": "busy", "availableSince": None, "updatedAt": stamp})
    return result

def queue_from(state):
    return sorted((s for s in state if s["status"] == "available"), key=lambda s: s.get("availableSince") or "")

def update_status(username, status):
    if status not in {"available", "busy"}:
        raise ValueError("Status inválido")
    if not any(u["username"] == username and u["role"] == "seller" for u in USERS):
        raise ValueError("Vendedor não encontrado")
    with LOCK:
        state = read_state()
        stamp = now_iso()
        for seller in state:
            if seller["username"] == username:
                seller["status"] = status
                seller["availableSince"] = stamp if status == "available" else None
                seller["updatedAt"] = stamp
                break
        write_state(state)
        return state

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"{self.client_address[0]} - {fmt % args}")

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length > 10000:
            raise ValueError("Requisição muito grande")
        return json.loads(self.rfile.read(length).decode("utf-8") or "{}")

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/users":
            self.send_json([public_user(u) for u in USERS])
        elif path == "/api/state":
            with LOCK:
                state = read_state()
            self.send_json({"sellers": state, "queue": queue_from(state)})
        elif path in {"/", "/index.html"}:
            body = HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_json({"error": "Não encontrado"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            data = self.read_json()
            if path == "/api/login":
                user = authenticate(str(data.get("username", "")), str(data.get("password", "")))
                self.send_json(user if user else {"error": "Usuário ou senha incorretos."}, 200 if user else 401)
            elif path == "/api/status":
                state = update_status(str(data.get("username", "")), str(data.get("status", "")))
                self.send_json({"sellers": state, "queue": queue_from(state)})
            else:
                self.send_json({"error": "Não encontrado"}, 404)
        except (ValueError, json.JSONDecodeError) as exc:
            self.send_json({"error": str(exc)}, 400)
        except Exception as exc:
            print("Erro:", exc)
            self.send_json({"error": "Erro interno do servidor"}, 500)

def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("=" * 58)
    print(" MEGA FEIRÃO METAL NOBRE")
    print(f" Servidor iniciado na porta {PORT}")
    print(f" Acesse: http://192.168.0.3:{PORT}")
    print(" Para encerrar, pressione Ctrl+C.")
    print("=" * 58)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrando...")
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
