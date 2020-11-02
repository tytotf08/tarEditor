"use strict";
let savedRange,isInFocus;
function saveCaretPosition(context){
	var selection = window.getSelection();
	var range = selection.getRangeAt(0);
	range.setStart(  context, 0 );
	var len = range.toString().length;

	return function restore(){
		var pos = getTextNodeAtPosition(context, len);
		selection.removeAllRanges();
		var range = new Range();
		range.setStart(pos.node ,pos.position);
		selection.addRange(range);

	}
}
function beforeCursor(context) {
  const s = window.getSelection();
  const r0 = s.getRangeAt(0);
  const r = document.createRange();
  r.selectNodeContents(context);
  r.setEnd(r0.startContainer, r0.startOffset);
  return r.toString();
}
function getLeadingTabs(context) {
	var splice = beforeCursor(context);
	var endOfLine = splice.lastIndexOf("\n");

	var currentLine = splice.substr(endOfLine+1);

	var tabs = "";
  var index = 0;
  while (currentLine.charAt(index++) === "\t") {
    tabs += "\t";
  }
  if (currentLine.trim().endsWith("{")) {
  	tabs += "\t";
  }
  return tabs;
}

function getTextNodeAtPosition(root, index){
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
const editor = document.querySelector("div#editor");
editor.contentEditable = true;
editor.addEventListener("input", function(e) {
	e.stopPropagation();
	let restore = saveCaretPosition(this);
	editor.textContent = editor.textContent;
  hljs.highlightBlock(editor);
	restore();
});
editor.addEventListener("keydown", function(e) {
	if (e.keyCode === 13) {
		var tabs = getLeadingTabs(editor);
		document.execCommand("insertHTML", false, "\n"+tabs);
	}
	if (e.keyCode === 9) {
		e.preventDefault();
		document.execCommand("insertHTML", false, "\t");
	}
});
document.addEventListener("DOMContentLoaded", function(e) {
	hljs.highlightBlock(editor);
});