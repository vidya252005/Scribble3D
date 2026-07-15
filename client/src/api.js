import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export async function fetchDefaultScene() {
  const { data } = await api.get("/scenes/default");
  return data; // { scene, objects }
}

export async function generateObject({ prompt, targetObjectId }) {
  const { data } = await api.post("/agent/generate", { prompt, targetObjectId });
  return data; // { object, trace }
}

export async function deleteObject(objectId) {
  const { data } = await api.delete(`/scenes/objects/${objectId}`);
  return data;
}

export async function clearScene() {
  const { data } = await api.delete("/scenes/clear");
  return data;
}

export default api;
