import axios from "axios";

// LOGIN
export const loginUser = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 1000));

  return {
    token: "fake-jwt-token-123",
  };
};

// REGISTER
export const registerUser = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 1000));

  return {
    message: "User registered successfully",
  };
};
export const getToken = () => {
  return localStorage.getItem("token");
};