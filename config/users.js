const onlineUsers = [];

// is called when a this group is clicked
function userJoin(id, info, group) {
    const user = {
        id,
        first_name: info.first_name,
        last_name: info.last_name,
        username: info.username,
        groupID: group.id
    };
    const objects = onlineUsers.filter(obj => obj.id === group.id);
    if (objects.length) {
        for (const onlineUser of objects[0].users) {
            if (onlineUser.username === user.username)
                return user;
        }
        objects[0].users.push(user);
    } else {
        onlineUsers.push({
            id: group.id,
            users: [user]
        });
    }
    return user;
}

// Getting current user
function getCurrentUser(id, group) {
    const object = onlineUsers.find(obj => obj.id === group.id);
    return object.users.find(user => user.id === id);
}

// Getting online members
function getOnlineUsers(id) {
    const object = onlineUsers.find(obj => obj.id === id);
    console.log(onlineUsers);
    return object.users;
}

module.exports = { userJoin, getOnlineUsers }