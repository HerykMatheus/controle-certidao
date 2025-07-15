// src/Home.js
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import TabelaCertidoes from "../components/TabelaCertidoes";
import CalendarioAgenda from "../components/CalendarioAgenda";

function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Home() {
  const [certidoes, setCertidoes] = useState([]);
  const [usuario, setUsuario] = useState("");

  useEffect(() => {
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (!nomeSalvo) {
      const nome = prompt("Bem-vindo! Por favor, digite seu nome:");
      if (nome) {
        localStorage.setItem("nomeUsuario", nome);
        setUsuario(nome);
      }
    } else {
      setUsuario(nomeSalvo);
    }

    async function fetchData() {
      try {
        const resultado = await invoke("listar_certidoes_a_vencer_em_30_dias");
        setCertidoes(resultado);
      } catch (err) {
        console.error("Erro ao buscar certidões:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="h-screen flex flex-col p-4 gap-4 bg-gray-50 overflow-hidden">
      <h2 className="text-2xl font-semibold text-gray-700">
        {getSaudacao()}, {usuario}!
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        <TabelaCertidoes certidoes={certidoes} />
        <CalendarioAgenda />
      </div>
    </div>
  );
}