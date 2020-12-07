const tab_boss = document.body;
class doc {
	constructor() {
		this.pos = 0;
		this.textcontent = "";
		this.focus = true;
		this.tab = new tab();
		this.tab.addEventListener("tabfocus", function(e) {

		});
		this.tab.children[0].addEventListener("closetab", function(e) {
			
		});
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