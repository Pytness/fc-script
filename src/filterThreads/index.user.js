// ==UserScript==
// @name         Filter Threads By Words
// @description  Este script filtra los hilos que contengan la spalabras clave que inserte el usuario.
// @author       comandantexd
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/
// @match        https://www.forocoches.com/foro/forumdisplay.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@7.28.11/dist/sweetalert2.all.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/filterThreads/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/filterThreads/index.user.js
// ==/UserScript==

(function () {
	'use strict';

	const $ = jQuery;
	const PATH = location.pathname;

	$.expr[':'].icontains = function (a, i, m) {
		return $(a).text().toUpperCase()
		.indexOf(m[3].toUpperCase()) >= 0;
	};

	var save = false;
	var checked_opt = "";

	let rowsSelected;
	let regularSel;

	let isOpen = false;

	let flags = [];

	let search = "";
	let searched = false;

	window.onkeypress = function(event){
		if(event.code === "KeyF" && !isOpen){
			isOpen = true;
			event.preventDefault();
			
			if (!searched || search == ""){
				search = (function () {
					let sto = localStorage.getItem('TM_FILTERTHREADS_FLAGS');
					let val = "";
					if (sto) {
						val = sto;
						checked_opt = "checked";
					} else {
						val = "";
					}
					return val;
				})();
			}

			(async function getFormValues () {
				const {value: formValues} = await swal({
					title: 'MODIFICAR LAS FLAGS',
					html:
					`<textarea id="swal-input1" class="swal2-textarea" placeholder="Separar las palabras con comas" style="font-family: sans-serif">${search}</textarea>` +
					`<input type="checkbox" id="swal-input2" class="swal2-checkbox" style="font-family: sans-serif" ${checked_opt}>` +
					'<span class="swal2-label" style="font-family: sans-serif"> Guardar las flags en local?</span>',
					focusConfirm: false,
					preConfirm: () => {
						let textarea = document.getElementById('swal-input1').value;

						save = document.getElementById('swal-input2').checked;
						return textarea;
					},
					onClose: () => {
						isOpen = false;
					}
				})

				if (formValues === true || formValues && formValues.trim() == "") {
					search = "";
				} else if (formValues || search == "") {
					if (!formValues) {
						search = "";
					} else {
						search = formValues;
					}
				}

				if (searched){
					rowsSelected.css({
						display: 'table-row'
					});
				}

				if (search != "") {
					flags = (function (){
						let flags = search.split(",").map(f => f.trim());
						flags = flags.filter(flag => flag != "");
						return flags;
					})();

					if (PATH == "/foro/forumdisplay.php") {
						regularSel = flags.map(f => `a:icontains('${f}')`).join(', ');
						rowsSelected = $(regularSel).parent().parent().parent();
					} else {
						regularSel = flags.map(f => `a[title*='${f}' i]`).join(', ');
						rowsSelected = $(regularSel).parent().parent();
					}

					rowsSelected.css({
						display: 'none'
					});

					search = flags.join(", ");
					if (save) {
						localStorage.setItem('TM_FILTERTHREADS_FLAGS', search);
						checked_opt = "checked";
					}
					search += ", ";
					searched = true;
				}

				if (!save) {
					localStorage.removeItem('TM_FILTERTHREADS_FLAGS');
					checked_opt = "";
				}
			})();
		}
	}
})();
