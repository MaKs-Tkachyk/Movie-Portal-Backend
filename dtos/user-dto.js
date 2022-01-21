module.exports = class UserDto{
    email;
    id;
    isActivated;
    userName;
    avatar;
    
    constructor(model){
        this.email = model.email
        this.userName = model.userName
        this.id = model._id
        this.isActivated = model.isActivated
        this.avatar = model.avatar
        this.admin = model.admin
    }
}