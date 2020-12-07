export function getChatBoxTemplate(name, imageAddress = '', lastMessage = {owner: 'Reza', message: 'Hello world.'}) {
    if (name === undefined) name = 'undefined';
    return `<div class="d-flex bd-highlight">
                <div class="img_cont">
                    <img src="${imageAddress}" alt="${name}" class="rounded-circle group_img">
                </div>
                <div class="group_info">
                    <span>${name}</span>
                    <p><b>${lastMessage.owner.name}:</b> ${lastMessage.message}</p>
                </div>
            </div>`;
}

export function getGroupHeaderTemplate(name, population, onlineMembers=[1]) {
    if (population === undefined) population = 0;
    const headerNode = document.createElement('div');
    headerNode.classList.add('card-header', 'msg-head');
    headerNode.innerHTML = `<div class="d-flex bd-highlight">
                                <div class="img_cont">
                                    <img src="" alt="" class="rounded-circle group_img">
                                </div>
                                <div class="group_info">
                                    <span>${name}</span>
                                    <p>${population} members, ${onlineMembers.length} online</p>
                                </div>
                            </div>
                            <span id="action_menu_btn"><i class="fas fa-ellipsis-v"></i></span>
                            <div class="action_menu">
                                <ul>
                                    <li><i class="fas fa-users"></i> Members</li>
                                    <li><i class="fas fa-user-circle"></i> Online Members</li>
                                    <li><i class="fas fa-plus"></i> Add to group</li>
                                    <li><i class="fas fa-ban"></i> Leave Group</li>
                                </ul>
                            </div>`
    return headerNode;
}

export function getGroupBodyTemplate(user, admin, messages) {
    // if (messages === undefined)
    //     // Testing manually
    //     messages = [
    //         {
    //             owner: {
    //                 name: "Mohammad",
    //                 username: "mmm"
    //             },
    //             message: "This is also a test from awesome chat app",
    //             date: "Monday",
    //             time: "8:55 AM"
    //         },
    //         {
    //             owner: {
    //                 name: user.first_name,
    //                 username: user.username
    //             },
    //             message: "This is a test from awesome chat app",
    //             date: "Monday",
    //             time: "8:40 AM"
    //         },
    //         {
    //             owner: {
    //                 name: "Mohammad",
    //                 username: "mmm"
    //             },
    //             message: "This is also a test from awesome chat app",
    //             date: "Monday",
    //             time: "8:55 AM"
    //         },
    //         {
    //             owner: {
    //                 name: user.first_name,
    //                 username: user.username
    //             },
    //             message: "This is still a test from awesome chat app",
    //             date: "Monday",
    //             time: "9:30 AM"
    //         }
    //     ]
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'msg_card_body');
    if (messages !== undefined)
        messages.forEach(message => {
            const messageTemplate = getMessageTemplate(user, admin, message);
            cardBody.appendChild(messageTemplate);
        });
    return cardBody;
}

export function getGroupFooterTemplate() {
    const footerNode = document.createElement('div');
    footerNode.classList.add('card-footer');
    footerNode.innerHTML = `<div class="input-group">
                                <div class="input-group-append">
                                    <span class="input-group-text attach_btn"><i class="fas fa-paperclip"></i></span>
                                </div>
                                <textarea name="message_input" class="form-control type_msg" placeholder="Type your message..."></textarea>
                                <div class="input-group-append">
                                    <span class="input-group-text send_btn"><i class="fas fa-location-arrow"></i></span>
                                </div>
                            </div>`;
    return footerNode;
}

export function getMessageTemplate(user, admin, message) {
    const messageTemplate = document.createElement('div');
    messageTemplate.classList.add('d-flex', 'mb-4');
    messageTemplate.style.marginTop = '10px';

    if (message.owner.username === user.username) {
        messageTemplate.classList.add('justify-content-end');
        const bubble = document.createElement('div');
        bubble.classList.add('msg_container_send');

        let bubbleHtml = `<span class="msg_user_send">${message.owner.name}</span>
                                ${message.message}
                                <span class="msg_time_send">${message.time}, ${message.date}</span>`;
        if (user.username === admin)
            bubbleHtml += `<span><i class="material-icons user_admin">how_to_reg</i></span>`;
        bubble.innerHTML = bubbleHtml;
        messageTemplate.appendChild(bubble);
    } else {
        messageTemplate.classList.add('justify-content-start');
        const bubble = document.createElement('div');
        bubble.classList.add('msg_container');

        let bubbleHtml = `<span class="msg_user">${message.owner.name}</span>
                              ${message.message}
                              <span class="msg_time">${message.time}, ${message.date}</span>`;
        if (message.owner.username === admin)
            bubbleHtml += `<span><i class="material-icons msg_admin">how_to_reg</i></span>`;
        bubble.innerHTML = bubbleHtml;
        messageTemplate.appendChild(bubble);
    }
    return messageTemplate;
}






































