import API from "./axios";

export const searchUsers = (search) => API.get("/users", { params: { search } });
export const updateProfile = (data) => API.put("/users/me", data);
