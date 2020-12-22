import * as c from "./class.js"; // import class Tar
// Tar Editor: main file.
// Webpack packages this file.
/*
* Clarified logic for _self:
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
		return new c.Tar(wrap, ln);
	}
};
_self.tar = tar;