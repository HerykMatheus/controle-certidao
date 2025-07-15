// src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod fornecedores;
mod certidoes;
mod vencimentos;
mod upload_drive;
mod notas;
mod setores;
mod portaria;
mod db;
mod app_state;

use fornecedores::*;
use certidoes::*;
use vencimentos::*;
use upload_drive::*;
use portaria::*;
use setores::*;
use notas::*;
use dotenvy::dotenv;
use app_state::AppState;
use db::init_db;

#[tokio::main]
async fn main() {
    dotenv().ok();

    // Inicializa o banco e coloca no AppState
    let db = init_db().await.expect("Erro ao conectar no MongoDB");
    let app_state = AppState { db };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            listar_fornecedores,
            buscar_fornecedores_parcial,
            excluir_fornecedor,
            inserir_fornecedor,
            editar_fornecedor,
            inserir_certidao,
            inserir_certidao_completa,
            listar_certidoes_a_vencer_em_30_dias,
            upload_pdfs_raw_wrapper,
            salvar_nota,
            filtrar_notas,
            excluir_nota,
            editar_nota,
            buscar_ultima_certidao,
            buscar_setores_parcial,
            inserir_portaria,
            buscar_portaria,
            editar_portaria,
            excluir_portaria
        ])
        .run(tauri::generate_context!())
        .expect("erro ao rodar aplicação Tauri");
}
