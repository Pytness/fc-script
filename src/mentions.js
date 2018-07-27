// ==UserScript==
// @name         MencionadorScriptForocoches
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tabla con shurmanos que han posteado en la página actual al pulsar @
// @author       Siralos
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

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

	const editor = $('#vB_Editor_QR_textarea').length > 0 ?
		$('#vB_Editor_QR_textarea') : $('#vB_Editor_001_textarea');

	var nicklist = [];

	// Load nicks when page is ready
	$(function () {
		let selector = editor.selector == '#vB_Editor_QR_textarea' ?
			'.bigusername' : 'div#collapseobj_threadreview td.alt2';

		$(selector).each((index, value) => {
			if(selector != '.bigusername' ^ !value.parentElement.title.indexOf('Mensaje') != 0)
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

		if(editor.selector === '#vB_Editor_001_textarea')
			div = div.parent();

		let html = "<TABLE id=nicks><tr>";
		let col = 0;

		nicklist.forEach(function (nick) {
			html += "<td><div class='nick'>" + nick + "</div></td>"
			if(col % 6 === 0 && col !== 0) html += "</tr><tr>";
			col += 1;
		});

		html += "</tr></TABLE>";

		div.prepend(html);

		$('#nicks').on('click', 'td', function (e) {
			let cursor = editor.prop("selectionStart");
			var text = editor.val();

			let needSpace = text.substr(cursor, 1) !== ' ';
			// setSelectionRange
			let newText = text.substr(0, cursor) + $(this).text();
			newText += (needSpace ? ' ' : '') + text.substr(cursor);

			$('#nicks').hide();

			editor.val(newText);
			editor.focus();

			let newCursor = cursor + $(this).text().length + 1;

			editor[0].setSelectionRange(newCursor, newCursor);
		});

		$('#nicks').hide();
	});



	editor.keypress(function (e) {
		if(e.key === '@') $('#nicks').show();
		else $('#nicks').hide()
	});

	function updateEditorState(e) {
		let cursor = editor.prop("selectionStart");

		if(editor.val()[cursor - 1] === '@') $('#nicks').show();
		else $('#nicks').hide();
	}

	editor.keydown(updateEditorState);
	editor.keyup(updateEditorState);
	editor.click(updateEditorState);
	editor.change(updateEditorState);


})();
