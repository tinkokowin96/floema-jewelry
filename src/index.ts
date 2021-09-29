import "../style.css";

export class App {
	loaded: boolean;
	hostName: string;
	constructor() {
		this.hostName = "http://localhost:3000/";
		this.loaded = false;
		this.loadAssets();
		this.route();
	}

	loadAssets() {
		if (!this.loaded) {
			// @ts-ignore
			const assets = window.ASSETS;
			assets.forEach((url: string) => {
				const image = new Image();
				image.src = url;
			});
		}
		this.loaded = true;
	}

	route() {
		const product = document.getElementById("product");
		product?.addEventListener("click", () => {
			fetch("http://127.0.0.1:3000/")
				.then((res: any) => res.text())
				.then((html: any) => {
					document.body.innerHTML = html;
				});
			history.pushState("", "", "/");
		});
	}
}

new App();
