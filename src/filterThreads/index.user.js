// ==UserScript==
// @name         Filter Threads By Words
// @description  Este script filtra los hilos que contengan las palabras clave que inserte el usuario.
// @author       comandantexd
// @version      1.02
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/
// @match        https://www.forocoches.com/foro/forumdisplay.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@7.28.11/dist/sweetalert2.all.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/filterThreads/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/filterThreads/index.user.js
// @run-at       document-end
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;
	const IN_ROOT_PATH = location.pathname === '/';

	const SPLIT_CHARACTER = "\n";

	let dialogIsOpen = false;
	let filterText = localStorage.getItem('tm_ft_flags') || '';
	let filtersEnabled = Boolean(localStorage.getItem('tm_ft_is_enabled') || true);

	let threadLinks = $(IN_ROOT_PATH ?
		'a.texto[href*="/foro/showthread.php?t="][title]' :
		'a[href*="showthread.php?t="][id]');


	String.prototype.removeTildes = function () {
		return this.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
	};

	function filterThreads() {
		threadLinks.closest('tr').show();

		if (filtersEnabled) {
			let flags = filterText.split(SPLIT_CHARACTER)
				.map(f => f.trim()
					.toLowerCase()
					.removeTildes())
				.filter(f => f !== "");

			threadLinks.each((i, el) => {
				el = $(el);
				let title = (IN_ROOT_PATH ? el.attr('title') : el.text())
					.toLowerCase()
					.removeTildes();

				// if includes a filtered phrase
				if (!flags.every(f => !title.includes(f))) {
					el.closest('tr').hide();
				}
			});
		}
	}

	function showPopPup(filterText) {
		let popupElement;
		return swal({
			title: 'Modificar filtros',
			html: `<textarea id="swal-input1" class="swal2-textarea" ` +
				`placeholder="Separar las palabras con comas"  spellcheck="false"></textarea>` +
				`<input type="checkbox" class="swal2-checkbox" ${filtersEnabled ? 'checked' : ''}>` +
				'<span class="swal2-label">Activar filtros</span>',
			showCancelButton: true,
			reverseButtons: true,
			cancelButtonColor: '#d33',
			focusConfirm: false,
			onOpen: (tempPopupElement) => {
				popupElement = tempPopupElement;
				let textarea = $(popupElement).find('textarea')[0];
				dialogIsOpen = true;
				$(textarea).val(filterText);
				textarea.setSelectionRange(filterText.length, filterText.length);

				//scroll to bottom
				textarea.scrollTop = textarea.scrollHeight;
			},
			preConfirm: () => ({
				text: $(popupElement).find('textarea').val(),
				enabled: $(popupElement).find('[type="checkbox"]')[0].checked
			}),
			onClose: () => {
				dialogIsOpen = false;
			}
		});
	}

	window.onkeypress = function (event) {
		if (event.code === "KeyF" && !dialogIsOpen) {
			event.preventDefault();

			let selectedRows = $([]);

			showPopPup(filterText)
				.then((response) => {
					console.log(response);
					filterText = response.value.text.trim();
					filtersEnabled = response.value.enabled;

					localStorage.setItem('tm_ft_flags', filterText);
					localStorage.setItem('tm_ft_is_enabled', filtersEnabled);

					filterThreads();
					filterText += '\n';
				})
				.catch((error) => console.error(error));
		}
	}

	$('head').append(`
		<style>
			.swal2-textarea {
				font-size: 100% !important;
				resize: vertical !important;
			}
			.swal2-checkbox {
				margin-right: 5px !important;
			}
			.swal2-textarea, .swal2-checkbox, .swal2-label {
				font-family: sans-serif !important;
			}
		</style>
	`);

	filterThreads();
})();
