import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuscaCertidoes from "./BuscaCertidoes";
import CadastroCertidao from "./CadastroCertidao";
import { invoke } from "@tauri-apps/api/core";

export default function CheckList() {
  const [tipoCompra, setTipoCompra] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [inputsExtras, setInputsExtras] = useState([{ pedido: "", parcial: "", nf: "" }]);
  const [ata, setAta] = useState(false);
  const [checksSelecionados, setChecksSelecionados] = useState([]);
  const [camposExtras, setCamposExtras] = useState(Array(9).fill(""));

  const [abrirModalBusca, setAbrirModalBusca] = useState(false);
  const [abrirCadastroCertidao, setAbrirCadastroCertidao] = useState(false);

  const [camposTipoCompra, setCamposTipoCompra] = useState({});

const [pedidoAtrelado, setPedidoAtrelado] = useState("");
const [parcialAtrelado, setParcialAtrelado] = useState("");


const [setor, setSetor] = useState("");
const [sugestoesSetor, setSugestoesSetor] = useState([]);


  const navigate = useNavigate();

  const camposPorTipo = {
    "Compra Direta": ["Cotação", "Dispensa"],
    "Pregão": ["Pregão", "Contrato"],
    "Contrato": ["Dispensa", "Contrato", "Inexigibilidade"],
    "Merenda": ["Pregão", "Dispensa", "Contrato"],
  };

  const checksPorTipo = {
    "Compra Direta": [
      "Capa E-mail",
      "Ratificação",
      "Portaria",
      "Pedido",
      "Enviar Pedido Fornecedor e Setor Requisitante",
      "Nota Fiscal(Assinada)",
      "Relatório de Fiscalização",
    ],
    "Pregão": [
      "Oficio com Justificativa",
      "Pedido",
      "Enviar Pedido e Setor Requisitante",
      "Nota Fiscal(Assinada)",
      "Certidão",
      "Relatório de Fiscalização",
    ],
    "Contrato": [
      "Oficio com Justificativa",
      "Carimbo com Autorização",
      "Pedido",
      "Enviar Pedido Fornecedor e Setor Requisitante",
      "Nota Fiscal(Assinada)",
      "Certidão",
      "Relatório de Fiscalização",
    ],
    "Merenda": [
      "Oficio com Justificativa",
      "Carimbo com Autorização",
      "Autorização Sec. Social",
      "Autorização Sec. Educação",
      "Pedido",
      "Enviar Pedido e Setor Requisitante",
      "Certidão",
      "Nota Fiscal(Assinada)",
      "Relatório de Fiscalização",
      "Comprovante de Entrega",
    ],
  };

  const adicionarLinha = () => {
    setInputsExtras([...inputsExtras, { pedido: "", parcial: "", nf: "" }]);
  };

  const updateCampoExtra = (index, valor) => {
    const atualizados = [...camposExtras];
    atualizados[index] = valor;
    setCamposExtras(atualizados);
  };

  const handleInputExtraChange = (index, campo, valor) => {
    const novos = [...inputsExtras];
    novos[index][campo] = valor;
    setInputsExtras(novos);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Check List</h2>

      {/* Tipo de Compra */}
      <div>
        <label className="font-medium">Tipo</label>
        <div className="flex gap-4 mt-2">
          {["Compra Direta", "Pregão", "Contrato", "Merenda"].map((tipo) => (
            <label key={tipo} className="flex items-center gap-1">
              <input
                type="radio"
                value={tipo}
                checked={tipoCompra === tipo}
               onChange={() => {
  setTipoCompra(tipo);
  setCamposTipoCompra({}); // limpa os inputs da seção camposPorTipo
}}
              />
              {tipo}
            </label>
          ))}
          <label className="ml-auto flex items-center gap-1">
            <input type="checkbox" checked={ata} onChange={(e) => setAta(e.target.checked)} /> ATA
          </label>
        </div>

        {/* Campos por tipo */}
        {tipoCompra && (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
    {(camposPorTipo[tipoCompra] || []).map((campo) => (
      <input
        key={campo}
        placeholder={campo}
        value={camposTipoCompra[campo] || ""}
        onChange={(e) =>
          setCamposTipoCompra((prev) => ({ ...prev, [campo]: e.target.value }))
        }
        className="border p-2 rounded"
      />
    ))}
  </div>
)}
      </div>

      {/* Setor */}
<div>
  <label className="font-medium">Setor</label>
  <div className="relative">
    <input
      className="border w-full p-2 rounded mt-1"
      placeholder="Setor responsável"
      value={setor}
      onChange={(e) => {
        setSetor(e.target.value);
        setTimeout(() => {
          if (e.target.value.length >= 2) {
            invoke("buscar_setores_parcial", {
              nomeParcial: e.target.value,
            })
              .then((res) => {
                setSugestoesSetor(res.map((s) => s.nome));
              })
              .catch(() => setSugestoesSetor([]));
          } else {
            setSugestoesSetor([]);
          }
        }, 300);
      }}
    />
    {sugestoesSetor.length > 0 && (
      <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
        {sugestoesSetor.map((nome, i) => (
          <li
            key={i}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSetor(nome);
              setSugestoesSetor([]);
            }}
          >
            {nome}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

      {/* Fornecedor */}
     <div>
        <label className="font-medium">Fornecedor</label>
        <div className="flex gap-2">
          <input
            className="border w-full p-2 rounded"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            placeholder="Nome do fornecedor"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setAbrirModalBusca(true)}
          >
            Buscar Certidões
          </button>
        </div>
      </div>

      

      {/* OBJ */}
      <div>
        <label className="font-medium">OBJ</label>
        <textarea className="border w-full p-2 rounded mt-1" placeholder="Descreva o objeto..." />
      </div>

      {/* Checks */}
      {tipoCompra && (
        <div>
          <label className="font-medium">Checklist</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {checksPorTipo[tipoCompra]?.map((check) => (
              <label key={check} className="flex items-center gap-2">
               <input
  type="checkbox"
  value={check}
  onChange={(e) => {
    const checked = e.target.checked;
    const value = e.target.value;

    setChecksSelecionados((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  }}
/> {check}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Certidões escolhidas */}
      <div>
        <label className="font-medium">Certidões Válidas</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {["Cartão CNPJ", "Estadual", "Venc. Estadual", "Trabalhista", "Venc. Trabalhista", "Federal", "Venc. Federal", "FGTS", "Venc. FGTS"]
            .map((label, i) => (
              <input
                key={i}
                className="border p-2 rounded"
                value={camposExtras[i] || ""}
                onChange={(e) => updateCampoExtra(i, e.target.value)}
                placeholder={label}
              />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
  <input
    className="border p-2 rounded"
    value={pedidoAtrelado}
    readOnly
    placeholder="Pedido Atrelado"
  />
  <input
    className="border p-2 rounded"
    value={parcialAtrelado}
    readOnly
    placeholder="Parcial Atrelado"
  />
</div>

      {/* Pedidos, Parciais, NF */}
      <div>
        <label className="font-medium">Pedidos</label>
        {inputsExtras.map((inp, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mt-2">
            <input
              placeholder="Pedido"
              value={inp.pedido}
              onChange={(e) => handleInputExtraChange(i, "pedido", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              placeholder="Parcial"
              value={inp.parcial}
              onChange={(e) => handleInputExtraChange(i, "parcial", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              placeholder="NF"
              value={inp.nf}
              onChange={(e) => handleInputExtraChange(i, "nf", e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        ))}
        <button onClick={adicionarLinha} className="mt-2 px-4 py-1 text-sm bg-gray-200 rounded">+1</button>
      </div>

      <div className="mt-4">
       <button
  className="bg-green-600 text-white px-6 py-2 rounded"
  onClick={() => {
const dadosChecklist = {
  tipoCompra,
  fornecedor,
  ata,
  setor: document.querySelector("input[placeholder='Setor responsável']")?.value || "",
  obj: document.querySelector("textarea[placeholder='Descreva o objeto...']")?.value || "",
  inputsExtras,
  pedidoAtrelado,
  parcialAtrelado,
  camposExtras: [
    "Cartão CNPJ",
    "Estadual",
    "Venc. Estadual",
    "Trabalhista",
    "Venc. Trabalhista",
    "Federal",
    "Venc. Federal",
    "FGTS",
    "Venc. FGTS",
  ].map((placeholder) =>
    document.querySelector(`input[placeholder='${placeholder}']`)?.value || ""
  ),
  checksMarcados: checksSelecionados,
camposTipoCompra: camposTipoCompra,
};

    localStorage.setItem("dadosChecklist", JSON.stringify(dadosChecklist));
    window.open("relatorio/relatorio-checklist.html", "_blank");
  }}
>
  Gerar Checklist
</button>
      </div>

{abrirModalBusca && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
      <BuscaCertidoes
         onSelecionarCertidao={(dadosSelecionados) => {
    if (dadosSelecionados) {
      // Preenche Pedido e Parcial no primeiro slot da lista
      const novosInputs = [...inputsExtras];
        setFornecedor(dadosSelecionados.fornecedor || "");
      setPedidoAtrelado(dadosSelecionados.pedido?.toString() || "");
setParcialAtrelado(dadosSelecionados.parcial?.toString() || "");


      // Preenche os camposExtras com os valores vindos do modal
      if (dadosSelecionados.camposExtras?.length === 9) {
        setCamposExtras(
  dadosSelecionados.camposExtras.map(data => {
    const d = new Date(data);
    return isNaN(d.getTime()) ? data : d.toLocaleDateString("pt-BR");
  })
);
      }
    }
    setAbrirModalBusca(false);
        }}
        onFechar={() => setAbrirModalBusca(false)}
onAtualizarCertidao={() => {
  setAbrirModalBusca(false);
  navigate("/certidao"); // ✅ Redireciona para a tela CadastroCertidao
}}
      />
    </div>
  </div>
)}

{abrirCadastroCertidao && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
      <CadastroCertidao
        onFechar={() => setAbrirCadastroCertidao(false)}
      />
    </div>
  </div>
)}

    </div>
  );
}