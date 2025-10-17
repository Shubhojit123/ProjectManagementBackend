const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const Logout = require("../model/LogoutModeol");
require("dotenv").config();


exports.auth = async (req, res, next) => {
    console.log(req,"Request");
    console.log(req.headers,"headers");
    
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token ;
    if (!token) {
        return res.status(400).json({ message: "Please login again" });
    }
    else {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.email = decode.email;
            const email = decode.email;
            const logoutdata = await Logout.findOne({email});
            const userExist = await User.findOne({ email });
            if(!userExist)
            {
                return res.status(400).json({ message: "User not exist please login again" });
            }
            if (logoutdata) {
                return res.status(401).json({ message: "You are logout " })
            }
            next();
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Invalid message" })
        }
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        const email = req.email;
        const userExist = await User.findOne({ email });
        const role = userExist.role;
        if (role === null) {
            return res.status(400).json({ message: "Please Login again" })
        }
        if (role === "Admin") {
            next();
        }
        else {
            return res.status(400).json({ message: "It is Private route" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



exports.isManager = async (req, res, next) => {
    try {
        const email = req.email;
        const userExist = await User.findOne({ email });
        const role = userExist.role;
        if (role === null) {
            return res.status(400).json({ message: "Please Login again" })
        }
        if (role === "Manager") {
            next();
        }
        else {
            return res.status(400).json({ message: "It is Private route" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



exports.isUser = async (req, res, next) => {
    try {
        const email = req.email;
        const userExist = await User.findOne({ email });
        const role = userExist.role;
        if (role === null) {
            return res.status(400).json({ message: "Please Login again" })
        }
        if (role === "User") {
            next();
        }
        else {
            return res.status(400).json({ message: "It is Private route" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.allowRoles = async (req, res, next) => {
    const email = req.email;
    const userExist = await User.findOne({ email });
    const role = userExist.role;
    const roles = ["Admin", "User", "Manager"];
    if (!roles.includes(role)) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};
