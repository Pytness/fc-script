// ==UserScript==
// @name         Highlight Dangerous Posts
// @description  Este script destaca los hilos que sean +18, +nsfw, +serio
// @author       comandantexd AKA nurbian
// @version      1.0
// @namespace    http://tampermonkey.net/
// @match        https://www.forocoches.com/
// @match        https://www.forocoches.com/foro/forumdisplay.php*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @updateURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/highlightDangerousPosts/index.user.js
// @downloadURL	 https://raw.githubusercontent.com/Pytness/fc-script/master/src/highlightDangerousPosts/index.user.js
// ==/UserScript==

(function() {
    'use strict';

    const $ = jQuery;
    const PATH = location.pathname;

    var rowsSelected;
    var regularSel;

    $.expr[':'].icontains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
        .indexOf(m[3].toUpperCase()) >= 0;
    };0

    if (PATH == "/foro/forumdisplay.php"){
        regularSel = "a:icontains('+18'), a:icontains('+16'), a:icontains('+14'), a:icontains('+nsfw')," +
            "a:icontains('+serio'), a:icontains('tema serio'), a:icontains('temaserio')";
        rowsSelected = $( regularSel ).parent().parent();
        console.log(rowsSelected);
    } else {
        regularSel = "a[title*='+18' i], a[title*='+16' i], a[title*='+14' i], a[title*='+nsfw' i]," +
        "a[title*='+serio' i], a[title*='tema serio' i], a[title*='temaserio' i]";
        rowsSelected = $( regularSel ).parent();
    }

    rowsSelected.css({
        backgroundColor: '#ffcdba',
        textDecoration: 'underline'
    });
})();
