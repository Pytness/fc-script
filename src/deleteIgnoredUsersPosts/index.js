// ==UserScript==
// @name         Delete Ignored Users Posts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Deletes posts if its creator its in your ignored list
// @author       Pytness
// @match        https://www.forocoches.com/
// @match        https: //www.forocoches.com/foro/profile.php?do=ignorelist
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @resource     iconsJson https://raw.githubusercontent.com/Pytness/fc-script/master/src/iconAutocomplete/icons.json
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/iconAutocomplete/index.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/iconAutocomplete/index.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==


(function () {
	'use strict';

	console.log(5);

	const USER_LIST_LS_KEY = 'tm_ignored_user_list';

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
		console.log(form);
		return doc;
	}


	function getIgnoredUserList() {
		let user_list = localStorage.getItem(USER_LIST_LS_KEY);

		if(user_list === null) {
			user_list = parseIgnoredListHtml(getajax(IGNORED_USERS_URL));
		} else {
			user_list = JSON.parse(user_list);
		}

		return user_list;
	}

	console.log(getIgnoredUserList());

})()
