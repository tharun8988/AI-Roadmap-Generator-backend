const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const {mail, pwd} = req.body;
    if(!mail || !pwd) return res.status(400).json({'message': 'Username and password are required'});

    const foundUser = await User.findOne({mail: mail}).exec();
    console.log("login mail:", mail);
    console.log("foundUser:", foundUser? true : false);
    if(!foundUser) return res.sendStatus(401);

    const match = await bcrypt.compare(pwd, foundUser.password);
    if(match) {
        const accessToken = jwt.sign(
        {
            "UserInfo": {
                "id": foundUser._id,
                "mail": foundUser.mail
            }
        },
        process.env.ACCESS_TOKEN,
        {expiresIn: '720s'}
    );

    const refreshToken = jwt.sign(
        {"UserInfo": {"id": foundUser._id, "mail": foundUser.mail}},
        process.env.REFRESH_TOKEN,
        {expiresIn: '1d'}
    );

    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

    res.cookie("accessToken", accessToken, {httpOnly: true, secure: true, sameSite: 'none', maxAge: 12 * 60 * 1000 });

    res.cookie('jwt', refreshToken, {httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
    res.json({message: 'Login Successful'});
    }else{
        res.sendStatus(401);
    }
}
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.UserInfo.id)
            .select("-password -refreshToken");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                mail: user.mail
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {handleLogin, getCurrentUser};
