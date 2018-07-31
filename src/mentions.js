// ==UserScript==
// @name         MencionadorScriptForocoches
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tabla con shurmanos que han posteado en la página actual al pulsar @
// @author       Siralos & Pytness
// @match        https://www.forocoches.com/foro/showthread.php*
// @match        https://www.forocoches.com/foro/newreply.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    // Add css styles to <head>
    $('html > head').append($(`
    		<style>
    			.nick:hover {
    				color: red;
    				text-decoration: underline;
    				cursor: pointer;
    			}

    			#nicktable td {
    				padding: 5px 10px;
    			}
    		</style>
    `));

    const defaultEditorSelector = '#vB_Editor_QR_textarea';
    const replayEditorSelector = '#vB_Editor_001_textarea';

    const editor = $(defaultEditorSelector).length > 0 ?
        $(defaultEditorSelector) : $(replayEditorSelector);

    var nicklist = [];

    // Load nicks when page is ready
	// Then build nicktable
    $(function() {

        // Choose the correct selector
        let nickSelector = editor.selector == defaultEditorSelector ?
            '.bigusername' : 'div#collapseobj_threadreview td.alt2';

        // Append nickname to nicklist only once
        $(nickSelector).each((index, value) => {

            if (nickSelector != '.bigusername' ^ !value.parentElement.title.indexOf('Mensaje') != 0)
                return;

            let nickname = value.innerText.trim();

            // If nickname not in the list
            if (nicklist.indexOf(nickname) === -1)
                nicklist.push(nickname);
        });

        nicklist.sort(function(a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();

            return a.localeCompare(b);
        });


        // Create nick table
        let div = $(editor).parent().parent();

        if (editor.selector === replayEditorSelector)
            div = div.parent();

        let table = "<table id='nicktable'>";
        let col = 0;

        nicklist.forEach(function(nick) {
            table += `<td><div class='nick'>${nick}</div></td>`;

            if (col % 6 === 0 && col !== 0) // Build rows
                table = "</tr>" + table + "<tr>";

            col += 1;
        });

        table += "</table>";

        div.prepend(table);

        $('#nicktable').hide();

        $('#nicktable').on('click', 'td', function(e) {
            let cursor = editor.prop("selectionStart");

            let text = editor.val();

            let preText = text.substr(0, cursor);
            let postText = text.substr(cursor);

            let nickname = $(this).text();

            let newText = preText;

            // Check if is there a space after the cursor
            let needSpace = text.substr(cursor, 1) !== ' ';

            // If nickname has no spaces
            if (nickname.split(' ').length == 1) {
                newText += nickname;
            } else {
                // First remove '@' cause no longer needed
                newText = newText.slice(0, -1);

                newText += `[MENTION]${nickname}[/MENTION]`;
            }

            newText += (needSpace ? ' ' : '') + postText;

            let newCursor = cursor + (newText.length - text.length) + 1;

            $('#nicktable').hide();

            editor.val(newText);
            editor.focus();

            // Set cursor position
            editor[0].setSelectionRange(newCursor, newCursor);
        });
    });

    // Set trigger key
    editor.keypress(function(e) {
        if (e.key === '@') $('#nicktable').show();
        else $('#nicktable').hide()
    });

    // Update Editor State
    function updateNicktableState(e) {
        let cursor = editor.prop("selectionStart");

        if (editor.val()[cursor - 1] === '@') {
            $('#nicktable').show();
            
            if (editor.selector === defaultEditorSelector)
                editor[0].scrollIntoView()
        } else {
            $('#nicktable').hide();
        }
    }

    editor.keydown(updateNicktableState);
    editor.keyup(updateNicktableState);
    editor.click(updateNicktableState);
    editor.change(updateNicktableState);

})();
