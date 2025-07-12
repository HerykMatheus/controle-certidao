// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <div style={{
    width: "100px",
    height: "50vh",
    background: "#282c34",
    color: "#fff",
    padding: "15px",
    position: "fixed"
  }}>

    <nav>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/" style={{ color: "#fff" }}>Home</Link></li>
        <li><Link to="/cadastro" style={{ color: "#fff" }}>Cadastrar Fornecedor</Link></li>
        <li><Link to="/certidao" style={{ color: "#fff" }}>Cadastrar Certidão</Link></li>
        <li><Link to="/certidoes" style={{ color: "#fff" }}>Notas</Link></li>
        <li><Link to="/checklist" style={{ color: "#fff" }}>Check List</Link></li>
      </ul>
    </nav>
  </div>
);

export default Sidebar;
