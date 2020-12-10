const editor = tarIDE.init(document.querySelector("main"), true, Prism.highlightElement);
window.addEventListener("load", (e) => {
	editor.textarea.focus();
});
let lang_value = "language-javascript";
const langChooser = document.querySelector("select#lang");
const langCover = document.querySelector("div#status-bar div div#cover");
langChooser.addEventListener("change", (e) => {
	if (e.target.value.toLowerCase().indexOf("markdown") > -1) {
		const newClass = editor.textarea.getAttribute("class").replace(/language-(javascript|markdown|markup|css)/g, "language-markdown");
		editor.textarea.setAttribute("class", newClass);
		Prism.highlightElement(editor.textarea);
	} else if (e.target.value.toLowerCase().indexOf("css") > -1) {
		const newClass = editor.textarea.getAttribute("class").replace(/language-(javascript|markdown|markup|css)/g, "language-css");
		editor.textarea.setAttribute("class", newClass);
		Prism.highlightElement(editor.textarea);
	} else if (e.target.value.toLowerCase().indexOf("javascript") > -1) {
		const newClass = editor.textarea.getAttribute("class").replace(/language-(javascript|markdown|markup|css)/g, "language-javascript");
		editor.textarea.setAttribute("class", newClass);
		lang_value = "language-javascript";
	} else {
		const newClass = editor.textarea.getAttribute("class").replace(/language-(javascript|markdown|markup|css)/g, "language-markup");
		editor.textarea.setAttribute("class", newClass);
		lang_value = "language-markup";
	}
	langCover.innerHTML = "";
	langCover.innerHTML = e.target.value;
});