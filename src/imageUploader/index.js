// ==UserScript==
// @name         Image Uploader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Upload images to imgut from fc
// @author       Pytness
// @resource     uploadIcon file:///home/pytness/github/fc-script/src/imageUploader/uploadIcon.gif
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @match        https://www.forocoches.com/foro/private.php*
// @run-at       document-end
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// ==/UserScript==

(function () {
	'use strict';

	console.log(2, $);

	$('html > head').append($(`
			<style>
				.imagebutton:hover {
					background-color: rgb(193, 210, 238);
					border: 1px solid rgb(49, 106, 197);
					padding:0px;
				}
			</style>
	`));

	function createImageUploaderButton() {
		const uploadIconSrc = GM_getResourceURL('uploadIcon');
		const controlers = $('#vB_Editor_QR_controls');
		let td = $(controlers.find('tr>td')[11]);
		let image = $(`<div class="imagebutton"><img src="${uploadIconSrc}"></div>`);
		image.insertAfter(td);
	}

	createImageUploaderButton();

	console.log(1);
})();
