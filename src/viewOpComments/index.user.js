// ==UserScript==
// @name         viewOpComments
// @description  Este script elimina los posts que no sean del OP
// @author       pytness
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/foro/showthread.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/viewOpComments/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/viewOpComments/index.user.js
// @run-at       document-end
// @grant        GM_info
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;

	const URL_PARAMS = new URLSearchParams(location.search);
	const THREAD_ID = parseInt(URL_PARAMS.get('t'));
	const PAGE_NUMBER = parseInt(URL_PARAMS.get('page') === null ? 1 : URL_PARAMS.get('page'));

	var op_user_id = null;
	let current_document = document;

	function getUserIdFromElement(uel) {
		return parseInt(new URL(uel.href).searchParams.get('u'));
	}

	function loadOpUserIdFromHTML(doc) {
		let op = doc.querySelector('.bigusername');
		return getUserIdFromElement(op);
	}

	function getPageDocument() {
		let ajax = new XMLHttpRequest();
		ajax.open('GET', `https://www.forocoches.com/foro/showthread.php?t=${THREAD_ID}`, false);
		ajax.send();

		let parser = new DOMParser();
		return parser.parseFromString(ajax.response, "text/html");
	}

	function removeNotOpPosts() {
		$('.bigusername').each((i, el) => {
			let current_id = getUserIdFromElement(el);
			if (current_id !== op_user_id) {
				let post = $(el).closest('div[align="center"]');
				post.remove();
			}
		});
	}

	window.addEventListener('DOMContentLoaded', function (e) {
		console.log('Loaded: \n' +
			`\tName    :    ${GM_info.script.name}\n` +
			`\tVersion :    ${GM_info.script.version}\n` +
			`\tAuthor  :    ${GM_info.script.author}\n` +
			`\tUUID    :    ${GM_info.script.uuid}`
		);

		if (THREAD_ID === null) return;

		if (PAGE_NUMBER !== 1) {
			current_document = getPageDocument();
		}

		op_user_id = loadOpUserIdFromHTML(current_document);

		removeNotOpPosts();
	});
})();
