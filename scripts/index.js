"use strict"; 
const editor = document.querySelector("div#editor");
let savedRange, isInFocus, text, restore, prev, selection, range, len, pos, s, r0, r, splice, endOfLine, currentLine, tabs, index, NODE_TYPE, treeWalker, html, last, c, oldArray, prefix;
let focused = true;
let atInfo = {};
let incarnations = [];
let at = 0;
let instanceIsComposing = false;
let recording;
const diff = function() {
	return prev !== editor.textContent;
}
const isCmd = function(e) {
	return e.metaKey || e.ctrlKey;
}
const isShift = function(e) {
	return e.shiftKey;
}
const isUndo = function(e) {
	return isCmd(e) && !isShift(e) && e.keyCode === 90;
}
const isRedo = function(e) {
	return (isCmd(e) && isShift(e) && e.keyCode === 90) || (isCmd(e) && !isShift(e) && e.keyCode === 89);
}
const isTimeToRecord = function(e) {
	return !isRedo(e) && !isUndo(e) && !e.metaKey && !e.ctrlKey && !e.altKey && !e.key.startsWith("Arrow");
}
const debounce = function(func, wait) {
	return (...args) => {
		window.setTimeout(() => func(...args), wait);
	};
}
const record = function() {
	if (!focus) return;
	html = editor.innerHTML;
	pos = saveCaretPosition(editor);
	console.log(pos);
	last = incarnations[at];
	if (last) {
		if (last.html === html && last.pos === last.pos) {
			return;
		}
	}
	at++;
	incarnations[at] = {html, pos};
	console.log(incarnations[at]);
	console.log(incarnations);
}
const waitToRecord = debounce((event) => {
	if (isTimeToRecord(event)) {
		record();
		recording = false;
	}
}, 100);
const insertText = function(text) {
	text = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
	document.execCommand("insertHTML", false, text);
}
const saveCaretPosition = function(context){
	range = window.getSelection().getRangeAt(0);
	prefix = range.cloneRange();
	prefix.selectNodeContents(context);
	prefix.setEnd(range.endContainer, range.endOffset);
	return prefix.toString().length;
}
const restoreCaretPosition = function(pos, context) {
	for (const node of context.childNodes) {
	  if (node.nodeType == Node.TEXT_NODE) {
			if (node.length >= pos) {
			  const range = document.createRange();
			  const sel = window.getSelection();
			  range.setStart(node, pos);
			  range.collapse(true);
			  sel.removeAllRanges();
			  sel.addRange(range);
			  return -1;
			} else {
			  pos = pos - node.length;
			}
		  } else {
			pos = restoreCaretPosition(pos, node);
			if (pos < 0) {
			  return pos;
			}
	  }
	}
	return pos;
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
	pos = saveCaretPosition(editor);
	editor.textContent = editor.textContent;
	hljs.highlightBlock(editor);
	restoreCaretPosition(pos, editor);
}
const waitToHighlight = debounce(function(){
	highlight();
}, 50);
editor.addEventListener("keydown", function(e) {
	if (diff()) {
		prev = editor.textContent;
	}
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
	if (e.key === "Backspace") {
		e.preventDefault();
		document.execCommand("delete");
	}
	if (isRedo(e)) {
		e.preventDefault();
		at++;
		if (incarnations[at]) {
			editor.innerHTML = incarnations[at].html;
			restoreCaretPosition(incarnations[at].pos, editor);
		}
		if (at > incarnations.length) {
			at--;
		}
	}
	if (isUndo(e)) {
		e.preventDefault();
		at--;
		if (incarnations[at]) {
			editor.innerHTML = incarnations[at].html;
			restoreCaretPosition(incarnations[at].pos, editor);
		}
		if (at < 0) {
			at = 0;
		}
	}
});
editor.addEventListener("keyup", function(e) {
	if (e.isComposing) return;
	if (diff()){
		waitToHighlight();
	}
	waitToRecord(e);
});
editor.addEventListener("paste", function(e) {
	e.preventDefault();
	text = (e.originalEvent || e).clipboardData.getData("text/plain");
	insertText(text);
	pos = saveCaretPosition(editor);
	hljs.highlightBlock(editor);
	restoreCaretPosition(pos, editor);
});
editor.addEventListener("focus", function(e) {
	focused = true;
});
editor.addEventListener("blur", function(e) {
	focused = false;
});
document.addEventListener("DOMContentLoaded", function(e) {
	hljs.highlightBlock(editor);
});
window.addEventListener("load", function(e) {
	editor.focus();
});