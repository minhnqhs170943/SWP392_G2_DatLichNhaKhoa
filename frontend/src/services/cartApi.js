const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getUserId() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return user?.UserID ?? user?.UserId ?? user?.id ?? null;
  } catch {
    return null;
  }
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Lỗi cart API");
  }
  return data.data;
}

export async function fetchCart() {
  const userId = getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  const res = await fetch(`${API_URL}/cart/${userId}`);
  return handleResponse(res);
}

export async function addCartItem(productId, quantity = 1) {
  const userId = getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  const res = await fetch(`${API_URL}/cart/${userId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  return handleResponse(res);
}

export async function updateCartItem(productId, quantity) {
  const userId = getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  const res = await fetch(`${API_URL}/cart/${userId}/items/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(res);
}

export async function removeCartItem(productId) {
  const userId = getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  const res = await fetch(`${API_URL}/cart/${userId}/items/${productId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function clearCartItems() {
  const userId = getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  const res = await fetch(`${API_URL}/cart/${userId}/clear`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
