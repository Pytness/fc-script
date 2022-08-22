// ==UserScript==
// @name         Highlight Dangerous Posts
// @description  Este script destaca los hilos que sean +18, +16, +14, +nsfw, +serio
// @author       comandantexd
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://forocoches.com/
// @match        https://forocoches.com/foro/forumdisplay.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/highlightDangerousPosts/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/highlightDangerousPosts/index.user.js
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;
	const PATH = location.pathname;

	let rowsSelected;
	let regularSel;

	$.expr[':'].icontains = function (a, i, m) {
		return jQuery(a).text().toUpperCase()
			.indexOf(m[3].toUpperCase()) >= 0;
	};

	const flags = ['+18', '+16', '+14', '+nsfw', 'nsfw', '+serio', 'tema serio', 'temaserio'];

	if (PATH == "/foro/forumdisplay.php") {
		regularSel = flags.map(f => `a:icontains('${f}')`).join(', ');
		rowsSelected = $(regularSel).parent().parent();
	} else {
		regularSel = flags.map(f => `a[title*='${f}' i]`).join(', ');
		rowsSelected = $(regularSel).parent();
	}

	rowsSelected.css({
		backgroundColor: '#FFD7D1',
		textDecoration: 'underline'
	});
})();
