import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.SHIPROCKET_BASE_URL;

let token = null;
let tokenExpiry = null;

const login = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    token = response.data.token;

    // Shiprocket token validity is 10 days
    tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);

    console.log("✅ Shiprocket authenticated.");

    return token;
  } catch (err) {
    console.error(
      "Shiprocket Login Failed:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const getShiprocketToken = async () => {
  if (token && tokenExpiry && Date.now() < tokenExpiry) {
    return token;
  }

  return await login();
};

export const shiprocket = axios.create({
  baseURL: BASE_URL
});

shiprocket.interceptors.request.use(async config => {
  const token = await getShiprocketToken();

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});