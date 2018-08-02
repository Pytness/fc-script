// ==UserScript==
// @name         MencionadorScriptForocoches
// @namespace    http://tampermonkey.net/
// @version      0.1
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

	const defaultEditorSelector = '#vB_Editor_QR_textarea';
	const replayEditorSelector = '#vB_Editor_001_textarea';

	const isDefaultEditor = $(defaultEditorSelector).length > 0;

	const editor = isDefaultEditor ?
		$(defaultEditorSelector) : $(replayEditorSelector);

	var nicklist = [];

	$(function () {

		// Choose the correct selector
		let nickSelector = isDefaultEditor ?
			'.bigusername' : 'div#collapseobj_threadreview td.alt2';

		// Append nickname to nicklist only once
		$(nickSelector).each((i, value) => {

			if(!isDefaultEditor ^ value.parentElement.title.includes('Mensaje'))
				return;

			let nickname = value.innerText.trim();

			// If nickname not in the list
			if(!nicklist.includes(nickname))
				nicklist.push(nickname);
		});

		nicklist.sort();

		// Create nick table
		let div = $(editor).parent().parent();

		if(editor.selector === replayEditorSelector)
			div = div.parent();

		let table = $("<table id='nicktable' style='display: none'></table>");
		let tr = $('<tr>');

		nicklist.forEach(function (nick, col) {
			console.log(nick, col);
			// Build rows
			if((col % 6 === 0 && col !== 0) || col === nicklist.length - 1) {
				table.append(tr);
				tr = $('<tr>');
			}

			tr.append(`<td><div class='nick'>${nick}</div></td>`);
		});

		div.prepend(table);

		$('#nicktable').on('click', 'td', function (e) {

			$('#nicktable').hide();

			let text = editor.val();
			let cursor = editor.prop("selectionStart");

			let nickname = $(this).text();
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
		});
	});

	// Set trigger key
	editor.keypress(function (e) {
		if(e.key === '@')
			$('#nicktable').show();
		else
			$('#nicktable').hide();
	});

	// Update Editor State
	function updateNicktableState(e) {
		let cursor = editor.prop("selectionStart");

		if(editor.val()[cursor - 1] === '@') {
			$('#nicktable').show();

			if(isDefaultEditor) editor[0].scrollIntoView();
		} else {
			$('#nicktable').hide();
		}
	}

	editor.keydown(updateNicktableState)
	editor.keypress(updateNicktableState)
	editor.keyup(updateNicktableState)
	editor.click(updateNicktableState)
	editor.change(updateNicktableState)
})();
