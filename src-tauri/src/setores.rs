use mongodb::{bson::doc, options::FindOptions, Collection};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::app_state::AppState;
use futures::stream::TryStreamExt;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Setor {
    pub nome: String,
}

#[tauri::command]
pub async fn buscar_setores_parcial(
    nome_parcial: String,
    state: State<'_, AppState>
) -> Result<Vec<Setor>, String> {
    let collection: Collection<Setor> = state.db.collection("Setor");

    let filtro = doc! {
        "nome": {
            "$regex": nome_parcial,
            "$options": "i"
        }
    };

    let opcoes = FindOptions::builder()
        .limit(10)
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
