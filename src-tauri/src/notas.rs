use serde::{Serialize, Deserialize};
use crate::db::obter_client;
use mongodb::Collection;
use chrono::{Utc, NaiveDate, Datelike, TimeZone};
use bson::{doc, DateTime as BsonDateTime};
use futures::TryStreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct NotaRegistro {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub _id: Option<bson::oid::ObjectId>, // <-- Adicionado para suportar edição/exclusão
    pub fornecedor: String,
    pub setor: String, // <-- Adicionado para suportar filtro por setor
    pub pedido: i32,
    pub parcial: i32,
    pub nf: i32,
    pub data_nf: Option<BsonDateTime>,
    pub valor: f64,
    pub tipo_ficha: Option<String>,
    pub data_almoxarifado: Option<BsonDateTime>,
    pub data_contabilidade: Option<BsonDateTime>,
    pub origem: String,
}

#[derive(Debug, Deserialize)]
pub struct NotaRegistroInput {
    pub fornecedor: String,
    pub setor: String, // <-- Adicionado para suportar filtro por setor
    pub pedido: i32,
    pub parcial: Option<i32>,
    pub nf: Option<i32>,
    pub data_nf: Option<NaiveDate>,
    pub valor: Option<f64>,
    pub tipo_ficha: Option<String>,
    pub data_almoxarifado: Option<NaiveDate>,
    pub data_contabilidade: Option<NaiveDate>,
    pub origem: String,
}

fn naive_to_bson_date(date: Option<NaiveDate>) -> Option<BsonDateTime> {
    date.map(|d| {
        let local_dt = chrono::Local
            .with_ymd_and_hms(d.year(), d.month(), d.day(), 0, 0, 0)
            .unwrap();

        let utc_dt = local_dt.with_timezone(&Utc);
        BsonDateTime::from_chrono(utc_dt)
    })
}

#[tauri::command]
pub async fn salvar_nota(nota: NotaRegistroInput) -> Result<String, String> {
    let client = obter_client().await.map_err(|e| e.to_string())?;
    let collection: Collection<NotaRegistro> = client
        .database("Controle_certidao")
        .collection("Notas");

    let nota_salva = NotaRegistro {
        _id: None,
        fornecedor: nota.fornecedor,
        setor: nota.setor, // <-- Adicionado para suportar filtro por setor
        pedido: nota.pedido,
        parcial: nota.parcial.unwrap_or(0),
        nf: nota.nf.unwrap_or(0),
        data_nf: naive_to_bson_date(nota.data_nf),
        valor: nota.valor.unwrap_or(0.0),
        tipo_ficha: nota.tipo_ficha,
        data_almoxarifado: naive_to_bson_date(nota.data_almoxarifado),
        data_contabilidade: naive_to_bson_date(nota.data_contabilidade),
        origem: nota.origem,
    };

    collection
        .insert_one(nota_salva)
        .await
        .map_err(|e| format!("Erro ao salvar nota: {}", e))?;

    Ok("Nota salva com sucesso.".into())
}

#[tauri::command]
pub async fn editar_nota(id: String, nova_nota: NotaRegistroInput) -> Result<String, String> {
    use mongodb::bson::oid::ObjectId;

    let client = obter_client().await.map_err(|e| e.to_string())?;
    let collection: Collection<NotaRegistro> = client
        .database("Controle_certidao")
        .collection("Notas");

    let obj_id = ObjectId::parse_str(&id).map_err(|e| e.to_string())?;

    let atualizacao = doc! {
        "$set": {
            "fornecedor": nova_nota.fornecedor,
            "setor": nova_nota.setor, // <-- Adicionado para suportar filtro por setor
            "pedido": nova_nota.pedido,
            "parcial": nova_nota.parcial.unwrap_or(0),
            "nf": nova_nota.nf.unwrap_or(0),
            "data_nf": naive_to_bson_date(nova_nota.data_nf),
            "valor": nova_nota.valor.unwrap_or(0.0),
            "tipo_ficha": nova_nota.tipo_ficha,
            "data_almoxarifado": naive_to_bson_date(nova_nota.data_almoxarifado),
            "data_contabilidade": naive_to_bson_date(nova_nota.data_contabilidade),
            "origem": nova_nota.origem,
        }
    };

    collection
        .update_one(doc! { "_id": obj_id }, atualizacao)
        .await
        .map_err(|e| format!("Erro ao editar nota: {}", e))?;

    Ok("Nota atualizada com sucesso.".into())
}

#[tauri::command]
pub async fn excluir_nota(id: String) -> Result<String, String> {
    use mongodb::bson::oid::ObjectId;

    let client = obter_client().await.map_err(|e| e.to_string())?;
    let collection: Collection<NotaRegistro> = client
        .database("Controle_certidao")
        .collection("Notas");

    let obj_id = ObjectId::parse_str(&id).map_err(|e| e.to_string())?;

    collection
        .delete_one(doc! { "_id": obj_id })
        .await
        .map_err(|e| format!("Erro ao excluir nota: {}", e))?;

    Ok("Nota excluída com sucesso.".into())
}

#[tauri::command]
pub async fn filtrar_notas(
    origem: String,
    data: Option<String>,
    tipo_ficha: Option<String>,
) -> Result<Vec<NotaRegistro>, String> {
    let client = obter_client().await.map_err(|e| e.to_string())?;
    let collection: Collection<NotaRegistro> = client
        .database("Controle_certidao")
        .collection("Notas");

    let mut filtro = doc! {
        "origem": &origem
    };

    if let Some(data_str) = data {
        if let Ok(naive_date) = NaiveDate::parse_from_str(&data_str, "%Y-%m-%d") {
            let chrono_dt = chrono::Local
                .with_ymd_and_hms(naive_date.year(), naive_date.month(), naive_date.day(), 0, 0, 0)
                .unwrap()
                .with_timezone(&Utc);
            let bson_date = BsonDateTime::from_chrono(chrono_dt);

            if origem == "almoxarifado" {
                filtro.insert("data_almoxarifado", bson_date);
            } else if origem == "contabilidade" {
                filtro.insert("data_contabilidade", bson_date);
            }
        }
    }

    if origem == "contabilidade" {
        if let Some(tipo) = tipo_ficha {
            if !tipo.trim().is_empty() {
                filtro.insert("tipo_ficha", tipo);
            }
        }
    }

    let cursor = collection
        .find(filtro)
        .await
        .map_err(|e| format!("Erro ao buscar notas: {}", e))?;

    let results: Vec<NotaRegistro> = cursor
        .try_collect()
        .await
        .map_err(|e| format!("Erro ao coletar notas: {}", e))?;

    Ok(results)
}
