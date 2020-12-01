"use strict";
const line_numbers = document.querySelector("div#line-numbers");
const run_btn = document.querySelector("span#run-tri");
const cmd_bar = document.querySelector("span#cmds");
let cmds = [""];
let cmdnum = 0;
run_btn.addEventListener("click", function(e) {
	const run_win = window.open(" ", "_blank");
	run_win.document.write(input.textContent || "");
});
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
		cmds[cmdnum] = cmd;
		if (cmd === "help") {
			const helpWin = window.open("./windows/help.html", "_blank");
			helpWin.document.body.focus();
		}
	}
});
