// ==UserScript==
// @name         Export/import Ignored User List
// @description  Export/Import your ignored user list (@zaguarman)
// @author       Pytness
// @version      1.04
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/foro/profile.php?do=ignorelist*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @resource     stylesheet https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/main.css
// @updateURL    https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/index.user.js
// @run-at       document-end
// @grant        GM_getResourceText
// @grant        GM_info
// @grant        unsafeWindow
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;

	const query = s => document.querySelector(s);
	const queryAll = s => document.querySelectorAll(s);

	$('html > head').append(`<style>${GM_getResourceText('stylesheet')}</style>`);

	const elementExists = selector =>
		$(selector).length !== 0;

	function exportUserList() {

		let inputs = $('#ignorelist input[type="checkbox"]').toArray();
		inputs = inputs.filter(input =>
			input.checked
		);

		if (inputs.length > 0) {

			let ignoredUsers = {};

			inputs.forEach(input => {
				let user_id = input.value;
				let username = input.parentElement
					.innerText.trim();
				username = encodeURIComponent(username);

				ignoredUsers[user_id] = username;
			});

			let b64json = window.btoa(JSON.stringify(ignoredUsers));

			let filename = prompt('Nombre del archivo:', 'ignoredusers.export');

			if (filename !== null) {

				let blob = new Blob([b64json], {
					type: "text/plain;charset=utf-8"
				});

				blob = URL.createObjectURL(blob);

				let downloadLink = $('<a>')
					.attr('target', '_blank')
					.attr('download', filename)
					.attr('href', blob);

				downloadLink.hide();
				$('html > head').append(downloadLink);

				downloadLink[0].click();
				downloadLink.remove();

				setTimeout(function () {
					URL.revokeObjectURL(blob);
				}, 10000);
			}
		}
	}

	function updateUserList(uid, uname) {
		let ul = $('#ignorelist');

		if (ul.length === 0) {
			$('<ul class="userlist floatcontainer" id="ignorelist">')
				.insertBefore($('#ignorelist_change_form .submitrow.smallfont'));
			ul = $('#ignorelist');
		}

		if (!elementExists(`#user${uid}`)) {
			let li_list = $('#ignorelist li');

			let li = (() => {
				let li = $(`<li id="user${uid}">`);

				let checkbox = $('<input type="checkbox" />')
					.attr('name', `listbits[ignore][${uid}]`)
					.attr('id', `usercheck_${uid}`)
					.attr('value', uid)
					.attr('checked', 'checked');

				let anchor = $(`<a href="member.php?u=${uid}">${uname}</a>`);

				let hidden = $('<input type="hidden" />')
					.attr('name', `listbits[ignore_original][${uid}]`)
					.attr('value', uid);

				li.append(checkbox);
				li.append(anchor);
				li.append(hidden);

				return li;
			})();

			li_list = li_list.toArray();
			li_list.push(li);

			li_list.sort((a, b) => {
				let a_uname = $(a).find('a').text();
				let b_uname = $(b).find('a').text();

				return a_uname.localeCompare(b_uname);
			});

			ul.empty();
			li_list.forEach(el => ul.append(el));
		}
	}

	function importUserList() {

		let fileinput = $('<input type="file">');

		fileinput.on('change', function () {
			let file = this.files[0];

			let reader = new FileReader();

			reader.onload = function () {
				let json;

				try {
					let decoded = atob(reader.result);
					json = JSON.parse(decoded);
				} catch (e) {
					alert('ERR_MALFORMED_CONTENT');
					return;
				}

				let validUsers = [];

				Object.keys(json).forEach(key => {
					if (elementExists(`#user${key}`)) return;

					validUsers.push([key, decodeURIComponent(json[key])]);
				});

				if (validUsers.length > 0) {

					validUsers.sort((a, b) =>
						a[1].localeCompare(b[1])
					);

					let progress = $('#importProgress');
					progress.text(`0 / ${validUsers.length}`);
					progress.show();

					let completedRequests = 0;

					validUsers.forEach(([uid, uname]) => {
						let formData = new FormData($('#ignorelist_add_form')[0]);
						formData.set('username', uname);

						formData = Array.from(formData);
						let dataString = '';

						formData.forEach(([key, value]) => {
							dataString += `${key}=${escape(value)}&`;
						});

						dataString = dataString.slice(0, -1);

						let form = $('#ignorelist_change_form');
						form.show();

						let ajax = new XMLHttpRequest();

						ajax.open('POST', 'profile.php?do=updatelist&userlist=ignore', true);
						ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

						ajax.onreadystatechange = function () {
							if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {

								progress.text(`(${uname}) ${++completedRequests} / ${validUsers.length}`);
								updateUserList(uid, uname);

								if (completedRequests === validUsers.length) {

									$('#ignorelist_checkall').change(function () {
										let state = this.checked;
										let checkboxes = $('input[type="checkbox"]').toArray();
										checkboxes.forEach(el => {
											el.checked = state;
										});
									});

									setTimeout(() => progress.hide(), 1000);
								}
							}
						};

						ajax.send(dataString);
					});
				}
			};

			reader.readAsText(file);
			this.remove();
		});

		fileinput[0].click();
	}

	function insertButtons() {

		let submit = $('.userlist_form_controls input[type="submit"]');
		let exportButton = $('<input type="button" class="button tm" value="Exportar"> ');
		let importButton = $('<input type="button" class="button tm" value="Importar"> ');
		let progress = $('<span id="importProgress"></span>');

		exportButton.on('click', exportUserList);
		importButton.on('click', importUserList);

		progress.insertAfter(submit);
		importButton.insertAfter(submit);
		exportButton.insertAfter(submit);

		progress.hide();
	}

	window.addEventListener('load', function () {

		console.log('Loaded: \n' +
			`\tName    :    ${GM_info.script.name}\n` +
			`\tVersion :    ${GM_info.script.version}\n` +
			`\tAuthor  :    ${GM_info.script.author}\n` +
			`\tUUID    :    ${GM_info.script.uuid}`
		);

		insertButtons();
	});
})();
