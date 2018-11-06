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

	const INTERVAL_DELAY = 1000; // Min delay between page requests

	const SHOWTHREAD_URL = 'https://www.forocoches.com/foro/showthread.php';
	const CURRENT_URL = new URL(location.href);
	const URL_PARAMS = CURRENT_URL.searchParams;
	const THREAD_ID = parseInt(URL_PARAMS.get('t'));

	if (THREAD_ID === null) return;

	// Redirect to page #1
	(() => {
		let pageNumber = URL_PARAMS.get('page');

		if (pageNumber === null || pageNumber !== '1') {
			URL_PARAMS.set('page', '1');
			location.replace(CURRENT_URL.href);
		}

	})();

	let OP_USER_ID = null;

	function threadIsEchenique(currentDom) {
		return $(currentDom).find('[id^="fcthread"]').length === 0;
	}

	function getUserIdFromElement(uel) {
		return parseInt(new URL(uel.href).searchParams.get('u'));
	}

	function loadOpUserIdFromHTML(doc) {
		let op = doc.querySelector('.bigusername');
		return getUserIdFromElement(op);
	}

	function asyncGetPageDocument(page_id) {

		return fetch(`${SHOWTHREAD_URL}?t=${THREAD_ID}&page=${page_id}`)
			.then(response => response.arrayBuffer())
			.then(arrayBuffer => {
				let encoder = new TextDecoder("ISO-8859-1");
				arrayBuffer = new Uint8Array(arrayBuffer);
				return encoder.decode(arrayBuffer);
			})
			.then(text => {
				let parser = new DOMParser();
				return parser.parseFromString(text, "text/html");
			});
	}

	function getPageCount(currentDom) {
		let nav = $('.pagenav .vbmenu_control');
		let num = 1;
		if (nav.length !== 0) {
			num = nav[0].innerText.trim().split(' ')[3];
			num = parseInt(num);
		}
		return num;
	}

	function removeNotOpPosts(currentDom) {
		// Find not op posts
		$(currentDom).find('.bigusername').each((i, el) => {
			let current_id = getUserIdFromElement(el);
			if (current_id !== OP_USER_ID) {
				let post = $(el).closest('div[align="center"]');
				post.remove();
			}
		});

		$(currentDom)
			.find('.alt2 .smallfont [href^="profile.php"]')
			.each((i, el) => {
				$(el).closest('div[align="center"]').remove();
			});
	}

	window.addEventListener('DOMContentLoaded', function (e) {
		console.log('Loaded: \n' +
			`\tName    :    ${GM_info.script.name}\n` +
			`\tVersion :    ${GM_info.script.version}\n` +
			`\tAuthor  :    ${GM_info.script.author}\n` +
			`\tUUID    :    ${GM_info.script.uuid}`
		);

		if (!threadIsEchenique(document)) {
			const PAGE_COUNT = getPageCount();
			OP_USER_ID = loadOpUserIdFromHTML(document);

			let currentPageId = 2;
			let lastKnownPageId = null;
			let lastPromise = null;

			removeNotOpPosts(document);

			let intervalId = setInterval(function () {

				if (currentPageId >= PAGE_COUNT) {
					clearInterval(intervalId);
				} else if (lastKnownPageId !== currentPageId) {
					asyncGetPageDocument(currentPageId)
						.then((value) => {
							console.log(`Loaded page ${currentPageId}`);
							let posts = $(value).find('#posts');
							removeNotOpPosts(posts[0]);
							posts.children().each((i, el) => {
								$('#posts').append(el);
							});
						})
						.catch((err) => {
							console.log(`Error loading page ${currentPageId}`, err)
						})
						.finally(() =>
							currentPageId++
						);

					lastKnownPageId = currentPageId;
				}
			}, INTERVAL_DELAY);

			// removeNotOpPosts();
		}

	});
})();
