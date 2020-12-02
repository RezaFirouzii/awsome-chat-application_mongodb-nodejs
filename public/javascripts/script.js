export function getChatBoxTemplate(name, imageAddress='', lastMessage={ owner: 'Reza', message: 'Hello world.'}) {
    return `<div class="d-flex bd-highlight">
                <div class="img_cont">
                    <img src="${imageAddress}" alt="${name}" class="rounded-circle group_img">
                </div>
                <div class="group_info">
                    <span>${name}</span>
                    <p><b>${lastMessage.owner}:</b> ${lastMessage.message}</p>
                </div>
            </div>`;
}