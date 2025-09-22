#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use winreg::HKEY;

use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder},
};

#[cfg(windows)]
use winreg::{enums::*, RegKey};

#[cfg(windows)]
fn hive_from_str(s: &str) -> Result<HKEY, String> {
    match s.to_uppercase().as_str() {
        "HKLM" => Ok(HKEY_LOCAL_MACHINE),
        "HKCU" => Ok(HKEY_CURRENT_USER),
        "HKCR" => Ok(HKEY_CLASSES_ROOT),
        "HKU"  => Ok(HKEY_USERS),
        "HKCC" => Ok(HKEY_CURRENT_CONFIG),
        _ => Err(format!("Unknown hive: {s}")),
    }
}

#[cfg(windows)]
#[command]
fn read_registry(hive: &str, subkey: &str, value_name: &str) -> Result<u32, String> {
    let root = RegKey::predef(hive_from_str(hive)?);
    let key = root.open_subkey(subkey).map_err(|e| e.to_string())?;
    key.get_value::<u32, _>(value_name).map_err(|e| e.to_string())
}

#[cfg(windows)]
#[command]
fn set_registry(hive: &str, subkey: &str, value_name: &str, data: u32) -> Result<(), String> {
    let root = RegKey::predef(hive_from_str(hive)?);
    let (key, _) = root.create_subkey(subkey).map_err(|e| e.to_string())?;
    key.set_value(value_name, &data).map_err(|e| e.to_string())
}

#[cfg(windows)]
use windows_sys::Win32::UI::WindowsAndMessaging::{
    SendMessageTimeoutW, HWND_BROADCAST, SMTO_NORMAL, WM_SETTINGCHANGE, WM_THEMECHANGED,
};

#[cfg(windows)]
#[command]
fn broadcast_theme_change() -> Result<(), String> {
    use std::ffi::OsStr;
    use std::iter::once;
    use std::os::windows::ffi::OsStrExt;

    unsafe {
        let wide: Vec<u16> = OsStr::new("ImmersiveColorSet").encode_wide().chain(once(0)).collect();
        let mut r: usize = 0;
        let _ = SendMessageTimeoutW(HWND_BROADCAST, WM_SETTINGCHANGE, 0, wide.as_ptr() as isize, SMTO_NORMAL, 100, &mut r);

        let _ = SendMessageTimeoutW(HWND_BROADCAST, WM_THEMECHANGED, 0, 0isize, SMTO_NORMAL, 100, &mut r);
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_registry,
            set_registry,
            broadcast_theme_change
        ])
        .setup(|app| {

            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit])?;

            TrayIconBuilder::with_id("main-tray")
                .icon(app.default_window_icon().cloned().expect("missing tray.png"))
                .tooltip("toggle-mode-widget")
                .menu(&menu) 
                .on_menu_event(|app, e| {
                    if e.id() == "quit" {
                        app.exit(0);
                    }
                })
                .on_tray_icon_event(|_tray, ev| match ev {
                    tauri::tray::TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } => {
                    if let Some(win) = _tray.app_handle().get_webview_window("main") {
                        if win.is_visible().unwrap_or(false) {
                        let _ = win.hide();
                        } else {
                        let _ = win.show();
                        let _ = win.set_focus();
                        }
                    }
                    }
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
