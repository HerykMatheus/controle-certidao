use crate::models::{Certidao, CertidaoCompleta};
use bson::doc;
use futures::TryStreamExt;
use mongodb::{options::ClientOptions, Client};
use chrono::{NaiveDate, TimeZone, Utc, DateTime as ChronoDateTime};
use bson::DateTime as BsonDateTime;
use serde::Deserialize;
use chrono::Datelike;

// Função auxiliar para converter string "YYYY-MM-DD" em DateTime<Utc>
fn parse_date_str(date_str: &str) -> Option<ChronoDateTime<Utc>> {
    NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
        .ok()
        .and_then(|d| Utc.with_ymd_and_hms(d.year(), d.month(), d.day(), 0, 0, 0).single())
}

// -------------------------------
// Struct para input com datas como String
// -------------------------------
#[derive(Debug, Deserialize)]
pub struct CertidaoCompletaInput {
    pub fornecedor: String,
    pub pedido: i32,
    pub parcial: i32,
    pub data_pedido: Option<NaiveDate>,
    pub cartao_cnpj: Option<NaiveDate>,
    pub estadual: Option<NaiveDate>,
    pub vencimento_estadual: Option<NaiveDate>,
    pub trabalhista: Option<NaiveDate>,
    pub vencimento_trabalhista: Option<NaiveDate>,
    pub federal: Option<NaiveDate>,
    pub vencimento_federal: Option<NaiveDate>,
    pub fgts: Option<NaiveDate>,
    pub vencimento_fgts: Option<NaiveDate>,
    pub pdf_links: Vec<String>,
}

// -------------------------------
// Comando para inserir Certidão simples
// -------------------------------
#[tauri::command]
pub async fn inserir_certidao(certidao: Certidao) -> Result<String, String> {
    let client = get_client().await?;
    let collection = client
        .database("Controle_certidao")
        .collection::<Certidao>("CertidoesCompletas");

    collection
        .insert_one(certidao)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Certidão inserida com sucesso.".into())
}


// Função auxiliar
fn naive_to_bson_date(date: Option<NaiveDate>) -> Option<bson::DateTime> {
    date.map(|d| {
        let chrono_dt = Utc.from_utc_datetime(&d.and_hms_opt(0, 0, 0).unwrap());
        bson::DateTime::from_chrono(chrono_dt)
    })
}

// -------------------------------
// Comando para inserir Certidão completa (convertendo strings em datas)
// -------------------------------
#[tauri::command]
pub async fn inserir_certidao_completa(input: CertidaoCompletaInput) -> Result<String, String> {
    let certidao = CertidaoCompleta {
    id: bson::oid::ObjectId::new(),
        fornecedor: input.fornecedor,
        pedido: input.pedido,
        parcial: input.parcial,
        data_pedido: naive_to_bson_date(input.data_pedido),
cartao_cnpj: naive_to_bson_date(input.cartao_cnpj),
estadual: naive_to_bson_date(input.estadual),
vencimento_estadual: naive_to_bson_date(input.vencimento_estadual),
trabalhista: naive_to_bson_date(input.trabalhista),
vencimento_trabalhista: naive_to_bson_date(input.vencimento_trabalhista),
federal: naive_to_bson_date(input.federal),
vencimento_federal: naive_to_bson_date(input.vencimento_federal),
fgts: naive_to_bson_date(input.fgts),
vencimento_fgts: naive_to_bson_date(input.vencimento_fgts),
        pdf_links: input.pdf_links,
    };

    let client = get_client().await?;
    let collection = client
        .database("Controle_certidao")
        .collection::<CertidaoCompleta>("CertidoesCompletas");

    collection
        .insert_one(certidao)
        .await
        .map_err(|e| e.to_string())?;

    Ok("Certidão completa inserida com sucesso.".into())
}

// -------------------------------
// Conexão com MongoDB
// -------------------------------
async fn get_client() -> Result<Client, String> {
    let uri = std::env::var("MONGODB_URI").map_err(|_| "MONGODB_URI não definida")?;
    let client_options = ClientOptions::parse(&uri).await.map_err(|e| e.to_string())?;
    Client::with_options(client_options).map_err(|e| e.to_string())
}
