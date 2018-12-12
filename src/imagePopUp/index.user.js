// ==UserScript==
// @name         ImagePopUp
// @description  Este script muestra las imagenes adjuntas en una ventana modal (pop up)
// @author       nurbian
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/foro/showthread.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@7.28.11/dist/sweetalert2.all.min.js
// @updateURL    https://raw.githubusercontent.com/Pytness/fc-script/master/src/ImagePopUp/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/ImagePopUp/index.user.js
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function($, window) {
    'use strict';

    window.addEventListener('DOMContentLoaded', function(e) {

        let images = [];
        let imageIndex = 0;
        let src = '';
        let dialogIsOpen = false;

        function next() {
            imageIndex = ++imageIndex % images.length;
            src = images[imageIndex].attributes.href.value;
            $('#modal-thumb').attr('src', src);
            $('#modal-thumb').parent().attr('href', src);
            $('#img-index').text(imageIndex + 1);
        }

        function prev() {
            imageIndex = (imageIndex + images.length - 1) % images.length;
            src = images[imageIndex].attributes.href.value;
            $('#modal-thumb').attr('src', src);
            $('#modal-thumb').parent().attr('href', src);
            $('#img-index').text(imageIndex + 1);
        }

        $('img.thumbnail').click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            //stores all the images
            images = $(this).closest('div').children().toArray();

            imageIndex = $(this).parent().index();
            src = images[imageIndex].attributes.href.value;

            swal({
                title: 'Archivos adjuntos',
                html: `<a href="${src}" target="_blank">` +
                    `<img id="modal-thumb" class="swal2-image" src="${src}"></a>` +
                    '<div id="modal-opt"><strong id="prev-arrow"><</strong>' +
                    '<span id="img-index">0</span>' +
                    '<strong id="next-arrow">></strong></div>',

                onOpen: () => {

                    dialogIsOpen = true;

                    if (images.length == 1) {
                        $('#modal-opt').css({
                            display: 'none'
                        });
                    } else {
                        $('#img-index').text(imageIndex + 1);
                        $('#next-arrow').click(next);
                        $('#prev-arrow').click(prev);
                    }
                },

                onClose: () => {
                    dialogIsOpen = false;
                }

            });
        });

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

        window.addEventListener('keydown', function(ev) {
            if (dialogIsOpen) {
                if (ev.code == "ArrowRight") next();
                if (ev.code == "ArrowLeft") prev();
            }
        }, true);

    });
})(jQuery, unsafeWindow);