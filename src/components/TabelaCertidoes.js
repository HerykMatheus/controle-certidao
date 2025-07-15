// src/components/TabelaCertidoes.js
import React from "react";

export default function TabelaCertidoes({ certidoes }) {
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
        const vencimentoStr = typeof raw === "object" && raw?.$date ? raw.$date : raw;
        const vencimento = new Date(vencimentoStr);
        vencimento.setMinutes(vencimento.getMinutes() + vencimento.getTimezoneOffset());

        return {
          fornecedor: c.fornecedor?.replace(",", "") || "Desconhecido",
          tipo: t.tipo,
          vencimento,
        };
      })
      .filter((linha) => linha.vencimento >= hoje && linha.vencimento <= trintaDias);
  });

  const linhasOrdenadas = linhas.sort((a, b) => a.vencimento - b.vencimento);

  return (
    <div className="flex-1 bg-white rounded shadow p-4 overflow-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800">📅 Certidões a Vencer</h3>
      <table className="min-w-full text-sm text-left text-gray-700 border">
        <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-2">Fornecedor</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Vencimento</th>
          </tr>
        </thead>
        <tbody>
          {linhasOrdenadas.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                Nenhuma certidão próxima do vencimento.
              </td>
            </tr>
          ) : (
            linhasOrdenadas.map((linha, idx) => {
              const vencida = linha.vencimento < new Date();
              return (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{linha.fornecedor}</td>
                  <td className="px-4 py-2">{linha.tipo}</td>
                  <td className={`px-4 py-2 ${vencida ? "text-red-600 font-semibold" : ""}`}>
                    {linha.vencimento.toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}