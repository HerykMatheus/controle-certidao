use mongodb::{Client, options::ClientOptions};
use std::env;
use dotenv::dotenv;

pub async fn obter_client() -> mongodb::error::Result<Client> {
    dotenv().ok(); // carrega o .env

    let uri = env::var("MONGODB_URI").expect("MONGODB_URI não definido no .env");

    let options = ClientOptions::parse(&uri).await?;
    Client::with_options(options)
}