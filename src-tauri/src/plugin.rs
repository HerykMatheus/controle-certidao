use tauri::{plugin::Plugin, Runtime};


pub fn init_plugins<R: Runtime>() -> Vec<Box<dyn Plugin<R>>> {
    vec![
        Box::new(tauri_plugin_fs::init())
    ]
}