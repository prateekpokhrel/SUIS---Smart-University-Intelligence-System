export const login = (role) => {
  localStorage.setItem("role", role);
};

export const logout = () => {
  localStorage.removeItem("role");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAuthed = () => {
  return !!getRole();
};
