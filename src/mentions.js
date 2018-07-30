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

			#nicks td {
				padding: 5px;
			}
		</style>
	`));

	const defaultEditorSelector = '#vB_Editor_QR_textarea';
	const replayEditorSelector = '#vB_Editor_001_textarea';

	const editor = $(defaultEditorSelector).length > 0 ?
		$(defaultEditorSelector) : $(replayEditorSelector);

	var nicklist = [];

	// Load nicks when page is ready
	$(function () {

		// Choose the correct selector
		let nickSelector = editor.selector == defaultEditorSelector ?
			'.bigusername' : 'div#collapseobj_threadreview td.alt2';

		// Append nickname to nicklist only once
		$(nickSelector).each((index, value) => {
			if(nickSelector != '.bigusername' ^ !value.parentElement.title.indexOf('Mensaje') != 0)
				return;

			let nickname = value.innerText.trim();

			if(nicklist.indexOf(nickname) === -1) {
				nicklist.push(nickname);
			}
		});

		nicklist.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});


		// Create nick table
		let div = $(editor).parent().parent();

		if(editor.selector === replayEditorSelector)
			div = div.parent();

		let table = "<table id=nicks>";
		let col = 0;

		nicklist.forEach(function (nick) {
			table += "<td><div class='nick'>" + nick + "</div></td>"
			if(col++ % 6 === 0) table = "</tr>" + table + "<tr>";
		});

		table += "</table>";

		div.prepend(table);

		$('#nicks').on('click', 'td', function (e) {
			let cursor = editor.prop("selectionStart");
			var text = editor.val();

			// Check if is there a space after the cursor
			let needSpace = text.substr(cursor, 1) !== ' ';

			// Add name on cursor position, not at the end
			let newText = text.substr(0, cursor) + $(this).text();
			newText += (needSpace ? ' ' : '') + text.substr(cursor);

			// Get new cursor position
			let newCursor = cursor + newText.length + 1;

			$('#nicks').hide();

			editor.val(newText);
			editor.focus();

			// Set cursor position
			editor[0].setSelectionRange(newCursor, newCursor);
		});

		$('#nicks').hide();
	});

	// Set trigger key
	editor.keypress(function (e) {
		if(e.key === '@') $('#nicks').show();
		else $('#nicks').hide()
	});

	// Update Editor State
	function updateEditorState(e) {
		let cursor = editor.prop("selectionStart");

		if(editor.val()[cursor - 1] === '@') {
			$('#nicks').show();
			editor[0].scrollIntoView()
		} else {
			$('#nicks').hide();
		}
	}

	editor.keydown(updateEditorState);
	editor.keyup(updateEditorState);
	editor.click(updateEditorState);
	editor.change(updateEditorState);


})();
