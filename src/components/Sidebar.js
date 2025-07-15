// src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <div className="w-54 bg-[#1e293b] text-white min-h-screen p-6 shadow-lg">
    <h1 className="text-xl font-bold mb-5">📋 Controle</h1>
    <nav className="flex flex-col gap-3">
      {[
        { to: "/", label: "Início" },
        { to: "/fornecedor", label: "Fornecedores" },
        { to: "/certidao", label: "Certidão" },
        { to: "/certidoes", label: "Notas" },
        { to: "/checklist", label: "Check List" },
        { to: "/ficha-fiscalizacao", label: "Ficha de Fiscalização" },
      ].map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `px-3 py-2 rounded hover:bg-[#334155] transition ${
              isActive ? "bg-[#334155]" : ""
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Sidebar;
