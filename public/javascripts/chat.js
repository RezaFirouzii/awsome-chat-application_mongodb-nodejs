import {
    getChatBoxTemplate,
    getGroupHeaderTemplate,
    getGroupBodyTemplate,
    getGroupFooterTemplate,
    getMessageTemplate
} from "./script.js";

const socket = io();

/* Fetch API for rendering Info */
fetch('/chat/render').then(response => {
    return response.json();
}).then(data => {
    // Adding chat boxes for each group
    data.user.groups.forEach(group => {
        let lastMessage;
        if (group.messages === undefined) {
            group.messages = [];
            lastMessage = undefined;
        } else {
            lastMessage = group.messages[group.messages.length - 1];
        }

        const groupsList = document.querySelector('.groups');
        const chatBox = document.createElement('li');
        chatBox.innerHTML = getChatBoxTemplate(group.name, '/images/utils/bg.jpg', lastMessage);
        groupsList.appendChild(chatBox);

        const info = {
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            username: data.user.username
        }

        // Listener for each chat box
        const chatPanel = document.getElementById('chat_panel');
        const chatCard = document.createElement('div');
        chatCard.classList.add('card');
        group.visited = false;
        chatBox.addEventListener('click', e => {
            e.preventDefault();
            if (!group.visited) {
                group.visited = true;
                const header = getGroupHeaderTemplate(group.name, group.size);
                const body = getGroupBodyTemplate(data.user, group.admin, group.messages);
                const footer = getGroupFooterTemplate();
                group.chatCard = { header, body, footer };
                chatCard.append(header, body, footer);
            }

            socket.emit('groupSelection', info, group);
            socket.on('online', onlineUsers => {
                console.log(onlineUsers);
                group.chatCard.header = getGroupHeaderTemplate(group.name, group.size, onlineUsers);
                chatCard.innerHTML = '';
                chatCard.append(group.chatCard.header, group.chatCard.body, group.chatCard.footer);
            });

            chatPanel.innerHTML = '';
            chatPanel.appendChild(chatCard);

            // send button listener
            const sendBtn = document.querySelector('.send_btn');
            const typeMsg = document.querySelector('.type_msg');
            sendBtn.addEventListener('click', e => {
                e.preventDefault();
                if (typeMsg.value === '') return;
                const message = {
                    owner: {
                        name: data.user.first_name,
                        username: data.user.username
                    },
                    message: typeMsg.value,
                    date: "Monday",
                    time: "22:00 PM"
                }
                socket.emit('output', group.admin, message, group.id);
                typeMsg.value = '';
            });
            setTimeout(() => groupMenuOnListen(data.user, group), 10);
        });
        socket.on('input', (admin, message) => {
            const messageTemplate = getMessageTemplate(data.user, admin, message);
            group.chatCard.body.appendChild(messageTemplate);
            group.chatCard.body.scrollTop = group.chatCard.body.scrollHeight;
        });
    });
});

/* New group listener */
const newGroupBtn = document.querySelector('.btn');
newGroupBtn.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/chat/add-group';
});

/* group menu listener */
function groupMenuOnListen(user, group) {
    const menuBtn = document.getElementById('action_menu_btn');
    const actionMenu = document.querySelector('.action_menu');
    const options = actionMenu.firstChild.nextSibling.childNodes;

    actionMenu.style.display = 'none';
    menuBtn.addEventListener('click', e => {
        e.preventDefault();
        actionMenu.style.display = actionMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Add member listener
    options[5].addEventListener('click', e => {
        const newMember = prompt('Enter username of the new member');

        // client side validation
        if (newMember === '') {
            alert('Please enter a username.');
            return;
        }
        if (newMember.length < 5) {
            alert('Username must be at least 5 characters.');
            return;
        }

        fetch('/chat/add-member', {
            method: 'put',
            body: JSON.stringify({newMember, groupID: group.id}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(jsonRes => {
            if (!jsonRes.ok) {
                alert(jsonRes.reason);
                return;
            }
            const message = {
                owner: {name: '', username: ''},
                message: `<i>${user.first_name}</i> added <i>${jsonRes.first_name}</i> to group.`,
                date: "Monday",
                time: "22:00 PM"
            }
            socket.emit('output', group.admin, message, group.id);
        });
    });
    // Leave group listener
    options[7].addEventListener('click', e => {
        e.preventDefault();
        fetch('/chat/leave-group', {
            method: 'put',
            body: JSON.stringify({
                username: user.username,
                groupID: group.id
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(status => {
            if (status.ok && !status.deleted) {
                const message = {
                    owner: {name: '', username: ''},
                    message: `<i>${user.first_name}</i> left the group.`,
                    date: "Monday",
                    time: "22:00 PM"
                }
                socket.emit('output', group.admin, message, group.id);
            }
            window.location.reload();
        });
    });
}




