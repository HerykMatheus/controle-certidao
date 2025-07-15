// src/db.rs

use mongodb::{Client, Database, options::ClientOptions};
use std::env;
use dotenv::dotenv;

/// Inicializa e retorna o banco de dados
pub async fn init_db() -> mongodb::error::Result<Database> {
    dotenv().ok(); // Carrega variáveis do .env

    let uri = env::var("MONGODB_URI").expect("MONGODB_URI não definido no .env");
    let options = ClientOptions::parse(&uri).await?;
    let client = Client::with_options(options)?;
    Ok(client.database("Controle_certidao"))
}