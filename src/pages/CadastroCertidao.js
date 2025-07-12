import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function CadastroCertidao() {
  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [arquivos, setArquivos] = useState(null);

  const [form, setForm] = useState({
    fornecedor: "",
    pedido: "",
    parcial: "",
    data_pedido: "",
    cartao_cnpj: "",
    estadual: "",
    vencimento_estadual: "",
    trabalhista: "",
    vencimento_trabalhista: "",
    federal: "",
    vencimento_federal: "",
    fgts: "",
    vencimento_fgts: "",
  });

  const addDays = (dateStr, days) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (form.trabalhista)
      setForm((f) => ({
        ...f,
        vencimento_trabalhista: addDays(form.trabalhista, 180),
      }));
  }, [form.trabalhista]);

  useEffect(() => {
    if (form.federal)
      setForm((f) => ({ ...f, vencimento_federal: addDays(form.federal, 180) }));
  }, [form.federal]);

  useEffect(() => {
    if (form.estadual)
      setForm((f) => ({ ...f, vencimento_estadual: addDays(form.estadual, 180) }));
  }, [form.estadual]);

  useEffect(() => {
    if (form.fgts)
      setForm((f) => ({ ...f, vencimento_fgts: addDays(form.fgts, 29) }));
  }, [form.fgts]);

  useEffect(() => {
    if (!busca) {
      setSugestoes([]);
      return;
    }

    

    const fetchSugestoes = async () => {
      try {
        const resultados = await invoke("buscar_fornecedores_parcial", {
          nomeParcial: busca,
        });
        setSugestoes(resultados);
        setFornecedores(resultados);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
      }
    };




    
    const debounce = setTimeout(fetchSugestoes, 300);
    return () => clearTimeout(debounce);
  }, [busca]);

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setForm({ ...form, fornecedor: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const normalizeDate = (str) => {
    if (!str) return null;
    const date = new Date(`${str}T00:00:00Z`);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  const salvar = async () => {
    if (!form.fornecedor || !form.pedido) {
      alert("Preencha o nome do fornecedor e o número do pedido.");
      return;
    }

    let links = [];


    const parsedForm = {
      fornecedor: form.fornecedor,
      pedido: parseInt(form.pedido),
      parcial: parseInt(form.parcial),
      data_pedido: normalizeDate(form.data_pedido),
      cartao_cnpj: normalizeDate(form.cartao_cnpj),
      estadual: normalizeDate(form.estadual),
      vencimento_estadual: normalizeDate(form.vencimento_estadual),
      trabalhista: normalizeDate(form.trabalhista),
      vencimento_trabalhista: normalizeDate(form.vencimento_trabalhista),
      federal: normalizeDate(form.federal),
      vencimento_federal: normalizeDate(form.vencimento_federal),
      fgts: normalizeDate(form.fgts),
      vencimento_fgts: normalizeDate(form.vencimento_fgts),
      pdf_links: links,
    };

    try {
      const res = await invoke("inserir_certidao_completa", { input: parsedForm });
      alert(res);
      setForm({
        fornecedor: "",
        pedido: "",
        parcial: "",
        data_pedido: "",
        cartao_cnpj: "",
        estadual: "",
        vencimento_estadual: "",
        trabalhista: "",
        vencimento_trabalhista: "",
        federal: "",
        vencimento_federal: "",
        fgts: "",
        vencimento_fgts: "",
      });
      setArquivos(null);
      setBusca("");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar certidão: " + err);
    }
  };

  const cadastrarFornecedor = async () => {
    try {
      await invoke("inserir_fornecedor", { nome: busca });
      setMostrarModal(false);
      alert("Fornecedor cadastrado com sucesso!");
      setFornecedores((prev) => [...prev, { nome: busca }]);
    } catch (error) {
      alert("Erro ao cadastrar fornecedor: " + error);
    }
  };

  return (
    <>
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Cadastrar novo fornecedor</h2>
            <p className="mb-4">
              Deseja cadastrar o fornecedor <strong>{busca}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  setMostrarModal(false);
                  // Aqui lógica pra cadastrar fornecedor (futuramente)
                }}
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md font-sans relative">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Cadastrar Certidão</h2>

        <label className="block font-semibold mb-1">Fornecedor</label>
        <div className="relative">
          <input
            type="text"
            value={busca}
            onChange={handleBuscaChange}
            placeholder="Digite para buscar fornecedor"
            autoComplete="off"
            className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {busca && sugestoes.length > 0 && (
            <ul className="border border-gray-300 rounded bg-white max-h-40 overflow-y-auto shadow-md z-10 absolute w-full mt-1">
              {sugestoes.map((sugestao, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                  onClick={() => {
                    setBusca(sugestao.nome);
                    setForm({ ...form, fornecedor: sugestao.nome });
                    setSugestoes([]);
                  }}
                >
                  {sugestao.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        {busca &&
          !fornecedores.some((f) => f.nome?.toLowerCase() === busca.toLowerCase()) && (
            <div className="mt-2 text-red-600 text-sm font-semibold">
              Fornecedor não encontrado.
              <button
                onClick={() => setMostrarModal(true)}
                className="underline text-blue-600 hover:text-blue-800 ml-1"
              >
                Deseja cadastrar?
              </button>
            </div>
          )}

        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Pedido</label>
            <input
              type="number"
              name="pedido"
              value={form.pedido}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Parcial</label>
            <input
              type="number"
              name="parcial"
              value={form.parcial}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Data Pedido</label>
            <input
              type="date"
              name="data_pedido"
              value={form.data_pedido}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

<div className="mt-4">
  <label className="block font-semibold mb-1">Cartão CNPJ</label>
  <input
    type="date"
    name="cartao_cnpj"
    value={form.cartao_cnpj}
    onChange={handleChange}
    className="w-full p-2 border border-gray-300 rounded"
  />
</div>



        {[
  {
    label1: "Estadual",
    name1: "estadual",
    label2: "Vencimento Estadual",
    name2: "vencimento_estadual",
  },
  {
    label1: "Trabalhista",
    name1: "trabalhista",
    label2: "Vencimento Trabalhista",
    name2: "vencimento_trabalhista",
  },
  {
    label1: "Federal",
    name1: "federal",
    label2: "Vencimento Federal",
    name2: "vencimento_federal",
  },
  {
    label1: "FGTS",
    name1: "fgts",
    label2: "Vencimento FGTS",
    name2: "vencimento_fgts",
  },
].map(({ label1, name1, label2, name2 }) => (
  <div key={name1} className="mt-4 flex gap-4">
    <div className="flex-1">
      <label className="block font-semibold mb-1">{label1}</label>
      <input
        type="date"
        name={name1}
        value={form[name1]}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
    <div className="flex-1">
      <label className="block font-semibold mb-1">{label2}</label>
      <input
        type="date"
        name={name2}
        value={form[name2]}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  </div>
))}


        <button
          onClick={salvar}
          className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
        >
          Salvar Certidão
        </button>
      </div>
    </>
  );
}
