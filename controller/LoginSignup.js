const User = require("../model/UserModel");
const bcrypt = require("bcrypt");
const { z, email, success } = require("zod");
const jwt = require("jsonwebtoken");
const Logout = require("../model/LogoutModeol");
const { path } = require("pdfkit");
const {addInPineCone} = require("./AiController/RAG")
exports.signUp = async (req, res) => {
    const signUpVaildation = z.object({
        email: z.string().email({ message: "Enter valid email" }),
        username: z.string().min(2, { message: "Enter Username" }),
        password: z.string().min(5, { message: "Enter 5 digit" })
    });

    try {
        const validResult = signUpVaildation.safeParse(req.body);
        if (!validResult.success) {
            return res.status(400).json({
                success: false,
                error: validResult.error.issues[0].message
            });
        }

        const { email, username, password } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({
                success: false,
                error: "User already exists"
            });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const avatarLink = `https://api.dicebear.com/6.x/initials/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password: hashPassword,
            manager: null,
            profileImage: avatarLink
        });

        const saved = await user.save();
        const context = {
            "username":saved.username,
            "id":saved._id,
            "role":saved.role,
            "email":saved.email
        }
        await addInPineCone(context);

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

exports.login = async (req, res) => {
  const loginValidation = z.object({
    email: z.string().email({ message: "Enter valid email" }),
    password: z.string().min(5, { message: "Enter 5 digit" }),
  });

  try {
    const validResult = loginValidation.safeParse(req.body);
    if (!validResult.success) {
      return res.status(500).json({ error: validResult.error.issues[0].message });
    }

    const { email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ error: "User not exist" });
    }

    const passwordCheck = await bcrypt.compare(password, userExist.password);
    if (!passwordCheck) {
      return res.status(400).json({ error: "Please enter correct password" });
    }

    const token = jwt.sign({ email: userExist.email }, process.env.JWT_SECRET, {
      expiresIn: 24 * 60 * 60,
    });

    const cookiesOption = {
      httpOnly: true,
      maxAge: 48 * 60 * 60 * 1000,
      secure: false,
    };

    await Logout.deleteMany({ email: userExist.email });

    return res
      .cookie("token", token, cookiesOption)
      .status(200)
      .json({
        success: true,
        message: "Login Successfully",
        role: userExist.role,
        token :token
      });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};



exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ message: "No token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const logout = new Logout({ email, blockedToken: token });
        await logout.save();

        res.clearCookie("token");

        return res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
        console.log(`Logout error: ${error}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
};


exports.roleCheck = async (req, res) => {
    try {
        const cookie = req.cookies.token;
        console.log(cookie)
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(400).json({ message: "Please login again" });
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const email = decode.email;
        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(400).status("Please Login again");
        }

        return res.status(200).json({ message: userExist.role });
    } catch (error) {
        console.log(`Logout error: ${error}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
}

exports.userProfile = async (req, res) => {
    try {
        const email = req.email;
        const userExist = await User.findOne({ email });
        return res.status(200).json({ message: userExist });
    } catch (error) {
        console.log(`Logout error: ${error}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
}


exports.profileView = async (req, res) => {
    try {

        const { id } = req.query;
        const userDetails = await User.findById({_id:id})
            .select("-password -email")
            .populate({ path: "manager", select: "username profileImage" });
        return res.status(200).json(userDetails);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server error" });
    }
}

exports.isLogin = async(req,res)=>{
    try {
        const email = req.body;
        const userExist = await User.findOne(email);
        if(userExist !== null)
        {
            return res.status(200).json("LoggedIn");
        }
        console.log(userExist)
        return res.status(500).json("Not LoggedIn");
    } catch (error) {
         console.log(error)
        return res.status(500).json({ message: "Internal Server error" });
    }
}
