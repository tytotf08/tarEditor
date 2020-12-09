const editor = tarIDE.init(document.querySelector("main"), true, Prism.highlightElement);
window.addEventListener("load", (e) => {
	editor.textarea.focus();
});
let lang_value = "language-javascript";
const langChooser = document.querySelector("select#lang");
const langCover = document.querySelector("div#status-bar div div#cover");
langChooser.addEventListener("change", (e) => {
	if (e.target.value.toLowerCase().indexOf("markdown") > -1) {
		editor.textarea.classList.remove(lang_value);
		editor.textarea.classList.add("language-markdown");
		lang_value = "language-markdown";
		Prism.highlightElement(editor.textarea);
	} else if (e.target.value.toLowerCase().indexOf("css") > -1) {
		editor.textarea.classList.remove(lang_value);
		editor.textarea.classList.add("language-css");
		lang_value = "language-css";
	} else if (e.target.value.toLowerCase().indexOf("javascript") > -1) {
		editor.textarea.classList.remove(lang_value)
		editor.textarea.classList.add("language-javascript");
		lang_value = "language-javascript";
	} else {
		editor.textarea.classList.remove(lang_value);
		editor.textarea.classList.add("language-markup");
		lang_value = "language-markup";
	}
	langCover.innerHTML = "";
	langCover.innerHTML = e.target.value;
});