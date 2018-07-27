// ==UserScript==
// @name         MencionadorScriptForocoches
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tabla con shurmanos que han posteado en la página actual al pulsar @
// @author       Siralos
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
	$('#vB_Editor_QR_textarea').keypress(function (e) {
		if(e.keyCode == 64) //@
		{
			if(!$('#nicks').length) {
				var listanicks = [];
				var div = $(this).parent().parent();
				var html = "<TABLE id=nicks><tr>";
				var int = 0;

				$('.bigusername').each(function (index) {
					if(listanicks.indexOf($(this).text()) == -1) {
						listanicks.push($(this).text());
					}
				});
				listanicks.sort(function (a, b) {
					return a.toLowerCase().localeCompare(b.toLowerCase());
				});
				listanicks.forEach(function (element) {
					html = html + "<td><div id='nick'>" + element + "</div></td>"
					int += 1;
					if(int % 6 == 0) html = html + "</tr><tr>";
				});
				html = html + "</tr></TABLE>";
				div.prepend(html);

				$('#nicks').on('click', 'td', function (e) {
					var texto = $('#vB_Editor_QR_textarea').val();
					$('#vB_Editor_QR_textarea').val(texto + $(this).text());
					$('#nicks').hide();
					$('#vB_Editor_QR_textarea').focus();
				});
			} else {
				$('#nicks').show();
			}
		}
	});



	$('#vB_Editor_001_textarea').keypress(function (e) {
		if(e.keyCode == 64) //@
		{
			if(!$('#nicks2').length) {
				var listanicks = [];
				var div = $(this).parent().parent();
				var html = "<TABLE id=nicks2><tr>";
				var int = 0;

				$('div#collapseobj_threadreview').find('td.alt2').each(function (index) {
					var title = String($(this).parent().attr('title'));
					if(title.match(/Mensaje.*/)) {
						if(listanicks.indexOf($(this).text()) == -1) {
							listanicks.push($(this).text());
						}
					}
				});
				listanicks.sort(function (a, b) {
					return a.toLowerCase().localeCompare(b.toLowerCase());
				});
				listanicks.forEach(function (element) {
					html = html + "<td><div id='nick'>" + element + "</div></td>"
					int += 1;
					if(int % 6 == 0) html = html + "</tr><tr>";
				});
				html = html + "</tr></TABLE>";
				div.prepend(html);

				$('#nicks2').on('click', 'td', function (e) {
					var texto = $('#vB_Editor_001_textarea').val();
					$('#vB_Editor_001_textarea').val(texto + $(this).text());
					$('#nicks2').hide();
					$('#vB_Editor_001_textarea').focus();
				});
			} else {
				$('#nicks2').show();
			}
		}
	});

})();
