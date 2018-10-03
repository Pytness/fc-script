// ==UserScript==
// @name         MencionadorScriptForocoches
// @namespace    http://tampermonkey.net/
// @version      1.01
// @description  Tabla con shurmanos que han posteado en la página actual al pulsar @
// @author       Siralos & Pytness
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	// Add css styles to <head>
	$('html > head').append($(`
			<style>
				.nick:hover {
					color: red;
					text-decoration: underline;
					cursor: pointer;
				}

				#nicktable td {
					padding: 5px 10px;
				}
			</style>
	`));

	const pathname = location.pathname;

	const defaultEditorSelector = '#vB_Editor_QR_textarea';
	const replayEditorSelector = '#vB_Editor_001_textarea';


	let editor = $('');
	const usingDefaultEditor = () => $('#vB_Editor_QR').find(editor).length === 1;

	// Create nicklist
	let nicklist = (() => {

		let nickSelector = pathname === '/foro/showthread.php' ?
			'.bigusername' : 'div#collapseobj_threadreview td.alt2';

		let nlist = [];

		$(nickSelector).each((i, value) => {
			if(!(pathname === '/foro/showthread.php') ^ value.parentElement.title.includes('Mensaje'))
				return;

			let nickname = value.innerText.trim();

			// If nickname not in the list
			if(!nlist.includes(nickname))
				nlist.push(nickname);
		});

		return nlist.sort();
	})();

	let nicktable = (() => {
		let table = $("<table id='nicktable' style='display: none'></table>");
		let tr = $('<tr>');

		nicklist.forEach(function (nick, col) {
			// Build rows
			tr.append(`<td><div class='nick'>${nick}</div></td>`);

			if((col % 6 === 0 && col !== 0) || col === nicklist.length - 1) {
				table.append(tr);
				tr = $('<tr>');
			}
		});

		return table;
	})();

	function nickClick(e) {
		nicktable.hide();

		let text = editor.val();
		let cursor = editor.prop("selectionStart");

		let nickname = $(this).text().trim();
		let newText = text.substr(0, cursor);

		// Add space padding if necessary
		let padding = text.substr(cursor, 1) !== ' ' ? ' ' : '';

		if(nickname.split(' ').length == 1) {
			newText += nickname;
		} else {
			// First remove '@' cause no longer needed
			newText = newText.slice(0, -1);
			newText += `[MENTION]${nickname}[/MENTION]`;
		}

		newText += padding + text.substr(cursor);

		editor.val(newText);
		editor.focus();

		// Set cursor position
		let newCursor = cursor + (newText.length - text.length) + 1;

		editor[0].setSelectionRange(newCursor, newCursor);
	}

	function triggerKey(e) {
		if(e.key === '@')
			nicktable.show();
		else
			nicktable.hide();
	}

	function updateNicktableState(e) {
		let cursor = editor.prop("selectionStart");

		if(editor.val()[cursor - 1] === '@') {
			nicktable.show();
			if(usingDefaultEditor()) editor[0].scrollIntoView();
		} else {
			nicktable.hide();
		}
	}

	$('html').on('focus', 'textarea', function (e) {

		nicktable.hide();

		if(editor !== null) {
			editor.off('keypress', triggerKey);
			editor.off('keypress', updateNicktableState);
			editor.off('keypress', updateNicktableState);
			editor.off('keyup', updateNicktableState);
			editor.off('click', updateNicktableState);
			editor.off('change', updateNicktableState);
		}

		nicktable.remove();

		editor = $(this);

		let parent = editor.parent().parent();
		if(pathname !== '/foro/showthread.php')
			parent = parent.parent();
		parent.prepend(nicktable);

		nicktable.on('click', 'td', nickClick);

		editor.keypress(triggerKey);

		editor.keypress(updateNicktableState);
		editor.keyup(updateNicktableState);
		editor.click(updateNicktableState);
		editor.change(updateNicktableState);
	});
})();
