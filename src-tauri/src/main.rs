// src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod fornecedores;
mod certidoes;
mod vencimentos;
mod upload_drive;
mod notas;
mod db;
mod setores;

use fornecedores::*;
use certidoes::*;
use vencimentos::*;
use upload_drive::*;
use setores::*;
use notas::*;
use dotenvy::dotenv;
use notas::{salvar_nota, filtrar_notas};


fn main() {

   dotenv().ok(); 


    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
     listar_fornecedores,
    buscar_fornecedores_parcial,
    excluir_fornecedor,
    inserir_fornecedor,
    editar_fornecedor,
    inserir_certidao,
    inserir_certidao_completa, // <= adicione aqui
    listar_certidoes_a_vencer_em_30_dias,
    upload_pdfs_raw_wrapper,
    salvar_nota,
    filtrar_notas,
    excluir_nota,
    editar_nota,
    buscar_ultima_certidao,
    buscar_setores_parcial
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

