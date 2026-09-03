const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); // Forbidden

    // evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        (err, decoded) => {
            const decodedMail = decoded?.UserInfo?.mail || decoded?.mail;
            if (err || foundUser.mail !== decodedMail) return res.sendStatus(403);

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "id": foundUser._id,
                        "mail": foundUser.mail,
                    }
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: '720s' }
            );

            // Set the fresh accessToken cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                maxAge: 12 * 60 * 1000
            });

            res.json({ accessToken });
        }
    );
};

module.exports = { handleRefreshToken };