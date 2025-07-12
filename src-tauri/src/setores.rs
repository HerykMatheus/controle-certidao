use mongodb::{bson::doc, options::FindOptions};
use serde::{Deserialize, Serialize};
use crate::db::obter_client;
use futures::stream::TryStreamExt;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Setor {
    pub nome: String,
}

#[tauri::command]
pub async fn buscar_setores_parcial(nome_parcial: String) -> Result<Vec<Setor>, String> {
    let client = obter_client().await.map_err(|e| e.to_string())?;
    let collection = client.database("Controle_certidao").collection::<Setor>("Setor");

    let filtro = doc! {
        "nome": {
            "$regex": nome_parcial,
            "$options": "i"  // busca case-insensitive
        }
    };

    let opcoes = FindOptions::builder()
        .limit(10) // limita para no máximo 10 sugestões
        .build();

    let mut cursor = collection.find(filtro)
        .await
        .map_err(|e| e.to_string())?;

    let mut setores: Vec<Setor> = Vec::new();
    while let Some(res) = cursor.try_next().await.map_err(|e| e.to_string())? {
        setores.push(res);
    }

    Ok(setores)
}
