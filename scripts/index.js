"use strict"; 
const editor = document.querySelector("div#editor");
let savedRange, isInFocus, text, restore, prev, selection, range, len, pos, s, r0, r, splice, endOfLine, currentLine, tabs, index;
const debounce = function(cb, wait) {
	let timeout = 0;
	return (...args) => {
		clearTimeout(timeout);
		timeout = window.setTimeout(() => cb(...args), wait);
	};
}
const insertText = function(text) {
	text = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
	document.execCommand("insertHTML", false, text);
}
const getTextNodeAtPosition = function(root, index){
	const NODE_TYPE = NodeFilter.SHOW_TEXT;
	var treeWalker = document.createTreeWalker(root, NODE_TYPE, function next(elem) {
		if(index > elem.textContent.length){
			index -= elem.textContent.length;
			return NodeFilter.FILTER_REJECT
		}
		return NodeFilter.FILTER_ACCEPT;
	});
	var c = treeWalker.nextNode();
	return {
		node: c? c: root,
		position: index
	};
}
const saveCaretPosition = function(context){
	selection = window.getSelection();
	range = selection.getRangeAt(0);
	range.setStart(context, 0);
	len = range.toString().length;

	return function restore(){
		pos = getTextNodeAtPosition(context, len);
		selection.removeAllRanges();
		range = new Range();
		range.setStart(pos.node ,pos.position);
		selection.addRange(range);
	}
}
const beforeCursor = function(context) {
	s = window.getSelection();
	r0 = s.getRangeAt(0);
	r = document.createRange();
	r.selectNodeContents(context);
	r.setEnd(r0.startContainer, r0.startOffset);
	return r.toString();
}
const getLeadingTabs = function(context) {
	splice = beforeCursor(context);
	endOfLine = splice.lastIndexOf("\n");

	currentLine = splice.substr(endOfLine+1);

	tabs = "";
	index = 0;
	while (currentLine.charAt(index++) === "\t") {
		tabs += "\t";
	}
	if (currentLine.trim().endsWith("{")) {
		tabs += "\t";
	}
	return tabs;
}
const highlight = function() {
	restore = saveCaretPosition(editor);
	editor.textContent = editor.textContent;
	hljs.highlightBlock(editor);
	restore();
}
const waitToHighlight = debounce(() => {
	highlight();
}, 30);
editor.setAttribute("contentEditable", "plaintext-only");
editor.addEventListener("keydown", function(e) {
	prev = editor.textContent;
	if (e.key === "Enter") {
		tabs = getLeadingTabs(editor);
		if (tabs.length > 0) {
			e.preventDefault();
			insertText("\n"+tabs);
		}
	}
	if (e.key === "Tab") {
		e.preventDefault();
		insertText("\t");
	}
});
editor.addEventListener("keyup", function(e) {
	if (prev !== editor.textContent){
		waitToHighlight();
	}
});
editor.addEventListener("paste", function(e) {
	e.preventDefault();
	text = (event.originalEvent || event).clipboardData.getData("text/plain");
	insertText(text);
	restore = saveCaretPosition(editor);
	hljs.highlightBlock(editor);
	restore();
});
document.addEventListener("DOMContentLoaded", function(e) {
	hljs.highlightBlock(editor);
});
window.addEventListener("load", function(e) {
	editor.focus();
});