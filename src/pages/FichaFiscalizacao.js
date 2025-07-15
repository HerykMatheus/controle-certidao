import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { invoke } from "@tauri-apps/api/core";




pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function FichaFiscalizacao() {
  const [info, setInfo] = useState({});
  const [itens, setItens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [portariaData, setPortariaData] = useState({
    tipo: "",
    numero: "",
    ata: "",
    processo: "",
    portaria: "",
    fiscais: [],
  });
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    tipoBusca: "",
    numeroBusca: "",
    encontrado: false,
    id: "",
    ata: "",
    processo: "",
    portaria: "",
    fiscais: [],
  });

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setLoading(true);
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        text += strings.join(" ") + "\n";
      }
      extrairInformacoes(text);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

const extrairInformacoes = (txt) => {
  const fornecedor = txt.match(/Fornecedor:\s*(.*?)(?=\s{2,}|Pedido:)/s)?.[1]?.trim() || "";
  const pedido = txt.match(/Pedido(?: Parcial)?:\s*([0-9\-/]+)/i)?.[1] || "";
  const modalidadeRaw = txt.match(/Modalidade:\s*(.*?)(?=\s{2,}|Processo:)/s)?.[1]?.trim() || "";

  // Detectar tipo de compra com base no conteúdo
  const tipo = modalidadeRaw.toLowerCase().includes("dispensa")
    ? "Dispensa"
    : "Pregão";

  const modalidade = modalidadeRaw.match(/\d{1,4}\/\d{4}/)?.[0] || modalidadeRaw;

  const localEntregaRaw = txt.match(/Local de Entrega:\s*(.+?)(?=\s+Fone:|Fornecedor:|Cnpj\/Cpf:|$)/)?.[1]?.trim() || "";
  const localEntrega = localEntregaRaw.split(",")[0].trim();

  const inicioItensIndex = txt.search(/Item\s+Quantidade\s+Unidade/i);
  const textoItens = inicioItensIndex !== -1 ? txt.slice(inicioItensIndex) : "";

  const regexItens = /(\d{1,3}(?:[.,]\d{2,6})?)\s+([A-Z]{2,})\s+(.*?)(?=\d{4}\s+\d{1,3}(?:[.,]\d{2,})|\n|$)/gs;

  const itens = [];
  let match;
  while ((match = regexItens.exec(textoItens)) !== null) {
    const quantidade = match[1].replace(",", ".");
    const unidade = match[2].replace(/\b(Prefeitura|Municipal|Tupi\s*Paulista|NovoServ)\b/gi, "");
    let descricao = match[3]
      .replace(/^\d{2}\.\d{4}-\d\s*/g, "") // Remove código do início
      .replace(/\d{4}\s+\d{1,3}(?:[.,]\d{2,})\s+\d{1,3}(?:[.,]\d{2,})/, "") // Remove números repetidos
      .replace(/\b(Secretaria\s*de\s*Administração|Prefeitura|Municipal\s*de\s*Tupi\s*Paulista|NovoServ)\b/gi, "") // Remove palavras fixas
      .replace(/\b(Exercício:\s*2025|Pedido\s*de\s*Compra\s*Global\s*-\s*Analítico|Seção\s*de\s*Compras)\b/gi, "")
      .replace(/\b(Item|Quantidade|Unidade|Cd.\s*Produto|Descrição\s*do\s*Produto|Valor\s*Unitário|Valor\s*Total)\b/gi, "")
      .replace(/\b(Exercício:\s*2025|Pedido\s*de\s*Compra\s*Prcial\s*-\s*Analítico|Seção\s*de\s*Compras)\b/gi, "")
      .replace(/\s{2,}/g, " ") // Remove espaços duplicados
      .trim();

    itens.push({ quantidade, unidade, descricao });
  }

  

  setInfo({ fornecedor, pedido, modalidade, localEntrega, tipo, itens });
  setItens(itens);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPortariaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/portarias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portariaData),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      alert("✅ Portaria cadastrada!");
      setShowModal(false);
      setPortariaData({ tipo: "", numero: "", ata: "", processo: "" });
    } catch (err) {
      alert("Erro ao salvar portaria.");
    }
  };


  const updateFG = (idx, campo, valor) => {
  const novos = [...editData.fiscais];
  novos[idx][campo] = valor;
  setEditData({ ...editData, fiscais: novos });
};



