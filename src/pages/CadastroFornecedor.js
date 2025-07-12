import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { cpf, cnpj } from "cpf-cnpj-validator";

export default function FornecedorManager() {
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarFornecedores();
  }, []);

  async function carregarFornecedores() {
 
  try {
    const resposta = await invoke("listar_fornecedores");
    setFornecedores(resposta);
  } catch (err) {
    setErro("Erro ao carregar fornecedores: " + (err?.message || JSON.stringify(err)));
  }
}

  function handleDocumentoChange(e) {
    const numeros = e.target.value.replace(/\D/g, "");
    let formatado = numeros.length <= 11 ? cpf.format(numeros) : cnpj.format(numeros);
    setDocumento(formatado);
  }




  async function enviarDados() {
    const numeros = documento.replace(/\D/g, "");
    const isCpf = numeros.length === 11 && cpf.isValid(numeros);
    const isCnpj = numeros.length === 14 && cnpj.isValid(numeros);

    if (!isCpf && !isCnpj) {
      alert("CPF ou CNPJ inválido!");
      return;
    }

    try {
      const resposta = await invoke("inserir_fornecedor", {
        fornecedor: {
          nome,
          documento,
          tipo: isCpf ? "CPF" : "CNPJ",
        },
      });
      setMensagem(resposta);
      setNome("");
      setDocumento("");
      carregarFornecedores();
    } catch (error) {
      setMensagem("Erro ao enviar dados.");
    }
  }

  const editarFornecedor = async (fornecedor) => {
    const novoNome = prompt("Novo nome:", fornecedor.nome);
    if (!novoNome) return;

    const novoDocumento = prompt("Novo documento:", fornecedor.documento);
    if (!novoDocumento) return;

    const novoTipo = prompt("Novo tipo (CPF/CNPJ):", fornecedor.tipo);
    if (!novoTipo) return;

    try {
      await invoke("editar_fornecedor", {
        documentoAntigo: fornecedor.documento,
        nome: novoNome,
        documento: novoDocumento,
        tipo: novoTipo,
      });
      alert("Fornecedor atualizado!");
      setFornecedorSelecionado(null);
      carregarFornecedores();
    } catch (err) {
      alert("Erro ao editar: " + (err?.message || JSON.stringify(err)));
    }
  };

  const excluirFornecedor = async (fornecedor) => {
    const confirmar = window.confirm(`Excluir o fornecedor ${fornecedor.nome}?`);
    if (!confirmar) return;

    try {
      await invoke("excluir_fornecedor", { documento: fornecedor.documento });
      carregarFornecedores();
      setFornecedorSelecionado(null);
    } catch (err) {
      alert("Erro ao excluir: " + (err?.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">Gerenciar Fornecedores</h1>

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        placeholder="CPF ou CNPJ"
        value={documento}
        onChange={handleDocumentoChange}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={enviarDados}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-all"
      >
        Cadastrar
      </button>

      {mensagem && <p className="text-green-600 mt-2 font-semibold">{mensagem}</p>}
      {erro && <p className="text-red-500 font-semibold mt-2">{erro}</p>}

      <h2 className="text-xl font-semibold mt-8 mb-4">Lista de Fornecedores</h2>
      {fornecedores.length === 0 ? (
        <p>Nenhum fornecedor encontrado.</p>
      ) : (
        <>
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border">Nome</th>
                <th className="px-4 py-2 text-left border">Documento</th>
                <th className="px-4 py-2 text-left border">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f, i) => (
                <tr
                  key={i}
                  onClick={() => setFornecedorSelecionado(f)}
                  className={`hover:bg-blue-100 cursor-pointer ${
                    fornecedorSelecionado === f ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-2 border">{f.nome}</td>
                  <td className="px-4 py-2 border">{f.documento}</td>
                  <td className="px-4 py-2 border">{f.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {fornecedorSelecionado && (
            <div className="mt-4">
              <p className="mb-2">
                <strong>Selecionado:</strong> {fornecedorSelecionado.nome}
              </p>
              <button
                onClick={() => editarFornecedor(fornecedorSelecionado)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
              >
                Editar
              </button>
              <button
                onClick={() => excluirFornecedor(fornecedorSelecionado)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Excluir
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
