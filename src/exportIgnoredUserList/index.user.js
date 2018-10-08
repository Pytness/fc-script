// ==UserScript==
// @name         Export/import Ignored User List
// @description  Export/Import your ignored user list (@zaguarman)
// @author       Pytness
// @version      0.1
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/foro/profile.php?do=ignorelist*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/index.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/exportIgnoredUserList/index.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;

	const query = s => document.querySelector(s);
	const queryAll = s => document.querySelectorAll(s);

	$('html > head').append('<style>input.button.tm {margin-right: 5px; float: left;} </style>');

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

		console.log(b64json);

		let filename = prompt('Nombre del archivo: ', 'ignoredusers.export');

		if(filename !== false) {
			let downloadLink = $('<a>');

			downloadLink.attr('target', '_blank');
			downloadLink.attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(b64json));
			downloadLink.attr('download', filename);

			downloadLink.hide();
			$('html > head').append(downloadLink);

			downloadLink[0].click();
			downloadLink.remove();
		}

	}

	// TODO: take care of xss when importing files

	function importUserList() {

		let fileinput = $('<input type="file">');

		fileinput.on('change', function () {
			let file = this.files[0];

			let reader = new FileReader();

			reader.onload = function () {
				let content = reader.result;
				let json = JSON.parse(atob(content));
				console.log(json);
			};

			reader.readAsText(file);

			console.log(file);


			this.remove();
		});

		fileinput[0].click();

		// fileinput.remove();

		// console.log(1);

		const security_token = $('[name="securitytoken"]').val();
		const action = 'profile.php?do=updatelist&userlist=ignore';

		console.log(security_token);

		$.ajax({
			type: "POST",
			url: action,
			data: {
				s: '',
				securitytoken: security_token,
				do: 'updatelist',
				userlist: 'ignore',
				username: '30cm',
			}
		});
	}

	function insertButtons() {

		let submit = $('.submitrow.smallfont > input');
		let exportButton = $('<input type="button" class="button tm" value="Exportar"> ');
		let importButton = $('<input type="button" class="button tm" value="Importar"> ');

		exportButton.on('click', exportUserList);
		importButton.on('click', importUserList);

		exportButton.insertBefore(submit);
		importButton.insertBefore(submit);


		// let buttonsDiv = query('.submitrow.smallfont');
	}

	window.addEventListener('load', function () {
		insertButtons();
	})
})();
