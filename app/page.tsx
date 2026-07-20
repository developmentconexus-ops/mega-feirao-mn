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
      setError("PIN incorreto.");
      return;
    }
    localStorage.setItem("mega-feirao-user", JSON.stringify(user));
    router.push(user.role === "reception" ? "/recepcao" : "/vendedor");
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
            PIN
            <input inputMode="numeric" maxLength={4} value={pin} onChange={(event) => { setPin(event.target.value.replace(/\D/g, "")); setError(""); }} placeholder="0000" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
