var editor, shadow, textToHighlight;
String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
function display(evt) {
	evt.stopPropagation();
	textToHighlight = editor.value;
	textToHighlight = textToHighlight.replace(/</g, "&lt;");
	textToHighlight = textToHighlight.replace(/>/g, "&gt;");
	textToHighlight = textToHighlight.splice(editor.selectionStart, 0, `<span id = "cursor"></span>`);
	shadow.innerHTML = textToHighlight;
}
document.addEventListener("DOMContentLoaded", function() {
	editor = document.querySelector("textarea#editor");
	shadow = document.querySelector("div#shadow");
	editor.addEventListener("input", display);
	editor.addEventListener("mouseup", display);
});