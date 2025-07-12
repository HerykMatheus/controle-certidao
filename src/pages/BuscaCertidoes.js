import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function BuscaCertidoes({ onSelecionarCertidao, onFechar, onAtualizarCertidao }) {
  const [fornecedor, setFornecedor] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [resultado, setResultado] = useState(null);
  

  useEffect(() => {
    const delayBusca = setTimeout(() => {
      if (fornecedor.length >= 2) {
        invoke("buscar_fornecedores_parcial", { nomeParcial: fornecedor })
          .then((res) => {
            setSugestoes(res.map((f) => f.nome)); // Assumindo que o campo é `nome`
          })
          .catch(() => setSugestoes([]));
      } else {
        setSugestoes([]);
      }
    }, 300);

    return () => clearTimeout(delayBusca);
  }, [fornecedor]);

  const buscarCertidoes = async () => {
    try {
      const response = await invoke("buscar_ultima_certidao", {
        nomeFornecedor: fornecedor,
      });
      setResultado(response);
    } catch (err) {
      console.error("Erro ao buscar certidões:", err);
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";
    const d = new Date(data);
    return `${d.getUTCDate().toString().padStart(2, "0")}/${(d.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getUTCFullYear()}`;
  };

  const isVencida = (vencimento) => {
    if (!vencimento) return false;
    const hoje = new Date();
    const data = new Date(vencimento);
    return data < hoje;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Buscar Certidões do Fornecedor</h2>

      <div className="relative">
        <input
          className="border p-2 rounded w-full"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          placeholder="Nome do fornecedor"
        />
        {sugestoes.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
            {sugestoes.map((nome, i) => (
              <li
                key={i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setFornecedor(nome);
                  setSugestoes([]);
                }}
              >
                {nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={buscarCertidoes}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
      >
        Buscar
      </button>

      {resultado && (
        <div className="space-y-4 border p-4 rounded shadow mt-4 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold">Pedido:</label>
              <div>{resultado.pedido}</div>
            </div>
            <div>
              <label className="font-bold">Parcial:</label>
              <div>{resultado.parcial}</div>
            </div>
            <div>
  <label className="font-bold">Fornecedor:</label>
  <div>{resultado.fornecedor || "Não informado"}</div>
</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Cartão CNPJ", field: "cartao_cnpj" },
              {
                label: "Estadual",
                field: "estadual",
                venc: "vencimento_estadual",
              },
              {
                label: "Trabalhista",
                field: "trabalhista",
                venc: "vencimento_trabalhista",
              },
              {
                label: "Federal",
                field: "federal",
                venc: "vencimento_federal",
              },
              { label: "FGTS", field: "fgts", venc: "vencimento_fgts" },
            ].map(({ label, field, venc }) => {
              const vencida = isVencida(resultado[venc]);
              return (
                <div
                  key={field}
                  className={`p-3 rounded border ${
                    vencida
                      ? "bg-red-100 border-red-500"
                      : "bg-green-100 border-green-500"
                  }`}
                >
                  <div>
                    <strong>{label}:</strong>{" "}
                    {formatarData(resultado[field])}
                  </div>
                  {venc && (
                    <div>
                      <strong>Vencimento:</strong>{" "}
                      {formatarData(resultado[venc])}
                    </div>
                  )}
                  {vencida && (
                    <div className="text-red-600 mt-1">
                      Esta certidão está vencida. Deseja atualizar?{" "}
                      <button
  className="text-blue-700 underline ml-1"
  onClick={() => {
    onFechar(); // fecha o modal atual
    onAtualizarCertidao(); // chama o método do pai para abrir a tela de cadastro
  }}
>
  Sim
</button>
                    </div>
                  )}
                  
                </div>
              );
            })}
            
          </div>
        </div>
      )}
      <button
  onClick={() => {
    if (resultado) {
      onSelecionarCertidao({
        fornecedor: resultado.fornecedor,
        pedido: resultado.pedido,
        parcial: resultado.parcial,
        camposExtras: [
          resultado.cartao_cnpj,
          resultado.estadual,
          resultado.vencimento_estadual,
          resultado.trabalhista,
          resultado.vencimento_trabalhista,
          resultado.federal,
          resultado.vencimento_federal,
          resultado.fgts,
          resultado.vencimento_fgts,
        ]
      });
    }
  }}
  className="bg-green-600 text-white px-4 py-2 rounded mt-4"
>
  Selecionar
</button>
    </div>
  );
}
