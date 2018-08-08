// ==UserScript==
// @name         Icon Autocomplete FC
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Autocomplete for icons in FC
// @author       Pytness
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @match        https://www.forocoches.com/foro/private.php*
// @resource     iconsJson https://raw.githubusercontent.com/Pytness/fc-script/master/src/iconAutocomplete/icons.json
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/iconAutocomplete/index.js
// @run-at       document-end
// @grant        GM_getResourceText
// ==/UserScript==

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
					text-align: left;
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

				.tm_img {
					/* max-width: 16px;*/
					max-height: 20px;
					display: inline;
					float: right;
				}
			</style>
	`));

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

	const backdrop = $('<div class="tm_backdrop" style="display: none">');

	backdrop.on('click', 'span', function () {
		bdata.display = false;
		backdrop.hide();

		let text = editor.val();
		let cursor = editor.prop("selectionStart");
		let lastIndex = text.lastIndexOf(':', cursor);


		let iconText = $(this).text().trim();

		// Add space padding if necessary
		let newText = text.substr(0, lastIndex);
		let padding = text[cursor] !== ' ' ? ' ' : '';

		newText += iconText;
		newText += padding + text.substr(cursor);

		editor.val(newText);
		editor.focus();

		let newCursor = cursor + (newText.length - text.length) + (padding == ' ' ? 0 : 1);
		editor[0].setSelectionRange(newCursor, newCursor);
	});

	let editor = null;

	let icons = (() => {
		// Lets keep this just in case ;)
		/*
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


		let html = (new DOMParser()).parseFromString(ajax.responseText, "text/html");

		let alt1 = html.querySelectorAll('.alt1');
		let alt2 = html.querySelectorAll('.alt2');

		let iconTable = Array.from(alt1).concat(Array.from(alt2));

		let tempIcons = [];

		for(let i = 0; i < iconTable.length; i += 2) {
			let text = iconTable[i + 1].innerText.trim();
			let ic = iconTable[i].firstChild.src.split('/').slice(-1)[0];

			if(text[0] == ':' && text.substr(-1) == ':')
				tempIcons.push([text, ic]);
		}
		tempIcons.sort();
		localStorage.setItem('tm_icons_json', JSON.stringify(tempIcons));
		*/

		let jsonIcons = GM_getResourceText('iconsJson');
		let tempIcons = JSON.parse(jsonIcons);
		tempIcons.sort();

		return tempIcons;
	})();

	function getTextWidth(text, font) {
		let canvas = getTextWidth.canvas || (getTextWidth.canvas = $("<canvas>")[0]);

		let context = canvas.getContext("2d");
		context.font = font;

		return context.measureText(text).width;
	}

	const computeValues = () => {
		let editorPos = editor.position();

		let text = editor.val();
		let cursor = editor.prop("selectionStart");

		// first find, second find
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

		if(patt.indexOf(':') === -1) {
			bdata.display = false;
			return;
		} else {
			bdata.display = true;
		}

		patt = patt.slice(patt.lastIndexOf(':'));

		let filteredIcons = icons.filter(icon => {
			return patt === icon[0].substr(0, patt.length);
		});

		filteredIcons.sort();

		let html = '';

		filteredIcons.slice(0, bdata.maxRows).forEach(el =>
			html += `<span>${el[0]} <img src="//st.forocoches.com/foro/images/smilies/${el[1]}" class="tm_img"></span><br>`
		);

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
	function operate(e) {
		computeValues();
		updateBackdropRows();
		updateBackdropPosition();
	}

	function setup(e) {
		editor = $(this);
		editor.parents('form').submit(() => {
			console.log('xd');
			bdata.display = false;
			backdrop.hide();
		});
		backdrop.appendTo(editor.parent());
	}

	$('html').on('focus', 'textarea', setup);
	$('html').on('submit', 'textarea', () => {
		console.log('xd');
		bdata.display = false;
		backdrop.hide();
	});

	$('html').on('keydown', 'textarea', operate);
	$('html').on('keypress', 'textarea', operate);
	$('html').on('keyup', 'textarea', operate);
	$('html').on('click', 'textarea', operate);
	$('html').on('focus', 'textarea', operate);
})();
