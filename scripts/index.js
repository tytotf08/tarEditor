var editor, shadow, textToHighlight;
String.prototype.insertAt = function(index,str){
  return this.slice(0,index) + str + this.slice(index)
}
function display(evt) {
	evt.stopPropagation();
	textToHighlight = editor.value.replace("<", "&lt;");
	textToHighlight = textToHighlight.replace(">", "&gt;");
	textToHighlight = textToHighlight.insertAt(editor.selectionEnd, `<span id = "cursor"></span>`);
	shadow.innerHTML = textToHighlight;
}
document.addEventListener("DOMContentLoaded", function() {
	editor = document.querySelector("textarea#editor");
	shadow = document.querySelector("div#shadow");
	editor.addEventListener("input", display);
	editor.addEventListener("mouseup", display);
});