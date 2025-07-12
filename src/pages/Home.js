import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function Home() {
  const [certidoes, setCertidoes] = useState([]);

  async function fetchData() {
    try {
      const resultado = await invoke("listar_certidoes_a_vencer_em_30_dias");
      console.log("Resultado do Tauri:", resultado);
      setCertidoes(resultado);
    } catch (err) {
      console.error("Erro ao buscar certidões:", err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Transforma CertidaoCompleta em várias linhas por tipo de vencimento
  const linhas = certidoes.flatMap((c) => {
    const tipos = [
      { tipo: "Estadual", data: c.vencimento_estadual },
      { tipo: "Federal", data: c.vencimento_federal },
      { tipo: "Trabalhista", data: c.vencimento_trabalhista },
      { tipo: "FGTS", data: c.vencimento_fgts },
    ];

    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    return tipos
      .filter((t) => t.data)
      .map((t) => {
        const raw = t.data;
        const vencimentoStr =
          typeof raw === "object" && raw?.$date ? raw.$date : raw;

       const vencimento = new Date(vencimentoStr);
vencimento.setMinutes(vencimento.getMinutes() + vencimento.getTimezoneOffset());

        return {
          fornecedor: c.fornecedor?.replace(",", "") || "Desconhecido",
          tipo: t.tipo,
          vencimento,
        };
      })
      .filter(
        (linha) =>
          linha.vencimento >= hoje && linha.vencimento <= trintaDias
      );
  });

  // Ordena por data mais próxima
  const linhasOrdenadas = linhas.sort((a, b) => a.vencimento - b.vencimento);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">
        Certidões Próximas do Vencimento
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Fornecedor</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Vencimento</th>
            </tr>
          </thead>
          <tbody>
            {linhasOrdenadas.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  Nenhuma certidão próxima do vencimento.
                </td>
              </tr>
            ) : (
              linhasOrdenadas.map((linha, idx) => {
                const vencida = linha.vencimento < new Date();

                return (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{linha.fornecedor}</td>
                    <td className="border px-4 py-2">{linha.tipo}</td>
                    <td
                      className={`border px-4 py-2 ${
                        vencida ? "text-red-600 font-semibold" : ""
                      }`}
                    >
                      {linha.vencimento.toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
