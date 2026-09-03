const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {

    const token = req.cookies.accessToken;

    if (!token) {
        return res.sendStatus(401);
    }

    console.log("Access token from cookie:", token);

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN,
        (err, decoded) => {

            if (err) {
                return res.sendStatus(403);
            }

            console.log(
                "decoded user info:",
                decoded.UserInfo
            );

            req.mail = decoded.UserInfo.mail;
            req.UserInfo = decoded.UserInfo;

            next();
        }
    );
};

module.exports = verifyJwt;