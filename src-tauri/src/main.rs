#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use gethostname::gethostname;
// use socket2::{Domain, Socket, Type};
// use std::io::Error;
use std::net::{IpAddr, UdpSocket};
// use std::process::Command;
// use std::str::from_utf8;
use std::time::Duration;

const BUFSIZE: usize = 65535;
const PORT: u16 = 37029;
const LISTEN_PORT: u16 = 37030;
const DEVICES_LICENSED_FILE_URL: &str =
    "/home/david/bionet/test/tauri-app/extensions/spawnedProcess/discovery/license.json";
const UDP_MESSAGE_TEXT: &str = "Looking for Rosita instances";
const URL_DOMAIN: &str = "bionet.local";

#[derive(serde::Deserialize, Debug)]
struct License(pub(crate) Vec<Device>);

#[derive(serde::Deserialize, Debug)]
struct Device {
    sn: String,
    #[serde(default)]
    ip: Option<String>,
    #[serde(default)]
    url: Option<String>,
}
// #[tauri::command]
fn get_my_ips() -> Vec<IpAddr> {
    if cfg!(target_os = "windows") {
        let hostname = gethostname();
        hostname
            .to_string_lossy()
            .split_whitespace()
            .map(|s| s.parse().unwrap())
            .collect::<Vec<IpAddr>>()
    } else {
        let output = std::process::Command::new("hostname")
            .arg("--all-ip-addresses")
            .output()
            .expect("No se pudo ejecutar el comando hostname");

        let ips = match String::from_utf8(output.stdout) {
            Ok(it) => it,
            Err(_) => return vec![],
        };
        ips.split_whitespace()
            .map(|s| s.parse().unwrap())
            .collect::<Vec<IpAddr>>()
    }
}

#[tauri::command]
fn udp_send() -> Result<(), String> {
    use serde_json::{from_str, Value};
    use std::fs::File;
    use std::io::Read;

    let mut file = File::open(DEVICES_LICENSED_FILE_URL).unwrap();
    let mut data = String::new();
    file.read_to_string(&mut data).unwrap();

    let json_data: Value = from_str(&data).unwrap();
    let devices = &json_data["devices"];

    // let devices: Vec<Device> = serde_json::from_str::<Vec<Device>>(&json_data).unwrap();

    println!("\n\nRUST devices -> {:?}", devices);

    // let devices: Vec<Device> = serde_json::from_str(
    //     &std::fs::read_to_string(DEVICES_LICENSED_FILE_URL).map_err(|err| err.to_string())?,
    // )
    // .map_err(|err| err.to_string())?;
    let my_ips = get_my_ips();
    println!("\n\nRUST my_ips -> {:?}", my_ips);
    
    Ok(for ip in my_ips {
        //         // Create a UDP socket
        println!("\n\nRUST 1 -> {:?}", ip);
        
        let sock = match UdpSocket::bind(format!("{}:{}", ip, LISTEN_PORT)) {
            Ok(sock) => sock,
            Err(_) => {
                // handle error
                continue;
            }
        };
        
        //         // Start looking for Rosita instances
        println!("\n\nRUST 2 -> {:?}", ip);
        match sock.send_to(UDP_MESSAGE_TEXT.as_bytes(), format!("<broadcast>:{}", PORT)) {
            Ok(s) => s,
            Err(e) => {
                e;
                continue;
            }
        };
        
        println!("\n\nRUST 3 -> {:?}", ip);
        let delta_t = Duration::from_secs(5);
        let limit_time = std::time::Instant::now() + delta_t;
        
        while devices
            .as_array()
            .unwrap()
            .iter()
            .map(|x| x["sn"].to_string())
            .collect::<Vec<_>>()
            .len()
            > 0
        {
            match sock.recv_from(&mut [0; BUFSIZE]) {
                Ok((data, address)) => {
                    if std::time::Instant::now() >= limit_time {
                        break;
                    }
                    let bytes = data.to_le_bytes();
                    let byte_slice: &[u8] = &bytes;
                    let data = byte_slice;

                    // let data = &data[..data.len()];
                    // let data = from_utf8(data).unwrap();
                    match serde_json::from_slice::<serde_json::Value>(&data) {
                        Ok(json_recv) => {
                            for data in json_recv.as_array().unwrap() {
                                let resp = match devices
                                    .as_array()
                                    .unwrap()
                                    .iter()
                                    .find(|x| x["sn"] == data["sn"])
                                {
                                    Some(device) => device,
                                    None => continue,
                                };

                                let mut updated_resp = Device {
                                    sn: resp["sn"].to_string(),
                                    ip: Some(resp["ip"].to_string()),
                                    url: Some(resp["url"].to_string()),
                                };
                                let ip = address.ip();
                                let url = format!(
                                    "{}.{}",
                                    address.ip().to_string().replace(".", ""),
                                    URL_DOMAIN
                                );
                                // Update in-memory license.json with IPs and url
                                // resp.ip = Some(ip.to_string());
                                // resp.url = Some(url);
                                updated_resp.ip = Some(ip.to_string());
                                updated_resp.url = Some(url);
                            }
                        }
                        Err(_) => {
                            continue;
                        }
                    }
                }
                Err(_) => {
                    // handle error
                    break;
                }
            }
        }
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![udp_send])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
