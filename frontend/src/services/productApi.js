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

export async function fetchProductsForAdmin() {
  const res = await fetch(`${API_BASE}/products/admin/all`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy danh sách sản phẩm admin");
  return data.data || [];
}

export async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tạo sản phẩm");
  return data;
}

export async function updateProduct(id, payload) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi cập nhật sản phẩm");
  return data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi xóa sản phẩm");
  return data;
}
