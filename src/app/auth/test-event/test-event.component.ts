import { Component } from "@angular/core";
import { invoke } from "@tauri-apps/api/tauri";
import { Command } from "@tauri-apps/api/shell";
import { readTextFile, BaseDirectory, writeTextFile, createDir } from "@tauri-apps/api/fs";
import { appDataDir, appDir, documentDir, resourceDir, runtimeDir } from "@tauri-apps/api/path";
import templateJSON from "./template.json";
import { type } from "@tauri-apps/api/os";

@Component({
	selector: "app-test-event",
	templateUrl: "./test-event.component.html",
	styleUrls: ["./test-event.component.css"],
})
export class TestEventComponent {
	greetingMessage = "localhost";
	message = "";
	pathName: string = "";
	fileData: string = "";
	commandPing: Command[] = [];
	systemLinux: boolean = true;
	pingArray: { ip: string; status: boolean; command: any; count: number }[] = [];

	constructor() {
		this.getTypeSystem(); // this.systemLinux = window.navigator.userAgent.toLowerCase().includes("windows") ? false : true;
	}

	async getTypeSystem() {
		this.systemLinux = (await (await type()).includes("Windows_NT")) ? false : true;
	}

	greet(name: string): void {
		invoke<string>("greet", { name }).then((text) => {
			this.message = text;
		});
	}

	async ping(ip: string) {
		const command = this.systemLinux
			? new Command("ping-linux", ["-c", "10", "-i", "3", ip])
			: new Command("ping-windows", ["-n", "10", ip]);

		const child = await command.spawn();
		this.commandPing.push(command);
		console.log("pid:", this.commandPing, child);

		this.pingArray.push({ ip: ip, status: false, command: child, count: 0 });
		command.on("close", (data) => {
			this.pingArray.find((p) => p.ip === ip && p.command === child)!.status = false;
			this.message = "No more ping";
			console.error(
				"FILTER",
				this.pingArray.filter((p) => p.command !== child)
			);
			this.pingArray = this.pingArray.filter((p) => p.command !== child);

			console.debug(`command finished with code ${data.code} and signal ${data.signal}`, data);
		});
		command.on("error", (error) => console.error(`command error: "${error}"`));
		command.stdout.on("data", async (line) => {
			// if (line.includes("bytes from" || line.includes("tiempo") || line.includes("time"))) {
				this.message = line;
				console.log(
					this.message,
					this.pingArray.find((p) => p.ip === ip && p.command === child),
					ip,
					child
				);
				this.pingArray.find((p) => p.ip === ip && p.command === child)!.status = true;
				this.pingArray.find((p) => p.ip === ip && p.command === child)!.count++;
				console.warn(`PING: "${line}"`);
			// }
		});
		command.stderr.on("data", (line) => console.error(`command stderr: "${line}"`));
	}

	closePing(ip: string) {
		if (this.commandPing) {
			console.warn("BORRAMOS", this.commandPing);
			console.warn("BO", this.commandPing);
		}
	}

	async readFile() {
		const resourceDirPath = await resourceDir();
		console.log(resourceDirPath);
		// const contents = await readTextFile(
		// 	`${resourceDirPath.split("/tauri-app")[0]}/tauri-app/src/assets/template.json`,
		// 	`template.json`,
		// 	{ dir: BaseDirectory.App }
		// );
		const contents = JSON.stringify(templateJSON);
		this.message = contents;
		this.fileData = contents;
		this.pathName ='./template.json (fichero en la raiz del proyecto)';
		console.warn(JSON.parse(contents));
	}

	async writeBinaryFile(type: number) {
		if(!this.fileData) return;
		const path = type === 1 ? await documentDir() : await runtimeDir();
		this.pathName = path;
		const pathArray = path.split("/");
		const tauriAppIndex = pathArray.indexOf("tauri-app");
		const tauriAppPath = pathArray.slice(0, tauriAppIndex + 1).join("/");
		// await writeTextFile(`${tauriAppPath}/src/assets/template-bin.json`, this.fileData);
		type === 1 && await createDir("rosita2.0", { dir: BaseDirectory.Document, recursive: true });
		type === 1 && await writeTextFile(`rosita2.0/template-bin.json`, this.fileData, {dir: BaseDirectory.Document});
		type === 2 && await createDir("rosita2.0", { dir: BaseDirectory.Runtime, recursive: true });
		type === 2 && await writeTextFile(`rosita2.0/template-bin.json`, this.fileData, {dir: BaseDirectory.Runtime});
		this.message = "data written";
		
	}

	async readBinayFile(type: number) {
		const path = type === 1 ? await documentDir() : await runtimeDir();
		this.pathName = path;
		const pathArray = path.split("/");
		const tauriAppIndex = pathArray.indexOf("tauri-app");
		const tauriAppPath = pathArray.slice(0, tauriAppIndex + 1).join("/");
		// const data = await readTextFile(`${tauriAppPath}/src/assets/template-bin.json`);
		let data = ''
		if(type === 1)  data = await readTextFile(`rosita2.0/template-bin.json`, { dir: BaseDirectory.Document });
		if(type === 2)  data = await readTextFile(`rosita2.0/template-bin.json`, { dir: BaseDirectory.Runtime });
		console.warn(data);
		this.message = data;
		this.fileData = data;
	}

	async getRam() {
		// const command = new Command("ping-linux", ["-c", "10", "-i", "3", 'localhost'])
		// command.on("close", (data) => { console.log(data)});
		// command.on("error", (error) => console.error(`command error: "${error}"`));
		// command.stdout.on("data", (line) => {
		// 	console.warn(`OUT "${line}"`);
		// 	this.message = line;
		// });
		
		const command = this.systemLinux
			? new Command("ram-linux", ["-m"])
			: new Command("ram-windows", ["get", "FreePhysicalMemory"]);

		const child = await command.spawn();
		this.message = "Ram: 0 / 0 GB";
		console.log("ram pid:", child);
		command.on("close", (data) => {
			console.debug(`command finished with code ${data.code} and signal ${data.signal}`, data);
		});
		command.on("error", (error) => console.error(`command error: "${error}"`));
		command.stdout.on("data", (line) => {
			if (line.includes("Mem")) {
				const ramTotal = Math.round((Number(line.split(":")[1].trim().split(" ")[0]) / 1024) * 100) / 100;
				const ramFree = Math.round((Number(line.split(" ").slice(-1)[0]) / 1024) * 100) / 100;
				this.message = this.systemLinux
					? "Ram: " + (ramTotal - ramFree).toFixed(2) + " / " + ramTotal + " GB"
					: "Ram: " + (Number(line) / 1024 / 1024).toFixed(2) + " GB";
			} else if (!this.systemLinux){
				this.message = line;
			}
		});
		command.stderr.on("data", (line) => console.error(`command stderr: "${line}"`));
	}
}
