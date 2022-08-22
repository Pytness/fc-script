// ==UserScript==
// @name         Continuous Scroll
// @description  Press ctrl-q on the top to go to the prev page or press ctrl-q on the bottom to go to the next page
// @author       Pytness
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://forocoches.com/foro/showthread.php?t=*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL    https://raw.githubusercontent.com/Pytness/fc-script/master/src/continuousScroll/index.user.js
// @downloadURL  https://raw.githubusercontent.com/Pytness/fc-script/master/src/continuousScroll/index.user.js
// @run-at       document-end
// @grant        GM_getResourceText
// @grant        GM_info
// @grant        unsafeWindow
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;

	let html = window.document.documentElement;
	let currentScrollPos = window.scrollY;
	let pageHeight = html.scrollHeight - html.clientHeight;

	window.addEventListener('scroll', function (e) {
		currentScrollPos = window.scrollY;
		pageHeight = html.scrollHeight - html.clientHeight;
	});

	window.addEventListener('keydown', function (e) {
		if (e.code == 'KeyQ' && !e.shiftKey && !e.altKey && !e.metaKey && e.ctrlKey) {

			e.preventDefault();

			if (currentScrollPos == 0) {
				let prev = $('[rel="prev"]');
				if (prev.length > 0) prev[0].click();

			} else if (currentScrollPos == pageHeight) {
				let next = $('[rel="next"]');
				if (next.length > 0) next[0].click();
			}
		}
	});

	window.addEventListener('load', function () {
		console.log('Loaded: \n' +
			`\tName    :    ${GM_info.script.name}\n` +
			`\tVersion :    ${GM_info.script.version}\n` +
			`\tAuthor  :    ${GM_info.script.author}\n` +
			`\tUUID    :    ${GM_info.script.uuid}`
		);
	});
})();
