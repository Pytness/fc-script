// ==UserScript==
// @name         Delete Ignored Users Posts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Deletes posts if its creator its in your ignored list (@zaguarman & @Papademos69)
// @author       Pytness
// @match        https://www.forocoches.com/
// @match        https://www.forocoches.com/foro/forumdisplay.php?f=*
// @match        https://www.forocoches.com/foro/profile.php?do=ignorelist
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @resource     iconsJson https://raw.githubusercontent.com/Pytness/fc-script/master/src/iconAutocomplete/icons.json
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/deleteIgnoredUsersPosts/index.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/deleteIgnoredUsersPosts/index.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==

(function () {
	'use strict';

	const USER_ID_LIST_LS_KEY = 'tm_ignored_user_list';
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

		let form = html_doc.querySelector('form[action="profile.php?do=updatelist&userlist=ignore"]');
		let li_list = Array.from(form.querySelectorAll('li > a'));

		let temp_user_id_list = [];

		li_list.forEach(el => {
			let uid = parseInt(el.href.split('=').slice(-1)[0]);
			let uname = el.innerText;

			temp_user_id_list.push(uid);
		});

		return temp_user_id_list;
	}

	function getIgnoredUsersIdList() {
		let user_list = localStorage.getItem(USER_ID_LIST_LS_KEY);

		if (user_list === null) {
			user_list = parseIgnoredListHtml(getajax(IGNORED_USERS_URL));
			localStorage.setItem(USER_ID_LIST_LS_KEY, JSON.stringify(user_list));

		} else {
			user_list = JSON.parse(user_list);
		}

		return user_list;
	}

	const USER_ID_LIST = getIgnoredUsersIdList();

	if (location.href === 'https://www.forocoches.com/') {
		let authors = document.querySelectorAll('.cajasnews table:not(.she) tr:not(:nth-child(1)) td:nth-child(4) a');
		authors = Array.from(authors);

		authors.forEach(author => {
			let uid = parseInt(author.href.split('=').slice(-1)[0]);
			if (USER_ID_LIST.includes(uid)) {
				author.parentElement.parentElement.remove();
			}
		});
	} else if (location.href.split('=')[0] === 'https://www.forocoches.com/foro/forumdisplay.php?f') {
		let authors = document.querySelectorAll('#threadbits_forum_2 tr td:nth-child(3) div.smallfont span[style="cursor:pointer"]');
		authors = Array.from(authors);

		authors.forEach(author => {
			let uid = author.getAttribute('onclick').split('=').slice(-1)[0];
			uid = parseInt(uid.split("'")[0]);

			if (USER_ID_LIST.includes(uid)) {
				author.parentElement.parentElement.parentElement.remove();
			}
		})
	}
})();
