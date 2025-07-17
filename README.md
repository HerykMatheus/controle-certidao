# 📄 Controle de Certidões

Aplicação para gerenciamento de fornecedores, certidões e pedidos públicos, com foco em organização e controle de prazos de vencimento.

## 🚀 Funcionalidades

- Cadastro de fornecedores
- Registro e consulta de certidões (Estadual, Federal, FGTS, Trabalhista)
- Alerta de certidões vencidas ou a vencer
- Cadastro de pedidos de almoxarifado e contabilidade
- Geração de relatórios e checklist de regularidade fiscal
- Extração de dados de PDFs para fichas de fiscalização (Pregão/Dispensa)

## 🖥️ Tecnologias Utilizadas

### Frontend
- [React.js](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist)
- [Tailwind CSS](https://tailwindcss.com/) (opcional)
- [ShadCN UI](https://ui.shadcn.com/) (em algumas telas)

### Backend
- [Tauri](https://tauri.app/) com [Rust](https://www.rust-lang.org/)
- MongoDB via `mongodb` crate



## 🧪 Como rodar o projeto

### Pré-requisitos

- Node.js 18+
- Rust + Cargo
- MongoDB em execução local ou remoto

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/controle-certidao.git
cd controle-certidao

# Instale as dependências do frontend
npm install

# Inicie em modo de desenvolvimento com Tauri
npm run tauri dev


Status do Projeto
✅ Funcionalidades principais implementadas
🛠️ Em desenvolvimento: melhorias na extração de PDF, relatório impresso de ficha de fiscalização, refinamento da UI
