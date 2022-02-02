// ==UserScript==
// @name         Delete Ignored Users Posts
// @description  Deletes posts if its creator its in your ignored list (@zaguarman & @Papademos69)
// @author       Pytness
// @version      1.06
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/
// @match        https://www.forocoches.com/foro/forumdisplay.php?f=*
// @match        https://www.forocoches.com/foro/profile.php?do=ignorelist*
// @match        https://www.forocoches.com/foro/profile.php?do=addlist&userlist=ignore*
// @match        https://www.forocoches.com/foro/showthread.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL    https://raw.githubusercontent.com/Pytness/fc-script/master/src/deleteIgnoredUsersPosts/index.user.js
// @downloadURL  https://raw.githubusercontent.com/Pytness/fc-script/master/src/deleteIgnoredUsersPosts/index.user.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;

	const USER_ID_LIST_LS_KEY = 'tm_ignored_user_id_list';
	const USERNAME_LIST_LS_KEY = 'tm_ignored_username_list';
	const DO_UPDATE_LS_KEY = 'tm_do_ignored_list_update';

	const PATH = location.pathname;
	const URL_SEARCH = location.search;
	const URL_SEARCH_PARAMS = new URLSearchParams(URL_SEARCH);

	const FC_PATHS = {
		absolute_path: '/',
		showthread: '/foro/showthread.php',
		profile: '/foro/profile.php',
		ignorelist: '/foro/profile.php?do=ignorelist',
		forumdisplay: '/foro/forumdisplay.php'
	}

	function is_adding_new_user() {
		debugger
		return PATH == FC_PATHS.profile &&
			URL_SEARCH_PARAMS.get('do') === 'addlist' &&
			URL_SEARCH_PARAMS.get('userlist') === 'ignore';
	}

	const IGNORED_USERS_URL = "https://www.forocoches.com/foro/profile.php?do=ignorelist";

	function getajax(url, param = '') {
		let ajax = new XMLHttpRequest();
		ajax.open('GET', url, false);
		ajax.send();

		return ajax.responseText;
	}

	function parseIgnoredListHtml(html) {
		let html_doc = (new DOMParser()).parseFromString(html, "text/html");

		let form = $(html_doc).find('.userlist.floatcontainer');
		let li_list = form.find('li > a');

		let temp_user_id_list = [];
		let temp_username_list = [];

		li_list.each((i, el) => {
			let uid = parseInt(el.href.split('=').slice(-1)[0]);
			let uname = el.innerText.trim();
			uname = uname.trim().toLowerCase();

			temp_user_id_list.push(uid);
			temp_username_list.push(uname);
		});

		return [temp_user_id_list, temp_username_list];
	}

	function getIgnoredUsersIdList() {
		let user_id_list = localStorage.getItem(USER_ID_LIST_LS_KEY);
		let username_list = localStorage.getItem(USERNAME_LIST_LS_KEY);
		let do_update = localStorage.getItem(DO_UPDATE_LS_KEY);

		if ([user_id_list, username_list, do_update].includes(null) || do_update === "1") {

			let response = getajax(IGNORED_USERS_URL);
			[user_id_list, username_list] = parseIgnoredListHtml(response);

			localStorage.setItem(USER_ID_LIST_LS_KEY, JSON.stringify(user_id_list));
			localStorage.setItem(USERNAME_LIST_LS_KEY, JSON.stringify(username_list));
			localStorage.setItem(DO_UPDATE_LS_KEY, 0);

		} else {
			user_id_list = JSON.parse(user_id_list);
			username_list = JSON.parse(username_list);
		}

		return [user_id_list, username_list];
	}

	const safehtml = html => {
		return html
			.replace('<', '&lt;')
			.replace('>', '&gt;');
	};

	const [USER_ID_LIST, USERNAME_LIST] = getIgnoredUsersIdList();

	if ((PATH + URL_SEARCH) === FC_PATHS.ignorelist || is_adding_new_user()) {
		localStorage.setItem(DO_UPDATE_LS_KEY, 1);

	} else if (PATH === FC_PATHS.absolute_path) {
		let authors = $('.cajasnews a[href*="/foro/member"]');
		if (authors.length === 0) return;

		authors.each((i, author) => {
			let uid = parseInt(author.href.split('=').slice(-1)[0]);
			if (USER_ID_LIST.includes(uid)) {
				$(author).parent().parent().remove();
			}
		});

	} else if (PATH === FC_PATHS.forumdisplay) {
		let authors = $(`[id*=threadbits_forum] span[onclick]`);

		if (authors.length === 0) return;

		authors.each((i, author) => {
			let uid = $(author).attr('onclick').split('=', 2)[1];
			uid = parseInt(uid.split("'")[0]);

			if (USER_ID_LIST.includes(uid)) {
				$(author).parent().parent().parent().remove();
			}
		});

	} else if (PATH === FC_PATHS.showthread) {
		let authors = $('td.alt2 > div > b');
		if (authors.length !== 0) {
			authors.each((i, author) => {
				let uname = author.innerText; // possible xss injection
				let lowerUname = uname.trim().toLowerCase();

				uname = safehtml(uname); // get rid of possible xss

				if (USERNAME_LIST.includes(lowerUname)) {
					let td = author.parentElement.parentElement;
					let text = td.lastElementChild;

					text.innerHTML = '<br>Este mensaje está oculto porque ' +
						`<b>${uname}</b> está en tu ` +
						`<a href="${FC_PATHS.ignorelist}" target="_blank">` +
						'lista de ignorados</a>';
				}
			});
		}


		// Delete posts

		let posts = $('div[align="center"] [id*="edit"]');
		if (posts.length !== 0) {
			posts.each((i, post) => {
				let author = $(post).find('strong');

				// Only ignored users posts have 1 strong element
				if (author.length === 1) {
					post.closest('div[align="center"]').remove();
					// console.log(author);
				}
			});
		}

	}
})();
