import {Tar} from "./class.js"; // import class Tar

// _self is the global scope. it's determined by nested if statements.
// below is a clarification.
/*
* if window it's window
* else
**** if global it's global
**** else
******** if self it's self
******** else
************ it's this
*/

const _self = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this;

const tar = {
	init: (wrap, ln) => {
		return new Tar(wrap, ln);
	}
};

_self.tar = tar;