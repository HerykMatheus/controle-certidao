// src/fornecedores.rs

use bson::{doc, Regex};
use futures::TryStreamExt;
use mongodb::{options::ClientOptions, Client};
use regex::escape;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Fornecedor {
    pub nome: Option<String>,
    pub documento: Option<String>,
    pub tipo: Option<String>,
}

#[tauri::command]
pub async fn listar_fornecedores() -> Result<Vec<Fornecedor>, String> {
    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<Fornecedor>("Fornecedor");

    let cursor = collection.find(doc! {}).await.map_err(|e| e.to_string())?;
    let fornecedores: Vec<Fornecedor> = cursor.try_collect().await.map_err(|e| e.to_string())?;

    Ok(fornecedores)
}

#[tauri::command]
pub async fn buscar_fornecedores_parcial(nome_parcial: String) -> Result<Vec<Fornecedor>, String> {
    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<Fornecedor>("Fornecedor");

    let filtro = doc! {
        "nome": {
            "$regex": Regex {
                pattern: format!(".*{}.*", escape(&nome_parcial)),
                options: "i".to_string(),
            }
        }
    };

    let cursor = collection.find(filtro).await.map_err(|e| e.to_string())?;
    let fornecedores: Vec<Fornecedor> = cursor.try_collect().await.map_err(|e| e.to_string())?;

    Ok(fornecedores)
}

#[tauri::command]
pub async fn excluir_fornecedor(documento: String) -> Result<String, String> {
    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<Fornecedor>("Fornecedor");

    collection
        .delete_one(doc! { "documento": documento })
        .await
        .map_err(|e| e.to_string())?;

    Ok("Fornecedor excluído com sucesso.".into())
}

#[tauri::command]
pub async fn editar_fornecedor(
    documento_antigo: String,
    nome: String,
    documento: String,
    tipo: String,
) -> Result<String, String> {
    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<Fornecedor>("Fornecedor");

    let filtro = doc! { "documento": documento_antigo };
    let atualizacao = doc! {
        "$set": {
            "nome": nome,
            "documento": documento,
            "tipo": tipo,
        }
    };

    collection
        .update_one(filtro, atualizacao)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Fornecedor atualizado com sucesso.".into())
}

async fn get_client() -> Result<Client, String> {
    let uri = std::env::var("MONGODB_URI").map_err(|_| "MONGODB_URI não definida")?;
    let client_options = ClientOptions::parse(&uri).await.map_err(|e| e.to_string())?;
    Client::with_options(client_options).map_err(|e| e.to_string())
}


#[tauri::command]
pub async fn inserir_fornecedor(fornecedor: Fornecedor) -> Result<String, String> {
    if fornecedor.nome.is_none() || fornecedor.documento.is_none() || fornecedor.tipo.is_none() {
        return Err("Todos os campos do fornecedor são obrigatórios.".into());
    }

    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<Fornecedor>("Fornecedor");

    collection
        .insert_one(fornecedor)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Fornecedor inserido com sucesso.".into())
}