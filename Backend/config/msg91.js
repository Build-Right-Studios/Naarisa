import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://control.msg91.com/api/v5/oneapi/api/flow";
const AUTH_KEY = process.env.MSG91_AUTH_KEY;

export const sendSMSTemplate = async (flowSlug, phone, values = []) => {
  try {
    const variables = {};

    values.forEach((value, index) => {
      variables[`var${index + 1}`] = {
        value: String(value),
      };
    });

    const payload = {
      data: {
        sendTo: [
          {
            to: [
              {
                mobiles: `91${phone}`,
                variables,
              },
            ],
            variables,
          },
        ],
      },
    };

    const response = await axios.post(
      `${BASE_URL}/${flowSlug}/run`,
      payload,
      {
        headers: {
          authkey: AUTH_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "MSG91 Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};