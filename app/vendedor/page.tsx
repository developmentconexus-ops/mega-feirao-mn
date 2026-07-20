"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "../../lib/config";
import type { SellerState, SellerStatus } from "../../lib/store";

type StateResponse = { sellers: SellerState[]; queue: SellerState[] };

export default function SellerPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [data, setData] = useState<StateResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("mega-feirao-user");
    if (!raw) return router.replace("/");
    const saved = JSON.parse(raw) as AppUser;
    if (saved.role !== "seller") return router.replace("/");
    setUser(saved);
    void load();
    const timer = window.setInterval(() => void load(), 1000);
    return () => window.clearInterval(timer);
  }, [load, router]);

  async function changeStatus(status: SellerStatus) {
    if (!user) return;
    setSaving(true);
    await fetch("/api/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, status })
    });
    await load();
    setSaving(false);
  }

  function logout() {
    localStorage.removeItem("mega-feirao-user");
    router.replace("/");
  }

  if (!user || !data) return <main className="page center-page"><p>Carregando...</p></main>;
  const seller = data.sellers.find((item) => item.username === user.username);
  if (!seller) return <main className="page center-page"><p>Vendedor não encontrado.</p></main>;
  const position = data.queue.findIndex((item) => item.username === user.username) + 1;
  const available = seller.status === "available";

  return (
    <main className="page seller-page">
      <header className="topbar"><div><p>MEGA FEIRÃO</p><strong>Metal Nobre</strong></div><button className="link-button" onClick={logout}>Sair</button></header>
      <section className="seller-card">
        <p className="eyebrow">Olá, {seller.name}</p>
        <div className={`status-orb ${available ? "available" : "busy"}`}><span>{available ? "✓" : "●"}</span></div>
        <h1 className={available ? "green-text" : "red-text"}>{available ? "DISPONÍVEL" : "EM ATENDIMENTO"}</h1>
        <p className="status-copy">{available ? (position === 1 ? "Você é o próximo vendedor." : `Você está na posição ${position} da fila.`) : "Quando terminar, volte para o final da fila."}</p>
        <button disabled={saving} className={`action-button ${available ? "busy-button" : "available-button"}`} onClick={() => void changeStatus(available ? "busy" : "available")}>
          {saving ? "Atualizando..." : available ? "INICIAR ATENDIMENTO" : "FINALIZAR E FICAR DISPONÍVEL"}
        </button>
      </section>
    </main>
  );
}
