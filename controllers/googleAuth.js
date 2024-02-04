import { getAuth } from "firebase-admin/auth";
import User from "../models/User.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

/*============ SIGNUP AND LOGIN USER WITH GOOGLE ============= */

export const postGoogleAuth = async (req, res, next) => {
  try {
    let { access_token } = req.body;
    const decodedUser = await getAuth().verifyIdToken(access_token);
    let { email, name, picture } = await decodedUser;
    picture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.email personal_info.fullName personal_info.username personal_info.profile_img google_auth isAdmin isEditor"
    );

    if (user) {
      if (!user.google_auth) {
        // check if user is logged in with google or not
        return res.status(403).json({
          error:
            "This email was signed up without google login. Please login with email and password to access the account.",
        });
      }
    } else {
      // if google is not logged in with google then signup access
      let username = email.split("@")[0] + nanoid();
      const data = {
        personal_info: {
          email,
          fullName: name,
          profile_img: picture,
          username: username.substring(0, 18),
        },
        google_auth: true,
      };

      const newUser = await User.create(data);
      user = newUser;
    }

    const { password: pass, bio, ...UserOtherInfo } = user.personal_info;

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, isEditor: user.isEditor },
      process.env.SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );

    const frontData = {
      ...UserOtherInfo,
      userId: user._id,
      isEditor: user.isEditor,
      isAdmin: user.isAdmin,
      token,
    };

    res.cookie("accessToken", token, { httpOnly: true });

    res.status(200).json(frontData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
