// src/upload_drive.rs

use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::Path;

use google_drive3::oauth2::{InstalledFlowAuthenticator, InstalledFlowReturnMethod};
use google_drive3::DriveHub;
use yup_oauth2 as oauth2;
use hyper::{Client, client::HttpConnector};
use hyper_rustls::HttpsConnectorBuilder;
use mime_guess::MimeGuess;
use serde::{Deserialize, Serialize};
use tokio::fs;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Deserialize)]
pub struct UploadParams {
    pub fornecedor: String,
    pub pedido: String,
    pub nome: String,
    pub pdf_base64: String,
}


#[derive(serde::Deserialize)]
pub struct PdfUpload {
    fornecedor: String,
    pedido: String,
    nome: String,
    pdf_base64: String,
}



#[tauri::command]
pub async fn upload_pdfs_raw_wrapper(
    pdfs: Vec<PdfUpload>, // <- aqui está o `pdfs` que está faltando
    fornecedor: String,
    pedido: String,
) -> Result<Vec<String>, String> {
    for pdf in pdfs {
        // Use `pdf.nome`, `pdf.pdf_base64`, etc.
    }

    Ok(vec!["link1".to_string(), "link2".to_string()])
}
