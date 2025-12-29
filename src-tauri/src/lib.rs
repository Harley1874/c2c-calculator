// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn fetch_c2c_list(payload: serde_json::Value) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::builder()
        .gzip(true)
        .deflate(true)
        .brotli(true)
        .build()
        .map_err(|e| format!("Failed to build client: {}", e))?;

    let res = client.post("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let status = res.status();
    let text = res.text().await.map_err(|e| format!("Failed to read text: {}", e))?;

    if !status.is_success() {
        return Err(format!("API Error ({}): {}", status, text));
    }

    // Attempt to parse JSON
    let json: serde_json::Value = serde_json::from_str(&text)
        .map_err(|e| format!("JSON Parse Error: {} | Response body: {}", e, text))?;

    Ok(json)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, fetch_c2c_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
