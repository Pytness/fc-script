// ==UserScript==
// @name         Export/import Ignored User List
// @description  Export/Import your ignored user list (@zaguarman)
// @author       Pytness
// @version      0.1
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/foro/profile.php?do=ignorelist*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/index.user.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;

	const query = s => document.querySelector(s);
	const queryAll = s => document.querySelectorAll(s);

	$('html > head').append('<style>input.button.tm {margin-left: 5px;} #importProgress {float: right;} </style>');

	function exportUserList() {
		let ul = query('.userlist.floatcontainer');
		let inputs = Array.from(
			ul.querySelectorAll('input[type="checkbox"]')
		).filter(input => input.checked);

		let temp_user_id_list = inputs.map(input => input.value);
		let temp_username_list = inputs.map(input => input.parentElement.innerText.trim());

		let ignoredUsers = {};

		temp_user_id_list.forEach((id, index) => {
			let username = temp_username_list[index];
			ignoredUsers[id] = username;
		});

		let b64json = window.btoa(JSON.stringify(ignoredUsers)); //


		let filename = prompt('Nombre del archivo: ', 'ignoredusers.export');

		if(filename !== false) {
			let downloadLink = $('<a>');

			let blob = new Blob([b64json], {
				type: "text/plain;charset=utf-8"
			});

			// Thanks to https://github.com/eligrey/FileSaver.js/
			blob = URL.createObjectURL(blob);

			downloadLink.attr('target', '_blank');
			downloadLink.attr('download', filename);
			downloadLink.attr('href', blob);

			downloadLink.hide();
			$('html > head').append(downloadLink);

			downloadLink[0].click();
			downloadLink.remove();

			setTimeout(function () {
				URL.revokeObjectURL(blob);
			}, 4E4) // 40s
		}

	}

	// TODO: take care of xss when importing files

	function importUserList() {

		const action = 'profile.php?do=updatelist&userlist=ignore';

		let fileinput = $('<input type="file">');

		fileinput.on('change', function () {
			let file = this.files[0];

			let reader = new FileReader();

			reader.onload = function () {
				let content = reader.result;
				let json;

				try {
					let decoded = atob(content);
					json = JSON.parse(decoded);
				} catch (e) {
					alert('ERR_CONTENT_MALFORMED');
					return;
				}

				let validUsers = [];

				Object.keys(json).forEach(key => {
					if(query('#user' + key) === null) {
						validUsers.push(json[key]);
					}
				});

				if(validUsers.length > 0) {
					let progress = $('#importProgress');

					progress.show();

					let count = 0;
					progress.text('0 / ' + validUsers.length);

					validUsers.forEach(uname => {
						let formData = new FormData(query('#ignorelist_add_form'));
						formData.set('username', uname);

						let arr = Array.from(formData);

						let dataString = '';

						for(let i in arr) {
							dataString += arr[i][0] + '=' + escape(arr[i][1]) + '&';
						}

						dataString = dataString.slice(0, -1);

						let ajax = new XMLHttpRequest();
						let parser = new DOMParser();
						let form = $('#ignorelist_change_form');
						form.show();

						ajax.open('POST', action, true);
						ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						ajax.onreadystatechange = function () {
							if(ajax.readyState === XMLHttpRequest.DONE && ajax.status === 200) {
								progress.text(++count + ' / ' + validUsers.length);

								if(count === validUsers.length) setTimeout(() => {
									let doc = parser.parseFromString(ajax.responseText, 'text/html');
									let docForm = doc.querySelector('#ignorelist_change_form');

									form.html(docForm.innerHTML);
									progress.hide();
								}, 1000);
							}
						};
						ajax.send(dataString);
					});

					// progress.hide();
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
		progress.hide();
		importButton.insertAfter(submit);
		exportButton.insertAfter(submit);


		// let buttonsDiv = query('.submitrow.smallfont');
	}

	window.addEventListener('load', function () {
		insertButtons();
	})
})();
