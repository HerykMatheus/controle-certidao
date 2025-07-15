// src/components/ListaTarefas.js
import React, { useState, useEffect } from "react";

export default function ListaTarefas() {
  const [tarefas, setTarefas] = useState(() => {
    const salvas = localStorage.getItem("tarefas");
    return salvas ? JSON.parse(salvas) : [];
  });
  const [novaTarefa, setNovaTarefa] = useState("");

  useEffect(() => {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  const alternarFeito = (id) => {
    setTarefas(tarefas.map((t) => t.id === id ? { ...t, feito: !t.feito } : t));
  };

  const excluirTarefa = (id) => {
    setTarefas(tarefas.filter((t) => t.id !== id));
  };

  return (
    <div className="w-full lg:w-1/2 bg-white rounded shadow p-4 overflow-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🗂️ Agenda / Tarefas</h3>

      <div className="flex gap-2 mb-4">
        <input
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          placeholder="Digite uma nova tarefa..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={() => {
            if (novaTarefa.trim()) {
              setTarefas([...tarefas, {
                id: Date.now(),
                titulo: novaTarefa,
                feito: false,
              }]);
              setNovaTarefa("");
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      <ul className="space-y-2">
        {tarefas.map((t) => (
          <li
            key={t.id}
            className={`flex justify-between items-center px-3 py-2 border rounded ${
              t.feito ? "bg-green-100 line-through text-gray-500" : ""
            }`}
          >
            <span>{t.titulo}</span>
            <div className="flex gap-2">
              <button
                onClick={() => alternarFeito(t.id)}
                className="bg-yellow-300 text-black px-2 py-1 rounded text-sm"
              >
                {t.feito ? "Desfazer" : "Feito"}
              </button>
              <button
                onClick={() => excluirTarefa(t.id)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}