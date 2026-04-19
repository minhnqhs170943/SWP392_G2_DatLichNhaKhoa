import { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchProductsForAdmin,
  updateProduct,
} from "../../services/productApi";
import { uploadImage } from "../../services/uploadApi";

const initialForm = {
  productName: "",
  brand: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageURL: "",
  isActive: true,
};

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submitLabel = useMemo(() => (editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"), [editingId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchProductsForAdmin();
      setProducts(data);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSelectImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMessage("Đang upload ảnh...");
      const result = await uploadImage(file);
      onChange("imageURL", result.imageUrl);
      setMessage("Upload ảnh thành công");
    } catch (error) {
      setMessage(error.message || "Upload thất bại");
    } finally {
      e.target.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const payload = {
        productName: form.productName.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageURL: form.imageURL.trim(),
        isActive: form.isActive,
      };

      if (!payload.productName || Number.isNaN(payload.price) || Number.isNaN(payload.stockQuantity)) {
        setMessage("Vui lòng nhập tên, giá và số lượng hợp lệ");
        return;
      }

      if (editingId) {
        await updateProduct(editingId, payload);
        setMessage("Cập nhật sản phẩm thành công");
      } else {
        await createProduct(payload);
        setMessage("Thêm sản phẩm thành công");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setMessage(error.message || "Lưu sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (p) => {
    setEditingId(p.ProductID);
    setForm({
      productName: p.ProductName || "",
      brand: p.Brand || "",
      description: p.Description || "",
      price: p.Price ?? "",
      stockQuantity: p.StockQuantity ?? "",
      imageURL: p.ImageURL || "",
      isActive: Boolean(p.IsActive),
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn ẩn sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      setMessage("Đã ẩn sản phẩm");
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      await loadData();
    } catch (error) {
      setMessage(error.message || "Xóa sản phẩm thất bại");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#1e293b" }}>Quản lý sản phẩm</h2>
        <p style={{ margin: 0, color: "#64748b" }}>Thêm, sửa, xóa sản phẩm trong hệ thống</p>
      </div>

        <form
          onSubmit={onSubmit}
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            display: "grid",
            gap: 10,
          }}
        >
          <input placeholder="Tên sản phẩm" value={form.productName} onChange={(e) => onChange("productName", e.target.value)} />
          <input placeholder="Thương hiệu" value={form.brand} onChange={(e) => onChange("brand", e.target.value)} />
          <textarea placeholder="Mô tả" value={form.description} onChange={(e) => onChange("description", e.target.value)} />
          <input
            placeholder="Giá"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => onChange("price", e.target.value)}
          />
          <input
            placeholder="Số lượng"
            type="number"
            min="0"
            step="1"
            value={form.stockQuantity}
            onChange={(e) => onChange("stockQuantity", e.target.value)}
          />
          <input placeholder="Image URL" value={form.imageURL} onChange={(e) => onChange("imageURL", e.target.value)} />
          <input type="file" accept="image/*" onChange={onSelectImage} />

          {form.imageURL ? (
            <img src={form.imageURL} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }} />
          ) : null}

          <label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange("isActive", e.target.checked)}
            />{" "}
            Đang hoạt động
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : submitLabel}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Hủy sửa
              </button>
            ) : null}
          </div>
        </form>

        {message ? <p style={{ color: "#0f172a" }}>{message}</p> : null}

        <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#e2e8f0" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 10 }}>ID</th>
                <th style={{ textAlign: "left", padding: 10 }}>Ảnh</th>
                <th style={{ textAlign: "left", padding: 10 }}>Tên</th>
                <th style={{ textAlign: "left", padding: 10 }}>Giá</th>
                <th style={{ textAlign: "left", padding: 10 }}>Kho</th>
                <th style={{ textAlign: "left", padding: 10 }}>Trạng thái</th>
                <th style={{ textAlign: "left", padding: 10 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: 12 }}>
                    Đang tải...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 12 }}>
                    Chưa có sản phẩm
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.ProductID} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: 10 }}>{p.ProductID}</td>
                    <td style={{ padding: 10 }}>
                      {p.ImageURL ? (
                        <img src={p.ImageURL} alt={p.ProductName} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6 }} />
                      ) : (
                        <span>Không ảnh</span>
                      )}
                    </td>
                    <td style={{ padding: 10 }}>{p.ProductName}</td>
                    <td style={{ padding: 10 }}>{Number(p.Price || 0).toLocaleString("vi-VN")} ₫</td>
                    <td style={{ padding: 10 }}>{p.StockQuantity}</td>
                    <td style={{ padding: 10 }}>{p.IsActive ? "Hiển thị" : "Đã ẩn"}</td>
                    <td style={{ padding: 10, display: "flex", gap: 8 }}>
                      <button onClick={() => onEdit(p)}>Sửa</button>
                      <button onClick={() => onDelete(p.ProductID)}>Ẩn</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
