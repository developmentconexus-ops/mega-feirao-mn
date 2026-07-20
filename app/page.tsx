"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { USERS } from "../lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState(USERS[0].username);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function login(event: FormEvent) {
    event.preventDefault();
    const user = USERS.find((item) => item.username === username && item.pin === pin);
    if (!user) {
      setError("Senha incorreta.");
      return;
    }
    localStorage.setItem("mega-feirao-user", JSON.stringify(user));
    router.push(user.role === "seller" ? "/vendedor" : "/recepcao");
  }

  return (
    <main className="page center-page">
      <section className="login-card">
        <div className="brand-mark">MN</div>
        <p className="eyebrow">Metal Nobre apresenta</p>
        <h1>MEGA FEIRÃO</h1>
        <p className="subtitle">Organização da fila de vendedores</p>
        <form onSubmit={login} className="login-form">
          <label>
            Usuário
            <select value={username} onChange={(event) => { setUsername(event.target.value); setError(""); }}>
              {USERS.map((user) => <option key={user.username} value={user.username}>{user.name}</option>)}
            </select>
          </label>
          <label>
            Senha
            <input type="password" autoComplete="current-password" value={pin} onChange={(event) => { setPin(event.target.value); setError(""); }} placeholder="Digite sua senha" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}