import {
    getChatBoxTemplate,
    getGroupHeaderTemplate,
    getGroupBodyTemplate,
    getGroupFooterTemplate,
    getMessageTemplate,
    getMemberTemplate
} from "./script.js";

const socket = io();

/* Fetch API for rendering Info */
fetch('/chat/render').then(response => {
    return response.json();
}).then(data => {
    renderChat(data);
});

function renderChat(data) {
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
        chatBox.innerHTML = getChatBoxTemplate(group.name, group.image, lastMessage);
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
                const header = getGroupHeaderTemplate(group.name, group.image, group.size);
                const body = getGroupBodyTemplate(data.user, group.admin, group.messages);
                const footer = getGroupFooterTemplate();
                group.chatCard = { header, body, footer };
                chatCard.append(header, body, footer);
            }

            socket.emit('groupSelection', info, group);
            socket.on('online', onlineUsers => {
                group.chatCard.header = getGroupHeaderTemplate(group.name, group.image, group.size, onlineUsers);
                chatCard.innerHTML = '';
                chatCard.append(group.chatCard.header, group.chatCard.body, group.chatCard.footer);
            });
            scrollBottom(group.chatCard.body);
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
                    message: typeMsg.value
                }
                socket.emit('output', group.admin, message, group.id);
                typeMsg.value = '';
            });
            setTimeout(() => groupMenuOnListen(data.user, group), 50);
        });
        if (group.chatCard === undefined) {
            group.chatCard = chatCard;
            group.chatCard.body = getGroupBodyTemplate(data.user, group.admin, group.messages);
        }
        socket.on('input', (admin, message) => {
            chatBox.innerHTML = getChatBoxTemplate(group.name, group.image, message, data.user.first_name);
            const messageTemplate = getMessageTemplate(data.user, admin, message);
            group.chatCard.body.appendChild(messageTemplate);
            scrollBottom(group.chatCard.body);
        });
    });
}

/* Search group listener */
const searchField = document.querySelector('.search');
searchField.addEventListener('change', e => {
    e.preventDefault();
    fetch(`/chat/search?search=${searchField.value}`).then(response => response.json()).then(data => {
        if (data.ok) {
            document.querySelector('.groups').innerHTML = '';
            if (data.n) renderChat(data);
        } else window.location.reload();
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

    // Members of group listener
    options[1].addEventListener('click', e => {
        e.preventDefault();
        fetch(`/chat/group-members?members=${group.members}`).then(response => response.json()).then(data => {
            let membersInfo = '';
            const longestName = data.longestName + 1; // length 0f the longest name (Number)
            const longestUsername = data.longestUsername; // length of the longest username (Number)
            data.members.forEach(member => {
                membersInfo += getMemberTemplate(longestName, member.name, longestUsername, member.username);
                if (member.username === group.admin) membersInfo += '     ⭐';
                membersInfo += '\n';
            });
            alert(membersInfo);
        });
    });

    // Online members listener
    options[3].addEventListener('click', e => {
        e.preventDefault();
        fetch(`/chat/online-members?groupID=${group.id}`).then(response => response.json()).then(onlineMembers => {
            let info = '';
            onlineMembers.forEach(member => {
                info += `🗣 ${member.first_name} ${member.last_name}\n`
            });
            alert(info);
        });
    });

    // Add member listener
    options[5].addEventListener('click', e => {
        const newMember = prompt('Enter username of the new member');

        // client side validation
        if (newMember === '' || newMember === null) {
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

function scrollBottom(body) {
    // setting the scroll to bottom
    const interval = setInterval(() => {
        body.scrollTop = body.scrollHeight;
    }, 10);
    setTimeout(() => clearInterval(interval), 2000);
}