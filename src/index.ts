import "../style.css";

const product = document.getElementById("product");
const template = document.querySelector(".content");
product?.addEventListener("click", () => {
	fetch("http://localhost:3000/")
		.then((res: any) => res.text())
		.then((html: any) => {
			// // Initialize Dom
			// const parser = new DOMParser();

			// // parse the converted text
			// const doc = parser.parseFromString(html, "text/html");

			// console.log(doc);
			document.body.innerHTML = html;
		});

	// history.pushState("", "", "/");
});
