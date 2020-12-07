"use strict";
const line_numbers = document.querySelector("div#line-numbers");
const run_btn = document.querySelector("a#run-tri");
const cmd_bar = document.querySelector("span#cmds");
const lang = document.querySelector("select#lang-chooser");
const lang_cover = document.querySelector("span.cover");
let cmds = [""];
let cmdnum = 0;
lang_cover.innerHTML = lang.value + " &#x25BC;";
window.onkeydown = function(e) {
	if ((e.metaKey || e.ctrlKey) && e.key === "r") {
		e.preventDefault();
		run_btn.dispatchEvent(new Event("click"));
	}
}
cmd_bar.setAttribute("spellcheck", false);
cmd_bar.addEventListener("keydown", function(e) {
	if (e.key === "Enter") {
		e.preventDefault();
		cmdnum++;
		const cmd = cmd_bar.textContent;
		for (let i = 0; i < cmd.length; i++) {
			document.execCommand("delete");
		}
		cmds[cmdnum] = cmd;
		if (cmd === "help") {
			const helpWin = window.open("./windows/help.html", "_blank");
			helpWin.document.body.focus();
		} else if (cmd === "run") {
			run_btn.dispatchEvent(new Event("click"));
		}
		cmd_bar.focus();
	}
	if (e.key === "ArrowUp") {
		e.preventDefault();
		cmd_bar.textContent = "";
		document.execCommand("insertHTML", false, cmds[cmdnum]);
		cmdnum--;
		cmd_bar.focus();
		document.execCommand("insertHTML", false, "&nbsp;");
		document.execCommand("delete");
	}
	if (e.key === "ArrowDown") {
		e.preventDefault();
		cmd_bar.textContent = "";
		document.execCommand("insertHTML", false, cmds[cmdnum+1]);
		cmdnum++;
		cmd_bar.focus();
		document.execCommand("insertHTML", false, "&nbsp;");
		document.execCommand("delete");
	}
});
cmd_bar.addEventListener("focus", function(e) {
	document.execCommand("insertHTML", false, "&nbsp;");
	document.execCommand("delete");
});
lang.addEventListener("change", function(e) {
	if (this.value.indexOf("HTML") > -1) {
		isHTML();
	} else if (this.value.indexOf("JavaScript") > -1) {
		isJS();
	} else if (this.value.indexOf("CSS") > -1) {
		isCSS();
	} else {
		isMD();
	}
	lang_cover.innerHTML = this.value + " &#x25BC;";
});