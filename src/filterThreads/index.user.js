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

(function() {
    'use strict';

    const $ = jQuery;
    const IN_ROOT_PATH = location.pathname === '/';

    const SPLIT_CHAR = "\n";

    let dialogIsOpen = false;

    // Get flags text. if not exists, use ''
    let filterText = localStorage.getItem('tm_ft_flags') || '';
    // Get filters enabled option. ifnot exists, use 'true'
    let filtersEnabled = Boolean(localStorage.getItem('tm_ft_is_enabled') || true);

    // if in root path ? use this : else use this other
    let threadLinks = $(IN_ROOT_PATH ?
        'a.texto[href*="/foro/showthread.php?t="][title]' :
        'a[href*="showthread.php?t="][id]'
    );


    // Define a string method
    String.prototype.removeTildes = function() {
        return this.normalize('NFD') // char to unicode: 'á' -> 'a\u0301'
            .replace(/[\u0300-\u036f]/g, ""); // remove \u0300 - \u036f
    };

    function filterThreads() {
        // show every thread rows
        threadLinks.closest('tr').show();

        if (filtersEnabled) {
            let flags = filterText.split(SPLIT_CHAR)
                .map(f => f.trim()
                    .toLowerCase()
                    .removeTildes()
                )
                // remove empty flags
                .filter(f => f !== "");

            // For each thread link
            threadLinks.each((i, el) => {
                el = $(el);
                let title = (IN_ROOT_PATH ? el.attr('title') : el.text())
                    .toLowerCase()
                    .removeTildes();

                let includesFilteredPhrase = !flags.every(f => !title.includes(f))

                if (includesFilteredPhrase)
                    el.closest('tr').hide();

            });
        }
    }

    function showPopPup() {
        let popupElement;
        return swal({
            title: 'Modificar filtros',
            html: `<textarea id="swal-input1" class="swal2-textarea" ` +
                `placeholder="Separar las palabras con comas" spellcheck="false"></textarea>` +
                `<input type="checkbox" class="swal2-checkbox" ${filtersEnabled ? 'checked' : ''}>` +
                '<span class="swal2-label">Activar filtros</span>',
            showCancelButton: true,
            reverseButtons: true,
            cancelButtonColor: '#E03A3A',
            focusConfirm: false,
            onOpen: (tempPopupElement) => {
                dialogIsOpen = true;
                popupElement = tempPopupElement;

                let textarea = $(popupElement).find('textarea')[0];
                $(textarea).val(filterText);

                // Put cursor at the end
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

    window.addEventListener('keypress', function(event) {
        // if key is 'F' and dialog is not open
        if (event.code === "KeyF" && !dialogIsOpen) {
            // prevent writing on inputs
            event.preventDefault();

            let selectedRows = $([]);

            showPopPup()
                .then(({
                    value: response
                }) => {
                    filterText = response.text.trim();
                    filtersEnabled = response.enabled;

                    // Save flags on localStorage
                    localStorage.setItem('tm_ft_flags', filterText);
                    localStorage.setItem('tm_ft_is_enabled', filtersEnabled);

                    filterThreads();

                    // Add a new line
                    filterText += '\n';
                })
                .catch((error) => console.error(error));
        }
    });

    // Add custom css
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

    // Filter threads ASAP
    filterThreads();
})();