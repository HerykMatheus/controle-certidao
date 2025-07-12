// src/models.rs

use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use bson::DateTime;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Certidao {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    pub fornecedor: String,
    pub tipo: String,
    pub validade: DateTime,
    pub arquivo: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CertidaoCompleta {
    #[serde(rename = "_id")]
    pub id: bson::oid::ObjectId,
    pub fornecedor: String,
    pub pedido: i32,
    pub parcial: i32,
    pub data_pedido: Option<DateTime>,
    pub cartao_cnpj: Option<DateTime>,
    pub estadual: Option<DateTime>,
    pub vencimento_estadual: Option<DateTime>,
    pub trabalhista: Option<DateTime>,
    pub vencimento_trabalhista: Option<DateTime>,
    pub federal: Option<DateTime>,
    pub vencimento_federal: Option<DateTime>,
    pub fgts: Option<DateTime>,
    pub vencimento_fgts: Option<DateTime>,
    pub pdf_links: Vec<String>,
}

