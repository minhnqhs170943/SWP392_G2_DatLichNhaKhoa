const API_BASE = process.env.REACT_APP_API_URL;

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách sản phẩm");
  return data.data || [];
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy chi tiết sản phẩm");
  return data.data;
}
