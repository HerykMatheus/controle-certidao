use serde::{Serialize, Deserialize};
use bson::{doc, oid::ObjectId};
use mongodb::{Collection, options::InsertOneOptions};
use tauri::State;
use futures::TryStreamExt;

use crate::app_state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FiscalGestor {
    pub local: String,
    pub fiscal: String,
    pub gestor: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Portaria {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub tipo: String, // "Pregão" ou "Dispensa"
    pub numero: String, // "24/2024"
    pub processo: String,
    pub ata: Option<String>,
    pub portaria: String,
    pub fiscais: Vec<FiscalGestor>,
}



#[tauri::command]
pub async fn inserir_portaria(portaria: Portaria, state: State<'_, AppState>) -> Result<String, String> {
    let collection: Collection<Portaria> = state.db.collection("Portaria");

    collection.insert_one(portaria).await
        .map(|res| res.inserted_id.to_string())
        .map_err(|e| format!("Erro ao inserir: {}", e))
}

#[tauri::command]
pub async fn buscar_portaria(
    tipo: String,
    numero: String,
    state: State<'_, AppState>,
) -> Result<Portaria, String> {
    let collection: Collection<Portaria> = state.db.collection("Portaria");
 println!("🛠️ Buscando portaria: tipo = {}, numero = {}", tipo, numero);
    let filtro = doc! { "tipo": tipo, "numero": numero };
    
    collection
   

        .find_one(filtro)
        .await
        .map_err(|e| format!("Erro ao buscar: {}", e))?
        .ok_or("Portaria não encontrada.".to_string())
}

#[tauri::command]
pub async fn editar_portaria(id: String, nova: Portaria, state: State<'_, AppState>) -> Result<String, String> {
    let collection: Collection<Portaria> = state.db.collection("Portaria");

    let obj_id = bson::oid::ObjectId::parse_str(id).map_err(|e| e.to_string())?;

    collection.update_one(doc! {"_id": obj_id}, doc! {"$set": bson::to_document(&nova).unwrap()}).await
        .map_err(|e| format!("Erro ao atualizar: {}", e))?;

    Ok("Portaria atualizada com sucesso.".to_string())
}

#[tauri::command]
pub async fn excluir_portaria(id: String, state: State<'_, AppState>) -> Result<String, String> {
    use bson::oid::ObjectId;
    let collection: Collection<Portaria> = state.db.collection("Portaria");

    let obj_id = ObjectId::parse_str(&id).map_err(|e| format!("ID inválido: {}", e))?;

    collection
        .delete_one(doc! { "_id": obj_id })
        .await
        .map_err(|e| format!("Erro ao excluir portaria: {}", e))?;

    Ok("Portaria excluída com sucesso.".to_string())
}