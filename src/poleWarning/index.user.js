// ==UserScript==
// @name         Pole warning
// @description  Te avisa si vas a hacer la pole en un subforo que no es general
// @author       Pytness
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/foro/showthread.php?*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL    https://raw.githubusercontent.com/Pytness/fc-script/master/src/continuousScroll/index.user.js
// @downloadURL  https://raw.githubusercontent.com/Pytness/fc-script/master/src/continuousScroll/index.user.js
// @run-at       document-start
// @grant        GM_getResourceText
// @grant        GM_info
// @grant        unsafeWindow
// ==/UserScript==

(function(window) {
    'use strict';

    const $ = jQuery;
    window.console = Object.freeze(window.console);



    window.addEventListener('DOMContentLoaded', function() {

        let zone = $('td .navbar a')[2].innerText.trim();
        let messages = $('.thead strong').toArray();

        if (zone !== 'General') {
            console.warn("Illo cuidao, que no estás en general !");
            let m_num = parseInt(messages[messages.length - 1].innerText.trim());
            if (m_num == 1) {
                console.warn("Illo cuidao, que tus poles aqui dañan tu cuneta !");
            }
        }

        console.log('Loaded: \n' +
            `\tName    :    ${GM_info.script.name}\n` +
            `\tVersion :    ${GM_info.script.version}\n` +
            `\tAuthor  :    ${GM_info.script.author}\n` +
            `\tUUID    :    ${GM_info.script.uuid}`
        );
    });
})(unsafeWindow);