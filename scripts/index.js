"use strict"; 
const editor = document.querySelector("div#editor");
const langChooser = document.querySelector("select#lang");
const fluidStyles = document.querySelector("style");
let baseRange,c,currentLine,currentLine1,currentLine2,poppedSplice, endOfLine,gutterC,html,i,index,last,len,lines,node,NODE_TYPE,pos,prefix,prev,r,range,rangeWeAreUsing,restore,savedRange,splice,tabs,text,treeWalker;
let indexLines = "";
let focused = true;
let incarnations = [];
let at = 0;
let gutter;
const diff = function() {
	return prev !== editor.textContent;
};
const handleKey = function(e) {
	getLines();
	if (diff()) {
		prev = editor.textContent;
	}
	if (e.key === "Enter") {	
		tabs = getLeadingTabs(editor);
		if (tabs.length > 0) {
			e.preventDefault();
			insertText("\n"+tabs);
		}
		getLines();
	}
	if (e.key === "Tab") {
		e.preventDefault();

		if (e.shiftKey) {
			pos = saveCaretPosition(editor);
			html = editor.textContent;
			splice = beforeCursor(editor);
			endOfLine = splice.lastIndexOf("\n");
			console.log(endOfLine);
			splice = splice.split("\n");
			console.log(splice);
			if (splice[splice.length-1].startsWith("\t")) {
				splice[splice.length-1] = splice[splice.length-1].substring(1);
				editor.textContent = html.replace(beforeCursor(editor), splice.join("\n"));
				Prism.highlightElement(editor);
				restoreCaretPosition(pos-1, editor);
				getLines();
			}
		} else {
			insertText("\t");
		}
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
		getLines();
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
		getLines();
	}
}
const isJS = function() {
	html = editor.textContent;
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-javascript");
	editor.innerHTML = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 50);
}
const isHTML = function() {
	html = editor.textContent;
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-markup");
	editor.innerHTML = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 50);
}
const isCSS = function() {
	html = editor.textContent;
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-css");
	editor.innerHTML = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 50);
}
const isCmd = function(e) {
	return e.metaKey || e.ctrlKey;
};
const isShift = function(e) {
	return e.shiftKey;
};
const isUndo = function(e) {
	return isCmd(e) && !isShift(e) && e.key === "z";
};
const isRedo = function(e) {
	return (isCmd(e) && isShift(e) && e.key === "z") || (isCmd(e) && !isShift(e) && e.key === "y");
};
const isTimeToRecord = function(e) {
	return !isRedo(e) && !isUndo(e) && !e.metaKey && !e.ctrlKey && !e.altKey && !e.key.startsWith("Arrow");
};
const record = function() {
	if (!focus) return;
	html = editor.innerHTML;
	pos = saveCaretPosition(editor);
	;
	last = incarnations[at];
	if (last) {
		if (last.html === html && last.pos === last.pos) {
			return;
		}
	}
	at++;
	incarnations[at] = {html, pos};
};
const waitToRecord = function(event) {
	window.setTimeout(function(e) {
		highlight(); // so, if we undo to a non-highlighted token, it will always be highlighted
		if (isTimeToRecord(event)) {
			record();
		}
	}, 100);
};
const insertText = function(text) {
	text = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
	document.execCommand("insertHTML", false, text);
};
const saveCaretPosition = function(context){
	range = window.getSelection().getRangeAt(0);
	prefix = range.cloneRange();
	prefix.selectNodeContents(context);
	prefix.setEnd(range.endContainer, range.endOffset);
	return prefix.toString().length;
};
const restoreCaretPosition = function(pos, context) {
	for (node of context.childNodes) {
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
};
const beforeCursor = function(context) {
	baseRange = window.getSelection().getRangeAt(0);
	rangeWeAreUsing = document.createRange();
	rangeWeAreUsing.selectNodeContents(context);
	rangeWeAreUsing.setEnd(baseRange.startContainer, baseRange.startOffset);
	return String(rangeWeAreUsing);
};
function afterCursor(context) {
  baseRange = window.getSelection().getRangeAt(0);
	rangeWeAreUsing = document.createRange();
	rangeWeAreUsing.selectNodeContents(context);
	rangeWeAreUsing.setEnd(baseRange.endContainer, baseRange.startOffset);
	return String(rangeWeAreUsing);
 }
const hasLeadingTabs = function(context) {
	splice = beforeCursor(context);
	endOfLine = splice.lastIndexOf("\n");

	currentLine = splice.substr(endOfLine+1);
	return currentLine.charAt(0) === "\t";
};
const findPadding = function(text) {
    // Find beginning of previous line.
    let i = text.length - 1;
    while (i >= 0 && text[i] !== "\n")
        i--;
    i++;
    // Find padding of the line.
    let j = i;
    while (j < text.length && /[ \t]/.test(text[j]))
        j++;
    return [text.substring(i, j) || "", i, j];
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
};
const getLines = function() {
	lines = editor.textContent.split(/\n(?!$)/g).length;
	indexLines = ["1\\00000a"];
	for (i=1;i<lines;i++) {
		indexLines.push((i+1)+"\\00000a");
	}
	gutterC = indexLines.join("");
	fluidStyles.innerHTML = "div#editor::before{content: \""+ gutterC + "\";}";
	document.querySelector("span#line").innerHTML = lines;
}
const highlight = function() {
	pos = saveCaretPosition(editor);
	editor.textContent = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	getLines();
};
const waitToHighlight = function() {
	window.setTimeout(function() {
		highlight();
	}, 50);
};
editor.addEventListener("keydown", function(e) {
	handleKey(e);
});
editor.addEventListener("keyup", function(e) {
	if (e.isComposing) return;
	range = window.getSelection();
  if (range.toString() !== "") return; // cmd-a
	if (diff()){
		waitToHighlight();
	}
	waitToRecord(e);
});
editor.addEventListener("input", function(e) {
	getLines();
});
editor.addEventListener("paste", function(e) {
	e.preventDefault();
	text = (e.originalEvent || e).clipboardData.getData("text/plain");
	insertText(text);
	pos = saveCaretPosition(editor);
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
});
editor.addEventListener("focus", function(e) {
	focused = true;
});
editor.addEventListener("blur", function(e) {
	focused = false;
});
langChooser.addEventListener("change", function(e) {
	e.preventDefault();
	if (e.target.value === "JavaScript") isJS();
	if (e.target.value === "HTML") isHTML();
	if (e.target.value === "CSS") isCSS();;
});
document.addEventListener("DOMContentLoaded", function(e) {
	Prism.highlightElement(editor);
});
window.addEventListener("load", function(e) {
	getLines();
	editor.focus();
});