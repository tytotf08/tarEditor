!(() => {
	if (document.querySelector("link[href='./styles/themes/soft_jubilee.css']")) {
		editor.textarea.style.backgroundColor = "white";
		editor.textarea.style.color = "black";
		editor.textarea.style.caretColor = "black";
		document.querySelectorAll(".line_numbers").forEach((el) => {
			el.style.backgroundColor = "white";
			el.style.opacity = "1";
			el.style.color = "black";
		});
	}
})();