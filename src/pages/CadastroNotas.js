import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function CadastroNotas() {
  const [tipo, setTipo] = useState("almoxarifado");
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [notaSelecionada, setNotaSelecionada] = useState(null);
  const [notas, setNotas] = useState([]);
  const [dataFiltro, setDataFiltro] = useState("");
const [tipoFichaFiltro, setTipoFichaFiltro] = useState("");
const [notasFiltradas, setNotasFiltradas] = useState([]);
  const [form, setForm] = useState({
    fornecedor: "", pedido: "", setor: "", parcial: "", nf: "",
    data_nf: "", valor: "", data_almoxarifado: "",
    tipo_ficha: "", data_contabilidade: "",
  });

  const limparForm = () => {
    setForm({
      fornecedor: "", pedido: "", setor: "", parcial: "", nf: "",
      data_nf: "", valor: "", data_almoxarifado: "",
      tipo_ficha: "", data_contabilidade: "",
    });
    setNotaSelecionada(null);
    setBusca("");
  };

  const nota = {
    fornecedor: form.fornecedor,
    setor: form.setor || "", // Adicionado para suportar filtro por setor
    pedido: parseInt(form.pedido) || 0,
    parcial: form.parcial ? parseInt(form.parcial) : null,
    nf: form.nf ? parseInt(form.nf) : null,
    data_nf: form.data_nf || null,
    origem: tipo,
    valor: tipo === "almoxarifado" ? (form.valor ? parseFloat(form.valor) : null) : null,
    data_almoxarifado: tipo === "almoxarifado" ? form.data_almoxarifado || null : null,
    tipo_ficha: tipo === "contabilidade" ? form.tipo_ficha : null,
    data_contabilidade: tipo === "contabilidade" ? form.data_contabilidade || null : null,
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setForm({ ...form, fornecedor: e.target.value });
  };

  const buscarSugestoes = async () => {
    if (!busca) return setSugestoes([]);
    const resultados = await invoke("buscar_fornecedores_parcial", { nomeParcial: busca });
    setSugestoes(resultados);
  };

  useEffect(() => {
    const delay = setTimeout(buscarSugestoes, 300);
    return () => clearTimeout(delay);
  }, [busca]);

  const buscarNotas = async () => {
    try {
      const resultado = await invoke("filtrar_notas", {
        origem: tipo,
        data: dataFiltro || null,
        tipoFicha: tipo === "contabilidade" ? tipoFichaFiltro : null,
      });
      setNotas(resultado);
    } catch (err) {
      alert("Erro ao buscar notas: " + err);
    }
  };

  useEffect(() => { buscarNotas(); }, [tipo]);

  const handleSalvarOuEditar = async () => {
    try {
      if (notaSelecionada?._id?.$oid) {
        await invoke("editar_nota", {
          id: notaSelecionada._id.$oid,
          novaNota: nota,
        });
        alert("Nota atualizada.");
      } else {
        await invoke("salvar_nota", { nota });
        alert("Nota salva.");
      }
      buscarNotas();
      limparForm();
    } catch (e) {
      alert("Erro: " + e);
    }
  };

  const handleExcluir = async () => {
    if (!notaSelecionada?._id?.$oid) return alert("Nota inválida.");
    if (!window.confirm("Deseja excluir esta nota?")) return;

    try {
      await invoke("excluir_nota", { id: notaSelecionada._id.$oid });
      alert("Nota excluída.");
      buscarNotas();
      limparForm();
    } catch (e) {
      alert("Erro ao excluir: " + e);
    }
  };

  const formatarData = (raw) => {
    if (!raw) return "";
    const d = new Date(
      typeof raw === "object" && raw.$date?.$numberLong
        ? parseInt(raw.$date.$numberLong)
        : raw
    );
    return !isNaN(d) ? d.toISOString().substring(0, 10) : "";
  };

  const selecionarNota = (n) => {
    setNotaSelecionada(n);
    setForm({
      fornecedor: n.fornecedor || "",
      setor: n.setor || "", // Adicionado para suportar filtro por setor
      pedido: n.pedido || "",
      parcial: n.parcial || "",
      nf: n.nf || "",
      data_nf: formatarData(n.data_nf),
      valor: n.valor || "",
      data_almoxarifado: formatarData(n.data_almoxarifado),
      tipo_ficha: n.tipo_ficha || "",
      data_contabilidade: formatarData(n.data_contabilidade),
    });
    setBusca(n.fornecedor);
  };


const imprimirRelatorio = () => {
  if (notas.length === 0) {
    alert("Nenhuma nota para imprimir.");
    return;
  }

  
  // Salvar dados no localStorage
  localStorage.setItem("dadosRelatorio", JSON.stringify(notas));
  localStorage.setItem("tipoRelatorio", tipo); // almoxarifado ou contabilidade
  localStorage.setItem("subtipoRelatorio", tipoFichaFiltro || "");

  // Abrir relatório
  if (tipo === "almoxarifado") {
    window.open("/relatorio/RelatorioNota.html", "_blank");
  } else {
    if (tipoFichaFiltro === "com_ficha") {
      window.open("/relatorio/RelatorioComFicha.html", "_blank");
    } else if (tipoFichaFiltro === "sem_ficha") {
      window.open("/relatorio/RelatorioSemFicha.html", "_blank");
    } else if (tipoFichaFiltro === "apenas_ficha") {
      window.open("/relatorio/RelatorioApenasFicha.html", "_blank");
    } else {
      alert("Selecione o tipo de ficha.");
    }
  }
};






  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex gap-4 mb-4">
        <button className={`px-4 py-2 rounded ${tipo === "almoxarifado" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTipo("almoxarifado")}>Almoxarifado</button>
        <button className={`px-4 py-2 rounded ${tipo === "contabilidade" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTipo("contabilidade")}>Contabilidade</button>
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="mb-4">
  <label className="text-sm font-medium mb-1 block">Fornecedor</label>
  <input
    type="text"
    value={busca}
    onChange={handleBuscaChange}
    placeholder="Digite para buscar"
    className="w-full p-2 border rounded"
  />
  {sugestoes.length > 0 && (
    <ul className="absolute bg-white border w-full max-h-40 overflow-auto z-10">
      {sugestoes.map((s, i) => (
        <li key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
          setForm({ ...form, fornecedor: s.nome });
          setBusca(s.nome);
          setSugestoes([]);
        }}>{s.nome}</li>
      ))}
    </ul>
  )}
