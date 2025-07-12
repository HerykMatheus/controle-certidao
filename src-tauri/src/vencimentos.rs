use crate::models::CertidaoCompleta;
use bson::{doc, DateTime};
use futures::TryStreamExt;
use mongodb::{options::ClientOptions, Client};
use chrono::{Utc, Duration};
use serde::Serialize;

#[derive(Serialize)]
pub struct CertidaoSimplificada {
    pub fornecedor: String,
    pub pedido: i32,
    pub vencimento_estadual: Option<String>,
    pub vencimento_federal: Option<String>,
    pub vencimento_trabalhista: Option<String>,
    pub vencimento_fgts: Option<String>,
}

#[derive(Serialize)]
pub struct CertidaoExibicao {
    pub fornecedor: String,
    pub pedido: i32,
    pub parcial: i32,
    pub cartao_cnpj: Option<String>,
    pub estadual: Option<String>,
    pub vencimento_estadual: Option<String>,
    pub trabalhista: Option<String>,
    pub vencimento_trabalhista: Option<String>,
    pub federal: Option<String>,
    pub vencimento_federal: Option<String>,
    pub fgts: Option<String>,
    pub vencimento_fgts: Option<String>,
}



#[tauri::command]
pub async fn listar_certidoes_a_vencer_em_30_dias() -> Result<Vec<CertidaoSimplificada>, String> {
    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<CertidaoCompleta>("CertidoesCompletas");

    let hoje = Utc::now();
    let daqui_30_dias = hoje + Duration::days(30);

 let filtro = doc! {
    "$or": [
        {
            "vencimento_estadual": {
                "$gte": DateTime::from_chrono(hoje),
                "$lte": DateTime::from_chrono(daqui_30_dias),
            }
        },
        {
            "vencimento_federal": {
                "$gte": DateTime::from_chrono(hoje),
                "$lte": DateTime::from_chrono(daqui_30_dias),
            }
        },
        {
            "vencimento_trabalhista": {
                "$gte": DateTime::from_chrono(hoje),
                "$lte": DateTime::from_chrono(daqui_30_dias),
            }
        },
        {
            "vencimento_fgts": {
                "$gte": DateTime::from_chrono(hoje),
                "$lte": DateTime::from_chrono(daqui_30_dias),
            }
        }
    ]
};

    let cursor = collection.find(filtro).await.map_err(|e| e.to_string())?;
    let certidoes: Vec<CertidaoCompleta> = cursor.try_collect().await.map_err(|e| e.to_string())?;

    // Transformar para estrutura simplificada com strings
    let simplificadas: Vec<CertidaoSimplificada> = certidoes
        .into_iter()
        .map(|c| CertidaoSimplificada {
            fornecedor: c.fornecedor,
            pedido: c.pedido,
            vencimento_estadual: c.vencimento_estadual.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_federal: c.vencimento_federal.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_trabalhista: c.vencimento_trabalhista.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_fgts: c.vencimento_fgts.map(|d| d.to_chrono().to_rfc3339()),
        })
        .collect();

    Ok(simplificadas)
}

async fn get_client() -> Result<Client, String> {
    let uri = std::env::var("MONGODB_URI").map_err(|_| "MONGODB_URI não definida")?;
    let client_options = ClientOptions::parse(&uri).await.map_err(|e| e.to_string())?;
    Client::with_options(client_options).map_err(|e| e.to_string())
}


#[tauri::command]
pub async fn buscar_ultima_certidao(nome_fornecedor: String) -> Result<Option<CertidaoExibicao>, String> {
    let client = get_client().await?;
    let collection = client.database("Controle_certidao").collection::<CertidaoCompleta>("CertidoesCompletas");

    let filtro = doc! {
        "fornecedor": {
            "$regex": &nome_fornecedor,
            "$options": "i"
        }
    };

    let mut resultados: Vec<CertidaoCompleta> = collection.find(filtro)
        .await
        .map_err(|e| e.to_string())?
        .try_collect()
        .await
        .map_err(|e| e.to_string())?;

    resultados.sort_by(|a, b| b.data_pedido.cmp(&a.data_pedido));

    if let Some(cert) = resultados.into_iter().next() {
        Ok(Some(CertidaoExibicao {
            fornecedor: cert.fornecedor,
            pedido: cert.pedido,
            parcial: cert.parcial,
            cartao_cnpj: cert.cartao_cnpj.map(|d| d.to_chrono().to_rfc3339()),
            estadual: cert.estadual.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_estadual: cert.vencimento_estadual.map(|d| d.to_chrono().to_rfc3339()),
            trabalhista: cert.trabalhista.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_trabalhista: cert.vencimento_trabalhista.map(|d| d.to_chrono().to_rfc3339()),
            federal: cert.federal.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_federal: cert.vencimento_federal.map(|d| d.to_chrono().to_rfc3339()),
            fgts: cert.fgts.map(|d| d.to_chrono().to_rfc3339()),
            vencimento_fgts: cert.vencimento_fgts.map(|d| d.to_chrono().to_rfc3339()),
        }))
    } else {
        Ok(None)
    }
}
