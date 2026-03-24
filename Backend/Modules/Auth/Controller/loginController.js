import { loginService } from "../Service/loginService.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const result = await loginService({ email, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      token: result.token,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};