</div>


<div className="mb-4">
  <label className="text-sm font-medium mb-1 block">Setor</label>
  <input
    type="text"
    name="setor"
    value={form.setor || ""}
   
    className="w-full p-2 border rounded"
    placeholder="Setor responsável"
  />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  <div>
    <label className="text-sm font-medium mb-1 block">Pedido</label>
    <input
      name="pedido"
      value={form.pedido}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
  <div>
    <label className="text-sm font-medium mb-1 block">Parcial</label>
    <input
      name="parcial"
      value={form.parcial}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
  <div>
    <label className="text-sm font-medium mb-1 block">NF</label>
    <input
      name="nf"
      value={form.nf}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
  <div>
    <label className="text-sm font-medium mb-1 block">Data NF</label>
    <input
      type="date"
      name="data_nf"
      value={form.data_nf}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
</div>



        {tipo === "almoxarifado" && (
          <>
           <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Valor</label>
            <input 
  type="number" 
  step="0.01"           // Permite decimais
  name="valor" 
  value={form.valor}
  onChange={handleChange} 
  placeholder="Valor" 
  className="border rounded p-2" 
/>         
           </div>


            <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Data Almoxarifado</label>
            <input type="date" 
            name="data_almoxarifado" 
            value={form.data_almoxarifado} 
            onChange={handleChange} 
            className="border rounded p-2" />
            </div>

          </>
        )}
        {tipo === "contabilidade" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Tipo Ficha</label>
              <select
  name="tipo_ficha"
  value={form.tipo_ficha}
  onChange={handleChange}
  className="border rounded p-2"
>
  <option value="">Selecione </option>
  <option value="com_ficha">Com Ficha</option>
  <option value="sem_ficha">Sem Ficha</option>
  <option value="apenas_ficha">Apenas Ficha</option>
</select>
            </div>


            <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Data Contabilidade</label>
            <input type="date" 
            name="data_contabilidade" 
            value={form.data_contabilidade} 
            onChange={handleChange} 
            className="border rounded p-2" />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-4">
        <button onClick={handleSalvarOuEditar} className="bg-green-600 text-white px-6 py-2 rounded">
          {notaSelecionada ? "Atualizar Nota" : "Salvar Nota"}
        </button>
        
        
        {notaSelecionada && (
          <button onClick={handleExcluir} className="bg-red-600 text-white px-6 py-2 rounded">Excluir Nota</button>
        )}
      </div>

        <br />
        <br />
        <br />

      {/* Filtros */}
<div className="mt-6 flex gap-4 items-center">
  <input
    type="date"
    value={dataFiltro}
    onChange={(e) => setDataFiltro(e.target.value)}
    className="border rounded p-2"
  />

  {tipo === "contabilidade" && (
    <select
      value={tipoFichaFiltro}
      onChange={(e) => setTipoFichaFiltro(e.target.value)}
      className="border rounded p-2"
    >
      <option value="">Todos</option>
      <option value="com_ficha">Com Ficha</option>
      <option value="sem_ficha">Sem Ficha</option>
      <option value="apenas_ficha">Apenas Ficha</option>
    </select>
  )}

  <button
    onClick={buscarNotas}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Filtrar
  </button>

<button
  onClick={imprimirRelatorio}
  className=" right-6 bg-purple-600 text-white px-4 py-2 rounded shadow-lg hover:bg-purple-700 z-50"
>
  Relatório
</button>



</div>


      {/* Tabela */}
      <div className="mt-6">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Fornecedor</th>
              <th className="border p-2">Pedido</th>
              <th className="border p-2">Parcial</th>
              <th className="border p-2">NF</th>
              <th className="border p-2">{tipo === "almoxarifado" ? "Data Almox." : "Data Contab."}</th>
              {tipo === "almoxarifado" && <th className="border p-2">Valor</th>}
              {tipo === "contabilidade" && <th className="border p-2">Tipo Ficha</th>}
            </tr>
          </thead>
          <tbody>
            {notas.map((n, i) => (
              <tr
                key={i}
                onClick={() => selecionarNota(n)}
                className={`cursor-pointer hover:bg-blue-100 ${notaSelecionada === n ? "bg-blue-200" : ""}`}
              >
                <td className="border p-2">{n.fornecedor}</td>
                <td className="border p-2">{n.pedido}</td>
                <td className="border p-2">{n.parcial}</td>
                <td className="border p-2">{n.nf}</td>
                <td className="border p-2">{formatarData(tipo === "almoxarifado" ? n.data_almoxarifado : n.data_contabilidade)}</td>
                {tipo === "almoxarifado" && (
  <td className="border p-2">
    {n.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
  </td>
)}

{tipo === "contabilidade" && (
  <td className="border p-2">{n.tipo_ficha}</td>
)}
              </tr>
            ))}



          </tbody>
          
        </table>

      </div>
    </div>
  );
}
