// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import './index.css';
import Home from "./pages/Home";
import FornecedorManager from "./pages/CadastroFornecedor"; // Novo import
import CadastroCertidao from "./pages/CadastroCertidao"; // Import para a página de certidão
import CadastroNotas from "./pages/CadastroNotas"; // Import para a página de notas
import CheckList from "./pages/Checklist"; // Import para a página de check list
import BuscaCertidoes from "./pages/BuscaCertidoes";  
import FichaFiscalizacao from "./pages/FichaFiscalizacao"; // Import para a página de ficha de fiscalização

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="fornecedor" element={<FornecedorManager />} />
        <Route path="certidao" element={<CadastroCertidao />} /> {/* Rota para a página de certidão */}
        <Route path="certidoes" element={<CadastroNotas />} /> {/* Rota para a página de notas */}  
        <Route path="checklist" element={<CheckList />} /> {/* Rota para a página de check list */}
       <Route path="busca-certidoes" element={<BuscaCertidoes />} />
        <Route path="ficha-fiscalizacao" element={<FichaFiscalizacao />} /> {/* Rota para a página de ficha de fiscalização */}
     </Route>
    </Routes>
  </BrowserRouter>
);
