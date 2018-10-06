// ==UserScript==
// @name         Delete Ignored Users Posts
// @description  Deletes posts if its creator its in your ignored list (@zaguarman & @Papademos69)
// @author       Pytness
// @version      1.01
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/
// @match        https://www.forocoches.com/foro/forumdisplay.php?f=*
// @match        https://www.forocoches.com/foro/profile.php?do=ignorelist*
// @match        https://www.forocoches.com/foro/showthread.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/deleteIgnoredUsersPosts/index.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/deleteIgnoredUsersPosts/index.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==

(function () {
	'use strict';

	const query = s => document.querySelector(s);
	const queryAll = s => document.querySelectorAll(s);

	const USER_ID_LIST_LS_KEY = 'tm_ignored_user_id_list';
	const USERNAME_LIST_LS_KEY = 'tm_ignored_username_list';
	const DO_UPDATE_LS_KEY = 'tm_do_ignored_list_update';
	const IGNORED_USERS_URL = "https://www.forocoches.com/foro/profile.php?do=ignorelist";

	function getajax(url, param = '') {
		let ajax = new XMLHttpRequest();
		ajax.open('GET', url, false);
		ajax.send();

		return ajax.responseText;
	}

	function parseIgnoredListHtml(html) {
		let parser = new DOMParser();
		let html_doc = parser.parseFromString(html, "text/html");

		let form = html_doc.querySelector('.userlist.floatcontainer');
		let li_list = Array.from(form.querySelectorAll('li > a'));

		let temp_user_id_list = [];
		let temp_username_list = [];

		li_list.forEach(el => {
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

		if([user_id_list, username_list, do_update].includes(null) || do_update === "1") {

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
		html = html.replace('<', '&lt;');
		html = html.replace('>', '&gt;');

		return html;
	};

	const [USER_ID_LIST, USERNAME_LIST] = getIgnoredUsersIdList();

	if((location.pathname + location.search) === '/foro/profile.php?do=ignorelist') {
		localStorage.setItem(DO_UPDATE_LS_KEY, 1);
	} else if(location.pathname === '/') {
		let authors = queryAll('.cajasnews table:not(.she) tr:not(:nth-child(1)) td:nth-child(4) a');
		if(authors === null) return;
		authors = Array.from(authors);

		authors.forEach(author => {
			let uid = parseInt(author.href.split('=').slice(-1)[0]);
			if(USER_ID_LIST.includes(uid)) {
				author.parentElement.parentElement.remove();
			}
		});
	} else if(location.pathname === '/foro/forumdisplay.php') {
		let currentId = '#threadbits_forum_' + location.search.split('?f=')[1];
		let authors = queryAll(`${currentId} span[style="cursor:pointer"]`);

		if(authors === null) return;
		authors = Array.from(authors);

		authors.forEach(author => {
			let uid = author.getAttribute('onclick').split('=').slice(-1)[0];
			uid = parseInt(uid.split("'")[0]);

			if(USER_ID_LIST.includes(uid)) {
				author.parentElement.parentElement.parentElement.remove();
			}
		});
	} else if(location.pathname === "/foro/showthread.php") {
		let authors = queryAll('td.alt2 > div > b');
		if(authors === null) return;

		authors = Array.from(authors);

		authors.forEach(author => {
			let uname = author.innerText; // possible xss injection
			let lowerUname = uname.trim().toLowerCase();

			uname = safehtml(uname);

			if(USERNAME_LIST.includes(lowerUname)) {
				let td = author.parentElement.parentElement;
				let text = td.lastElementChild;

				text.innerHTML = '<br>Este mensaje está oculto porque <b>';
				text.innerHTML += `Este mensaje está oculto porque <b>${uname}</b> está en tu `;
				text.innerHTML += '<a href="profile.php?do=ignorelist" target="_blank">lista de ignorados</a>';
			}
		});
	}
})();
