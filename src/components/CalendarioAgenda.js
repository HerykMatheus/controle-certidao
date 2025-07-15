import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function CalendarioAgenda() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [tituloEditado, setTituloEditado] = useState("");

  useEffect(() => {
    const salvos = localStorage.getItem("eventosAgenda");
    if (salvos) {
      const convertidos = JSON.parse(salvos).map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
      setEventos(convertidos);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("eventosAgenda", JSON.stringify(eventos));
  }, [eventos]);

  const handleSelecionarSlot = ({ start, end }) => {
    const titulo = prompt("Título do evento:");
    if (titulo) {
      const novo = { title: titulo, start, end };
      setEventos([...eventos, novo]);
    }
  };

  const handleSelecionarEvento = (evento) => {
    setEventoSelecionado(evento);
    setTituloEditado(evento.title);
  };

  const salvarEdicao = () => {
    const atualizados = eventos.map((e) =>
      e === eventoSelecionado ? { ...e, title: tituloEditado } : e
    );
    setEventos(atualizados);
    setEventoSelecionado(null);
  };

  const excluirEvento = () => {
    const atualizados = eventos.filter((e) => e !== eventoSelecionado);
    setEventos(atualizados);
    setEventoSelecionado(null);
  };

  return (
    <div className="bg-white rounded shadow p-4 overflow-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800">📆 Agenda</h3>

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelecionarSlot}
        onSelectEvent={handleSelecionarEvento}
        messages={{
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Evento",
        }}
        popup
        views={["month", "week", "day"]}
      />

      {eventoSelecionado && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow border">
          <h4 className="font-semibold mb-2">✏️ Editar Evento</h4>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            value={tituloEditado}
            onChange={(e) => setTituloEditado(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={salvarEdicao}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Salvar
            </button>
            <button
              onClick={excluirEvento}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Excluir
            </button>
            <button
              onClick={() => setEventoSelecionado(null)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
