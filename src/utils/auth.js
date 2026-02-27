export const getAuth = () => {
  return {
    token: localStorage.getItem("token"),
    userType: localStorage.getItem("userType"),
  };
};

export const setAuth = (token, userType) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userType", userType);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
};
