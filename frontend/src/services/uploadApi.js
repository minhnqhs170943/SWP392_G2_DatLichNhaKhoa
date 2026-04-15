const API_BASE = process.env.REACT_APP_API_URL;

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Upload failed");
  return data; // { imageUrl, publicId }
}
