// ==UserScript==
// @name         Icon Autocomplete FC
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Autocomplete for icons in FC
// @author       Pytness
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

// TODO: add private message to @match

(function () {
	'use strict';

	$('html > head').append($(`
			<style>
				/*#vB_Editor_QR_textarea, #vB_Editor_001_textarea {
					background-color: transparent;
				}*/

				.tm_backdrop {
					position: absolute;
					background-color: white;
					padding-top: 2px;
					margin: 0px;
					box-sizing: border-box;
					border: 1px solid gray;
					border-radius: 3px;
				}

				.tm_backdrop > span {
					width: 100%;
					display: inline-block;
					padding: 3px 5px;
					box-sizing: border-box;
				}

				.tm_backdrop > span:hover {
					color: red;
					background-color: rgba(0, 0, 0, 0.05);
					text-decoration: underline;
					cursor: pointer;
				}
			</style>
	`));

	const backdrop = $('<div class="tm_backdrop" style="display: none">');

	let bdata = {
		line: null,
		cursor: null,
		localCursor: null,
		textWidth: null,
		textHeight: null,
		maxRows: 10,
		display: false,
		selectedIndex: -1
	};

	let editor = null;

	let icons = (() => {
		// check if in cache

		let lsItem = localStorage.getItem('tm_icons_json');
		let jsonIcons = false;

		if(lsItem !== null) {
			let iconsParsed = false;
			try {
				jsonIcons = JSON.parse(lsItem);
			} catch(e) {}
		}

		if(jsonIcons !== false) {
			return jsonIcons;
		}

		let ajax = new XMLHttpRequest();
		ajax.open('GET', 'https://www.forocoches.com/foro/misc.php?do=getsmilies', false);
		ajax.send();

		let parser = new DOMParser();

		let html = parser.parseFromString(ajax.responseText, "text/html");

		let alt1 = html.querySelectorAll('.alt1');
		let alt2 = html.querySelectorAll('.alt2');

		console.log(alt1, alt2);

		let tempIcons = [];

		for(let i = 1; i < alt1.length; i += 2) {
			let ic = alt1[i].innerText.trim();
			if(ic[0] == ':' && ic.substr(-1) == ':') tempIcons.push(ic);
		}

		for(let i = 1; i < alt2.length; i += 2) {
			let ic = alt2[i].innerText.trim();
			if(ic[0] == ':' && ic.substr(-1) == ':') tempIcons.push(ic);
		}

		tempIcons.sort();

		localStorage.setItem('tm_icons_json', JSON.stringify(tempIcons));
		return tempIcons;
	})();

	function getTextWidth(text, font) {
		// re-use canvas object for better performance
		let canvas = getTextWidth.canvas || (getTextWidth.canvas = $("<canvas>")[0]);

		let context = canvas.getContext("2d");
		context.font = font;

		let metrics = context.measureText(text);
		return metrics.width;
	}

	const computeValues = () => {
		let editorPos = editor.position();

		let text = editor.val();
		let cursor = editor.prop("selectionStart");

		let ff = text.lastIndexOf('\n', cursor - 1);
		let sf = text.indexOf('\n', cursor);

		let line = text.slice(
			ff > -1 ? ff + 1 : 0,
			sf > -1 ? sf : text.length
		);

		let linesBefore = text.substr(0, ff).split('\n');
		let lineNumber = linesBefore.length == 1 && linesBefore[0] === '' ? 0 : linesBefore.length;

		let localCursor = cursor - ff - 1;
		line = line.substr(0, localCursor) + ' ';

		let editorStyle = window.getComputedStyle(editor[0]);

		let font = `${editorStyle.fontSize} ${editorStyle.fontFamily}`;
		let padding = parseFloat(editorStyle.padding.slice(0, -2))

		let fontSize = parseFloat(editorStyle.fontSize.slice(0, -2));

		let textWidth = Math.ceil(getTextWidth(line + ' ', font));

		let textHeight = ((lineNumber + 1) * fontSize);

		bdata.line = line;
		bdata.cursor = cursor;
		bdata.localCursor = localCursor;

		bdata.left = editorPos.left + textWidth + padding;
		bdata.top = editorPos.top + textHeight + padding * 2;
	};

	const updateBackdropRows = () => {

		let patt = bdata.line.substr(0, bdata.localCursor);

		let init = patt.indexOf(':');
		if(init === -1) {
			bdata.display = false;
			return;
		} else {
			bdata.display = true;
		}

		patt = patt.slice(patt.lastIndexOf(':'));

		let filteredIcons = icons.filter(icon => {
			return patt === icon.substr(0, patt.length);
		});

		filteredIcons.sort();

		let html = '';

		filteredIcons.slice(0, bdata.maxRows).forEach(el =>
			html += `<span>${el}</span><br>`
		);

		console.log(patt);

		if(filteredIcons.length === 0 ||
			(filteredIcons.length === 1 && filteredIcons[0] === patt)) {
			bdata.display = false;
		}

		backdrop.html(html);
	};

	const updateBackdropPosition = e => {
		if(bdata.display) {
			backdrop.show();
		} else {
			backdrop.hide();
		}

		let bdims = backdrop[0].getBoundingClientRect();

		backdrop[0].style.left = `${bdata.left}px`;
		backdrop[0].style.top = `${bdata.top - bdims.height + 3.5}px`;
	};

	// TODO: change name
	function operate() {
		computeValues();
		updateBackdropRows();
		updateBackdropPosition();
	}

	function setup() {
		if(editor !== null) {
			editor.off('keydown', operate);
			editor.off('keypress', operate);
			editor.off('keyup', operate);
			editor.off('click', operate);
		}

		console.log('bef', editor);
		editor = $(this);
		console.log('af', editor);

		backdrop.remove();
		editor.parent().append(backdrop);

		editor.keydown(operate);
		editor.keypress(operate);
		editor.keyup(operate);
		editor.click(operate);
	}

	$('html').on('click', 'textarea', setup);

	backdrop.on('click', 'span', function () {
		bdata.display = false;
		backdrop.hide();

		let text = editor.val();
		let cursor = editor.prop("selectionStart");

		// Add space padding if necessary
		let padding = text.substr(cursor, 1) !== ' ' ? ' ' : '';

		let newText = text.substr(0, cursor);
		newText += $(this).text().slice(bdata.localCursor);
		newText += padding + text.substr(cursor);

		editor.val(newText);
		editor.focus();

		let newCursor = cursor + (newText.length - text.length) + 1;
		editor[0].setSelectionRange(newCursor, newCursor);
	})
})();
