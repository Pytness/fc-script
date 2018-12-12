// ==UserScript==
// @name         imagePopUp
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Este script muestra las imagenes adjuntas en una ventana modal
// @author       nurbian
// @match        https://www.forocoches.com/foro/showthread.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@7.28.11/dist/sweetalert2.all.min.js
// ==/UserScript==

(function() {
	'use strict';

	const $ = jQuery;

	$('img.thumbnail').click(function (event) {
		event.preventDefault();

		let a = $(this).closest('div').children().toArray(); //stores all the "a" elements of the thumbnails in form of an array

		let actualImage = parseInt($(this).parent().index()); //stores the "a" element that was clicked in form of integer

		let src = a[actualImage].attributes.href.value;
		swal({
			title: 'Archivos adjuntos',
			html: `<a href="${src}" target="_blank"><img id="modal-thumb" class="swal2-image" src="${src}"></a> <br>
			<div id="modal-opt"><strong id="prev-arrow"><</strong><span id="img-index">0</span><strong id="next-arrow">></strong></div>`,
			onOpen: () => {
				if (a.length == 1) {
					$('#modal-opt').css({display: 'none'});
				} else {
					$('#img-index').text(actualImage+1);

					$('#next-arrow').click(next);
					$('#prev-arrow').click(prev);

					window.onkeydown = ev => {
						if (ev.code == "ArrowRight") {
							next();
						} else if (ev.code == "ArrowLeft") {
							prev();
						}
					}
				}
			}
		});
		function next() {
			actualImage < a.length - 1 ? ++actualImage : actualImage = 0;
			src = a[actualImage].attributes.href.value;
			$('#modal-thumb').attr('src', src);
			$('#modal-thumb').parent().attr('href', src);
			$('#img-index').text(actualImage+1);
		}
		function prev() {
			actualImage > 0 ? --actualImage : actualImage = a.length - 1;
			src = a[actualImage].attributes.href.value;
			$('#modal-thumb').attr('src', src);
			$('#modal-thumb').parent().attr('href', src);
			$('#img-index').text(actualImage+1);
		}

		$('head').append(`
			<style>
			#next-arrow, #prev-arrow {
				cursor: pointer;
				padding: 0px 20px 0px 20px;
			}
			.swal2-content *::selection {
				background-color: inherit;
				color: inherit;
			}
			.swal2-image{
				max-height: 100%;
				animation-name: transition;
				animation-duration: 0.3s;
			}
			/*@keyframes transition {
				0%   {opacity: 0;}
				25%  {opacity: 0.25;}
				50%  {opacity: 0.5;}
				100% {opacity: 100;}
			}*/
			</style>
		`);

		event.stopPropagation();
	});
})();