const handleSalvarEdicao = async () => {
  try {
    const payload = {
      tipo: editData.tipoBusca,
      numero: editData.numeroBusca,
      ata: editData.ata || "",
      processo: editData.processo,
      portaria: editData.portaria,
      fiscais: editData.fiscais,
    };

    const res = await fetch(`http://localhost:3001/api/portarias/${editData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erro ao salvar");

    alert("✅ Portaria atualizada!");
    setShowEditModal(false);
  } catch (err) {
    alert("Erro ao atualizar portaria.");
  }
};



 const inserir_portaria = async () => {
    try {
      await invoke("inserir_portaria", {
        portaria: portariaData,
      });
      alert("✅ Portaria salva!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao salvar portaria.");
    }
  };





const buscar_portaria = async () => {
  try {
    const tipo = editData.tipoBusca;
    let numero = editData.numeroBusca;

    // Tenta extrair número se estiver junto do texto
    const numeroExtraido = numero.match(/\d{1,4}\/\d{4}/)?.[0] || numero;

    console.log("🔍 Buscando portaria:", { tipo, numero: numeroExtraido });

    const dados = await invoke("buscar_portaria", {
      tipo,
      numero: numeroExtraido,
    });

    setEditData({
      ...editData,
      encontrado: true,
      id: dados._id?.$oid || "",
      ata: dados.ata || "",
      processo: dados.processo || "",
      portaria: dados.portaria || "",
      fiscais: dados.fiscais || [],
    });
  } catch (err) {
    alert("Erro ao buscar portaria");
    console.error("❌ Erro buscar_portaria:", err);
  }
};

const editar_portaria = async () => {
  try {
    await invoke("editar_portaria", {
      id: editData.id,
      nova: {
        tipo: editData.tipoBusca,
        numero: editData.numeroBusca,
        ata: editData.ata,
        processo: editData.processo,
        portaria: editData.portaria,
        fiscais: editData.fiscais,
      },
    });
    alert("✅ Portaria atualizada!");
    setShowEditModal(false);
  } catch (err) {
    alert("Erro ao editar portaria");
    console.error(err);
  }
};

const excluir_portaria = async () => {
  try {
    await invoke("excluir_portaria", { id: editData.id });
    alert("✅ Portaria excluída!");
    setShowEditModal(false);

    // Limpa todos os campos do formulário
    setEditData({
      tipoBusca: "",
      numeroBusca: "",
      encontrado: false,
      id: "",
      ata: "",
      processo: "",
      portaria: "",
      fiscais: [],
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir portaria");
  }
};



const gerarFichaComPortaria = async () => {
  try {
    const tipo = info.modalidade.toLowerCase().includes("dispensa") ? "Dispensa" : "Pregão";
    const numero = info.modalidade;

    // Buscar portaria pelo tipo e número
    const portaria = await invoke("buscar_portaria", { tipo, numero });

    // Verifica se existe fiscal específico para o local
    const fiscalMatch =
      portaria.fiscais.find((fg) =>
        fg.local?.toLowerCase() === info.localEntrega?.toLowerCase()
      ) ||
      portaria.fiscais.find((fg) =>
        fg.local?.toLowerCase() === "todos"
      );

    // Adiciona dados da portaria ao localStorage
    const dadosCompletos = {
      ...info,
      numero_portaria: portaria.portaria,
      ata: portaria.ata,
      processo: portaria.processo,
      fiscal: fiscalMatch?.fiscal || "",
      gestor: fiscalMatch?.gestor || "",
    };

    localStorage.setItem("dadosFicha", JSON.stringify(dadosCompletos));

    if (tipo === "Dispensa") {
      window.open("relatorio/ficha-dispensa.html", "_blank");
    } else {
      window.open("relatorio/ficha-pregao.html", "_blank");
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao buscar dados da portaria para gerar ficha");
  }
};




 return (
  <div className="p-6">
    <button onClick={() => setShowModal(true)} className="bg-gray-600 text-white px-3 py-1 text-sm rounded mb-4">
      Cadastrar Portaria
    </button>
    <button
      onClick={() => setShowEditModal(true)}
      className="bg-yellow-600 text-white px-3 py-1 text-sm rounded ml-2"
    >
      Editar Portaria
    </button>

    <h2 className="text-xl font-bold mb-4">Ficha de Fiscalização</h2>
    <input type="file" accept="application/pdf" onChange={handlePDFUpload} />

    {loading && <p className="text-blue-600 mt-2">⏳ Lendo PDF...</p>}

    {info.fornecedor && (
      <div className="mt-4 space-y-2">
        <p><strong>Fornecedor:</strong> {info.fornecedor}</p>
        <p><strong>Pedido:</strong> {info.pedido}</p>
        <p><strong>Modalidade:</strong> {info.modalidade}</p>
        <p><strong>Local de Entrega:</strong> {info.localEntrega}</p>
      </div>
    )}

    {itens.length > 0 && (
      <div className="mt-6">
        <strong>Itens:</strong>
        <table className="mt-2 w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Qtd</th>
              <th className="border p-2">Unid</th>
              <th className="border p-2">Descrição</th>
            </tr>
          </thead>
<tbody>
  {itens.map((item, idx) => (
    <tr key={idx}>
      {/* Quantidade */}
      <td className="border p-1 align-top w-[100px]">
        <input
          type="text"
          value={item.quantidade}
          onChange={(e) => {
            const novosItens = [...itens];
            novosItens[idx].quantidade = e.target.value;
            setItens(novosItens);
            setInfo((prev) => ({ ...prev, itens: novosItens }));
          }}
          className="w-full border px-1 py-0.5 rounded text-sm"
        />
      </td>

      {/* Unidade */}
      <td className="border p-1 align-top w-[80px]">
        <input
          type="text"
          value={item.unidade}
          onChange={(e) => {
            const novosItens = [...itens];
            novosItens[idx].unidade = e.target.value;
            setItens(novosItens);
            setInfo((prev) => ({ ...prev, itens: novosItens }));
          }}
          className="w-full border px-1 py-0.5 rounded text-sm"
        />
      </td>

      {/* Descrição */}
      <td className="border p-1 relative w-[75%]">
        <textarea
          value={item.descricao}
          onChange={(e) => {
            const novosItens = [...itens];
            novosItens[idx].descricao = e.target.value;
            setItens(novosItens);
            setInfo((prev) => ({ ...prev, itens: novosItens }));
          }}
          rows={4}
          className="w-full border px-2 py-1 resize-y rounded text-sm bg-white"
        />
        <button
          onClick={() => {
            const novosItens = itens.filter((_, i) => i !== idx);
            setItens(novosItens);
            setInfo((prev) => ({ ...prev, itens: novosItens }));
          }}
          className="absolute top-1 right-1 text-red-500 hover:text-red-700 font-bold text-lg"
          title="Excluir item"
        >
          ❌
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>

        {info.modalidade && (
<button
  onClick={async () => {
    try {
      const numero = info.modalidade?.match(/\d{1,4}\/\d{4}/)?.[0] || "";
      const tipo = info.tipo || "Pregão";

      const portaria = await invoke("buscar_portaria", {
        tipo,
        numero,
      });

      // Junta info extraída do PDF com info da portaria
      const dadosCompletos = {
        ...info,
        portaria: portaria.portaria,
        ata: portaria.ata || "",
        processo: portaria.processo,
        fiscais: portaria.fiscais || [],
      };

      localStorage.setItem("dadosFicha", JSON.stringify(dadosCompletos));

      if (tipo.toLowerCase().includes("dispensa")) {
        window.open("relatorio/ficha-dispensa.html", "_blank");
      } else {
        window.open("relatorio/ficha-pregao.html", "_blank");
      }
    } catch (err) {
      alert("Erro ao buscar dados da portaria para gerar ficha");
      console.error(err);
    }
  }}
  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
>
  Gerar Ficha
</button>
        )}
      </div>
    )}


{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-[420px] max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Cadastrar Portaria</h2>

      <label className="block mb-2">
        Tipo:
        <select
          name="tipo"
          value={portariaData.tipo}
          onChange={handleChange}
          className="w-full border px-2 py-1"
        >
          <option value="Pregão">Pregão</option>
          <option value="Dispensa">Dispensa</option>
        </select>
      </label>

      {portariaData.tipo === "Pregão" ? (
        <>
          <label className="block mb-2">
            Número Pregão:
            <input
              name="numero"
              value={portariaData.numero}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </label>
          <label className="block mb-2">
            Ata:
            <input
              name="ata"
              value={portariaData.ata}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </label>
          <label className="block mb-2">
            Processo:
            <input
              name="processo"
              value={portariaData.processo}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </label>
        </>
      ) : (
        <>
          <label className="block mb-2">
            Número Dispensa:
            <input
              name="numero"
              value={portariaData.numero}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </label>
          <label className="block mb-2">
            Processo:
            <input
              name="processo"
              value={portariaData.processo}
              onChange={handleChange}
              className="w-full border px-2 py-1"
            />
          </label>
        </>
      )}

      <label className="block mb-2">
        Nº Portaria:
        <input
          name="portaria"
          value={portariaData.portaria || ""}
          onChange={handleChange}
          className="w-full border px-2 py-1"
        />
      </label>

      <div className="mb-2">
        <p className="font-semibold mb-1">Fiscais e Gestores:</p>
        {(portariaData.fiscais || []).map((fg, idx) => (
  <div key={idx} className="flex gap-2 mb-2">
    <input
      placeholder="Local"
      value={fg.local}
      onChange={(e) => {
        const novos = [...portariaData.fiscais];
        novos[idx].local = e.target.value;
        setPortariaData((prev) => ({ ...prev, fiscais: novos }));
      }}
      className="border px-2 py-1 w-1/3"
    />
    <input
      placeholder="Fiscal"
      value={fg.fiscal}
      onChange={(e) => {
        const novos = [...portariaData.fiscais];
        novos[idx].fiscal = e.target.value;
        setPortariaData((prev) => ({ ...prev, fiscais: novos }));
      }}
      className="border px-2 py-1 w-1/3"
    />
    <input
      placeholder="Gestor"
      value={fg.gestor}
      onChange={(e) => {
        const novos = [...portariaData.fiscais];
        novos[idx].gestor = e.target.value;
        setPortariaData((prev) => ({ ...prev, fiscais: novos }));
      }}
      className="border px-2 py-1 w-1/3"
    />
  </div>
))}

<button
  onClick={() =>
    setPortariaData((prev) => ({
      ...prev,
      fiscais: [...(prev.fiscais || []), { local: "", fiscal: "", gestor: "" }],
    }))
  }
  className="text-sm bg-gray-200 px-2 py-1 rounded"
>
  + Adicionar Fiscal/Gestor
</button>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setShowModal(false)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={inserir_portaria}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Salvar
        </button>
      </div>
    </div>
  </div>
)}

{/* EDITAR PORTARIA */}
{showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-[500px] max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Editar Portaria</h2>

      <div className="flex gap-2 mb-4">
        <select
          name="tipoBusca"
          value={editData.tipoBusca}
          onChange={(e) => setEditData({ ...editData, tipoBusca: e.target.value })}
          className="border px-2 py-1 w-1/2"
        >
          <option value="Pregão">Pregão</option>
          <option value="Dispensa">Dispensa</option>
        </select>

        <input
          placeholder="Número"
          className="border px-2 py-1 w-1/2"
          value={editData.numeroBusca}
          onChange={(e) => setEditData({ ...editData, numeroBusca: e.target.value })}
        />
      </div>
        <button
          onClick={() => setShowEditModal(false)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Cancelar
        </button>
      <button
        onClick={buscar_portaria}
        className="mb-4 bg-blue-600 text-white px-4 py-1 rounded"
      >
        Buscar
      </button>

      {editData.encontrado && (
        <>
          <label className="block mb-2">Portaria:
            <input
              value={editData.portaria}
              onChange={(e) => setEditData({ ...editData, portaria: e.target.value })}
              className="w-full border px-2 py-1"
            />
          </label>

          {editData.tipoBusca === "Pregão" && (
            <>
              <label className="block mb-2">Ata:
                <input
                  value={editData.ata}
                  onChange={(e) => setEditData({ ...editData, ata: e.target.value })}
                  className="w-full border px-2 py-1"
                />
              </label>
              <label className="block mb-2">Processo:
                <input
                  value={editData.processo}
                  onChange={(e) => setEditData({ ...editData, processo: e.target.value })}
                  className="w-full border px-2 py-1"
                />
              </label>
            </>
          )}

          <div className="mt-3">
            <label className="font-semibold">Fiscais/Gestores:</label>
            {editData.fiscais.map((fg, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  placeholder="Local"
                  className="border px-2 py-1 w-1/3"
                  value={fg.local}
                  onChange={(e) => updateFG(i, "local", e.target.value)}
                />
                <input
                  placeholder="Fiscal"
                  className="border px-2 py-1 w-1/3"
                  value={fg.fiscal}
                  onChange={(e) => updateFG(i, "fiscal", e.target.value)}
                />
                <input
                  placeholder="Gestor"
                  className="border px-2 py-1 w-1/3"
                  value={fg.gestor}
                  onChange={(e) => updateFG(i, "gestor", e.target.value)}
                />
              </div>
            ))}
            <button
              onClick={() =>
                setEditData((prev) => ({
                  ...prev,
                  fiscais: [...prev.fiscais, { local: "", fiscal: "", gestor: "" }],
                }))
              }
              className="text-blue-600 mt-1 text-sm"
            >
              + Adicionar Fiscal/Gestor
            </button>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={excluir_portaria}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Excluir
            </button>
            <button
              onClick={handleSalvarEdicao}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Salvar Alterações
            </button>
          </div>
        </>
      )}


    </div>
  </div>
)}

    </div>
  );
}
