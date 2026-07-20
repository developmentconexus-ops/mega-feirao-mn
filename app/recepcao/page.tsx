"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "../../lib/config";
import type { SellerState } from "../../lib/store";

type StateResponse = { sellers: SellerState[]; queue: SellerState[] };

function waitingTime(iso: string | null) {
  if (!iso) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return minutes < 1 ? "agora" : `há ${minutes} min`;
}

export default function ReceptionPage() {
  const router = useRouter();
  const [data, setData] = useState<StateResponse | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("mega-feirao-user");
    if (!raw) return router.replace("/");
    const saved = JSON.parse(raw) as AppUser;
    if (saved.role !== "reception" && saved.role !== "viewer") return router.replace("/");
    void load();
    const timer = window.setInterval(() => void load(), 1000);
    return () => window.clearInterval(timer);
  }, [load, router]);

  function logout() {
    localStorage.removeItem("mega-feirao-user");
    router.replace("/");
  }

  if (!data) return <main className="page center-page"><p>Carregando...</p></main>;
  const busy = data.sellers.filter((seller) => seller.status === "busy");
  const next = data.queue[0];

  return (
    <main className="page reception-page">
      <header className="topbar"><div><p>MEGA FEIRÃO</p><strong>Metal Nobre</strong></div><button className="link-button" onClick={logout}>Sair</button></header>
      <section className="dashboard">
        <div className="next-card">
          <p className="eyebrow">PRÓXIMO VENDEDOR</p>
          {next ? <><div className="pulse-dot"/><h1>{next.name}</h1><p>Disponível {waitingTime(next.availableSince)}</p></> : <><h1>Nenhum disponível</h1><p>Aguarde um vendedor finalizar o atendimento.</p></>}
        </div>
        <div className="columns">
          <section className="list-card"><div className="list-title"><h2>Fila de disponíveis</h2><span className="count green-count">{data.queue.length}</span></div>
            <div className="seller-list">{data.queue.length === 0 ? <p className="empty">Fila vazia</p> : data.queue.map((seller, index) => <article className="seller-row" key={seller.username}><span className="position">{index + 1}</span><div><strong>{seller.name}</strong><small>Disponível {waitingTime(seller.availableSince)}</small></div><span className="status-dot available-dot"/></article>)}</div>
          </section>
          <section className="list-card"><div className="list-title"><h2>Em atendimento</h2><span className="count red-count">{busy.length}</span></div>
            <div className="seller-list">{busy.length === 0 ? <p className="empty">Todos estão disponíveis</p> : busy.map((seller) => <article className="seller-row" key={seller.username}><div className="avatar">{seller.name.slice(0, 1)}</div><div><strong>{seller.name}</strong><small>Em atendimento</small></div><span className="status-dot busy-dot"/></article>)}</div>
          </section>
        </div>
      </section>
    </main>
  );
}