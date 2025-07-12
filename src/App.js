// src/App.js
import React from "react";
import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Menu lateral */}
      <div style={{
        width: "150px",
        background: "#2c3e50",
        color: "white",
        padding: "18px",
      }}>
       
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>Início</Link>
          <Link to="/fornecedor" style={{ color: "white", textDecoration: "none" }}>Fornecedores</Link>
          <Link to="/certidao" style={{ color: "white", textDecoration: "none" }}>Certidão</Link>
          <Link to="/certidoes" style={{ color: "white", textDecoration: "none" }}>Notas</Link>
          <Link to="/checklist" style={{ color: "white", textDecoration: "none" }}>Check List</Link>
        </nav>
      </div>

      {/* Conteúdo da página */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
