import { Component } from "@angular/core";
import { invoke } from "@tauri-apps/api/tauri";
import { Command } from "@tauri-apps/api/shell";
import { readTextFile, BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
import { resourceDir } from "@tauri-apps/api/path";

@Component({
	selector: "app-root",
	template: `
		<div class="container">
			<h1>Welcome to Tauri + Angular!</h1>

			<div class="row">
				<a href="https://tauri.app" target="_blank">
					<img src="/assets/tauri.svg" class="logo tauri" alt="Tauri logo" />
				</a>
				<a href="https://angular.io" target="_blank">
					<img src="/assets/angular.svg" class="logo angular" alt="Angular logo" />
				</a>
			</div>

			<p>Click on the logos to learn more about the frameworks</p>

			<div class="row">
				<!-- <div>
          <input #greetInput id="greet-input" placeholder="Enter a name..." />
          <button type="button" (click)="greet(greetInput.value)">Pulsa</button>
        </div> -->
				<div>
					<input #greetInput id="greet-input" value="localhost" placeholder="Enter a IP..." />
					<button type="button" (click)="ping(greetInput.value)">Ping {{ greetInput.value }}</button>
					<button type="button" (click)="pingSync(greetInput.value)">Ping SYNC {{ greetInput.value }}</button>
					<button type="button" (click)="closePing(greetInput.value)">Ping Close</button>
					<button type="button" (click)="readFile()">READ FILE</button>
					<button type="button" (click)="writeBinaryFile()">WRITE BINARY FILE</button>
					<button type="button" (click)="readBinayFile()">READ BINARY FILE</button>
					<button type="button" (click)="getRam()">GET RAM</button>
				</div>
			</div>
			<p>{{ greetingMessage }}</p>

			<label>Tauri events </label>
		</div>
	`,
	styles: [
		`
			.logo.angular:hover {
				filter: drop-shadow(0 0 2em #e32727);
			}
		`,
	],
	standalone: true,
})
export class AppComponent {
	greetingMessage = "";
	commandPing: Command[] = [];

	greet(name: string): void {
		invoke<string>("greet", { name }).then((text) => {
			this.greetingMessage = text;
		});
	}

	async ping(ip: string) {
		const command = new Command("ping", ["-c", "10", "-i", "3", ip]);
		command.on("close", (data) => {
			console.debug(`command finished with code ${data.code} and signal ${data.signal}`);
		});
		command.on("error", (error) => console.error(`command error: "${error}"`));
		command.stdout.on("data", (line) => {
			console.warn(`PING: "${line}"`);
			if (line.includes("bytes from")) {
				this.greetingMessage = line;
				// console.warn(this.greetingMessage, command);
			}
		});
		command.stderr.on("data", (line) => console.error(`command stderr: "${line}"`));

		const child = await command.spawn();
		this.commandPing.push(command);
		console.log("pid:", this.commandPing);
	}

	async pingSync(ip: string) {
		const command = new Command("ping", ["-c", "10", "-i", "3", ip]);
		command.on("close", (data) => {
			console.debug(`command finished with code ${data.code} and signal ${data.signal}`);
		});
		command.on("error", (error) => console.error(`command error: "${error}"`));
		command.stdout.on("data", (line) => {
			console.error(`OUT "${line}"`);
			if (line.includes("bytes from")) {
				this.greetingMessage = line;
				// console.debug(this.greetingMessage, command);
			}
		});
		command.stderr.on("data", (line) => console.error(`command stderr: "${line}"`));

		const child = await command.spawn();
		this.commandPing.push(command);
		console.log("pid:", this.commandPing);
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
		console.log(resourceDirPath.split("tauri-app")[0]);
		const contents = await readTextFile(
			`${resourceDirPath.split("/tauri-app")[0]}/tauri-app/src/assets/template.json`,
			{ dir: BaseDirectory.Data }
		);
		this.greetingMessage = contents;
		console.warn(JSON.parse(contents));
	}

	async writeBinaryFile() {
		const path = await resourceDir();
		const pathArray = path.split("/");
		const tauriAppIndex = pathArray.indexOf("tauri-app");
		const tauriAppPath = pathArray.slice(0, tauriAppIndex + 1).join("/");
		await writeTextFile(`${tauriAppPath}/src/assets/template-bin.json`, this.greetingMessage);
	}

	async readBinayFile() {
		const path = await resourceDir();
		const pathArray = path.split("/");
		const tauriAppIndex = pathArray.indexOf("tauri-app");
		const tauriAppPath = pathArray.slice(0, tauriAppIndex + 1).join("/");
		const data = await readTextFile(`${tauriAppPath}/src/assets/template-bin.json`);
		console.warn(data);
	}

	getRam() {
		
	}
}
