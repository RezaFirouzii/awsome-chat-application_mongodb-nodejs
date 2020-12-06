import {
    getChatBoxTemplate,
    getGroupHeaderTemplate,
    getGroupBodyTemplate,
    getGroupFooterTemplate
} from "./script.js";

_init();

function _init() {

    /* Fetch API for rendering Info */
    fetch('/chat/render').then(response => {
        return response.json();
    }).then(data => {
        // Adding chat boxes for each group
        data.user.groups.forEach(group => {
            // const groupMessages = group.messages;
            // const totalMessages = groupMessages.length;

            const groupsList = document.querySelector('.groups');
            const chatBox = document.createElement('li');
            chatBox.innerHTML = getChatBoxTemplate(group.name/*, group.logo, groupMessages[totalMessages - 1]*/);
            groupsList.appendChild(chatBox);

            // Listener for each chat box
            const chatPanel = document.getElementById('chat_panel');
            group.visited = false;
            chatBox.addEventListener('click', e => {
                e.preventDefault();
                if (!group.visited) {
                    group.visited = false;
                    const chatCard = document.createElement('div');
                    chatCard.classList.add('card');
                    const groupHeader = getGroupHeaderTemplate(group.name, group.size/*, group.logo, group online members (using sockets)*/);
                    const groupBody = getGroupBodyTemplate(data.user, group.admin, group.messages);
                    const groupFooter = getGroupFooterTemplate();
                    chatCard.append(groupHeader, groupBody, groupFooter);
                    chatPanel.appendChild(chatCard);
                }
            });
        });
    });

    /* New group listener */
    const newGroupBtn = document.querySelector('.btn');
    newGroupBtn.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/chat/add-group';
    });
}