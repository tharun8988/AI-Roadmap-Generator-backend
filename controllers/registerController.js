const User = require('../models/user');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    console.log("NEW registerController loaded");
    const {name, mail, pwd} = req.body;
    if(!name || !mail || !pwd) return res.status(400).json({'message' : 'Username and Password are required'});

    const duplicate = await User.findOne({mail : mail}).exec();
    if(duplicate) return res.sendStatus(409);

    try{
        const hashPwd = await bcrypt.hash(pwd,10);

        const result = await User.create({
            "name": name,
            "mail": mail,
            "password": hashPwd
        });

        console.log(result);
        res.status(201).json({'success': `New user ${mail} created!`})
    }catch(err){
        res.status(500).json({'message': err.message});
    }
}

module.exports = { handleNewUser };
