const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN,
        (err, decoded) => {
            if (err) return res.sendStatus(403);

            req.mail = decoded.UserInfo.mail;
            req.UserInfo = decoded.UserInfo;
            next();
        }
    );
};

module.exports = verifyJwt;
