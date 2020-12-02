import {getChatBoxTemplate} from "./script.js";

_init();

function _init() {

    /* Fetch API for rendering Info */
    fetch('/chat/render').then(response => {
        return response.json();
    }).then(groups => {
        // Adding chat boxes for each group
        groups.forEach(group => {
            // const groupMessages = group.messages;
            // const totalMessages = groupMessages.length;

            const groupsList = document.querySelector('.groups');
            const chatBox = document.createElement('li');
            chatBox.innerHTML = getChatBoxTemplate(group.name/*, group.logo, groupMessages[totalMessages - 1]*/);
            groupsList.appendChild(chatBox);
        });
    });
}