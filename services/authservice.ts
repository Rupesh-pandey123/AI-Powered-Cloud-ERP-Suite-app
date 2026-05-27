import axios from "axios";

// LOGIN
export const loginUser = async (email: string, password: string) => {
  const response = await axios.post("http://localhost:5000/auth/login", {
    email,
    password,
  });

  return response.data;
};

// REGISTER
export const registerUser = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 1000));

  return {
    message: "User registered successfully",
  };
};