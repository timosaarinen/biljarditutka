use biljarditutka_core::PROJECT_NAME;

fn main() {
    let command = std::env::args().nth(1).unwrap_or_else(|| "help".to_owned());

    match command.as_str() {
        "status" => print_status(),
        "help" | "--help" | "-h" => print_help(),
        other => {
            eprintln!("unknown command: {other}\n");
            print_help();
            std::process::exit(2);
        }
    }
}

fn print_status() {
    println!("{PROJECT_NAME}");
    println!("status: scaffold ready");
    println!("next: camera ingest -> table calibration -> ball tracking");
}

fn print_help() {
    println!("{PROJECT_NAME} - open-source computer vision for smart pool tables");
    println!();
    println!("USAGE:");
    println!("    biljarditutka status");
}
