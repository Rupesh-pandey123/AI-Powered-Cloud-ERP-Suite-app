export const loginUser = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 1000));

  return {
    token: "fake-jwt-token-123",
  };
};