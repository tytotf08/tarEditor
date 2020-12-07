let documents = [];
const tab_boss = document.querySelector("div#tabs");
class doc {
	constructor(pos, textcontent, focus) {
		this.pos = pos || 0;
		this.textcontent = textcontent || "";
		this.focus = focus || true;
		this.tab = new tab();
		console.log(this.tab);
		this.tab.addEventListener("tabfocus", function() {
			console.log("waow");
			document.querySelectorAll("div.tab").forEach(function(el) {
				
			});
			this.style.backgroundColor = "blue";
		});
		this.tab.children[0].addEventListener("closetab", function() {
			console.log("blaow");
		});
		tab_boss.appendChild(this.tab);
	}
}
class tab {
	constructor() {
		this.tab = document.createElement("DIV");
		this.tab.setAttribute("class", "tab");
		this.tab.addEventListener("click", this.doaclick);
		this.tab.innerHTML = "untitled, sadly";
		this.closer = document.createElement("A");
		this.closer.setAttribute("class", "closer");
		this.closer.addEventListener("click", (e) =>  {
			this.doaclosingclick(e);
		});
		this.closer.innerHTML = "X";
		this.tab.appendChild(this.closer);
		return this.tab;
	}
	doaclick() {
		console.log("click");
		this.dispatchEvent(new Event("tabfocus"));
	}
	doaclosingclick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.closer.dispatchEvent(new Event("closetab"));
	}
}