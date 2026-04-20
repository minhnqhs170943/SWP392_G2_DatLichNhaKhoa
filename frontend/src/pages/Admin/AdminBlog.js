import { useEffect, useMemo, useState } from "react";
import {
  createBlog,
  deleteBlog,
  fetchBlogsForAdmin,
  updateBlog,
} from "../../services/blogApi";
import { uploadImage } from "../../services/uploadApi";
import "./AdminBlog.css";

const initialForm = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  thumbnailURL: "",
  thumbnailFile: null,
  authorName: "",
  category: "",
  categoryName: "",
  tags: "",
  isPublished: true,
};

// Định nghĩa giới hạn ký tự cho các trường
const MAX_LENGTHS = {
  title: 150,
  summary: 300,
  content: 5000,
};

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submitLabel = useMemo(() => (editingId ? "Cập nhật blog" : "Thêm blog"), [editingId]);

  // Kiểm tra lỗi quá tải chữ (real-time)
  const isTitleError = form.title.length > MAX_LENGTHS.title;
  const isSummaryError = form.summary.length > MAX_LENGTHS.summary;
  const isContentError = form.content.length > MAX_LENGTHS.content;
  const hasLimitErrors = isTitleError || isSummaryError || isContentError;

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchBlogsForAdmin();
      setBlogs(data);
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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const onTitleChange = (value) => {
    onChange("title", value);
    if (!editingId) {
      onChange("slug", generateSlug(value));
    }
  };

  const onSelectImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage("Vui lòng chọn file ảnh");
      e.target.value = "";
      return;
    }

    // Chỉ lưu file, chưa upload
    onChange("thumbnailFile", file);
    
    // Tạo preview URL
    const previewUrl = URL.createObjectURL(file);
    onChange("thumbnailURL", previewUrl);
    
    e.target.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Chặn submit nếu đang có lỗi vượt quá ký tự
    if (hasLimitErrors) {
      setMessage("Vui lòng rút gọn nội dung bị quá giới hạn trước khi lưu.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      // Upload ảnh trước nếu có file mới
      let imageUrl = form.thumbnailURL;
      if (form.thumbnailFile) {
        const result = await uploadImage(form.thumbnailFile);
        imageUrl = result.imageUrl;
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        thumbnailURL: imageUrl,
        authorName: form.authorName.trim(),
        category: form.category.trim(),
        categoryName: form.categoryName.trim(),
        tags: form.tags.trim(),
        isPublished: form.isPublished,
      };

      if (!payload.title || !payload.slug || !payload.content) {
        setMessage("Vui lòng nhập tiêu đề, slug và nội dung");
        return;
      }

      if (editingId) {
        await updateBlog(editingId, payload);
        setMessage("Cập nhật blog thành công");
      } else {
        await createBlog(payload);
        setMessage("Thêm blog thành công");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setMessage(error.message || "Lưu blog thất bại");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (b) => {
    setEditingId(b.BlogID);
    setForm({
      title: b.Title || "",
      slug: b.Slug || "",
      summary: b.Summary || "",
      content: b.Content || "",
      thumbnailURL: b.ThumbnailURL || "",
      authorName: b.AuthorName || "",
      category: b.Category || "",
      categoryName: b.CategoryName || "",
      tags: b.Tags || "",
      isPublished: Boolean(b.IsPublished),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa blog này?")) return;
    try {
      await deleteBlog(id);
      setMessage("Đã xóa blog");
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      await loadData();
    } catch (error) {
      setMessage(error.message || "Xóa blog thất bại");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xuất bản";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="admin-blog-container">
      <div className="admin-blog-header">
        <h2>Quản lý Blog</h2>
        <p>Thêm, sửa, xóa bài viết blog</p>
      </div>

      <form onSubmit={onSubmit} className="blog-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tiêu đề <span className="required">*</span></label>
            <input 
              type="text"
              placeholder="Nhập tiêu đề blog" 
              value={form.title} 
              onChange={(e) => onTitleChange(e.target.value)} 
              required
              className={isTitleError ? "input-error" : ""}
            />
            {/* Bộ đếm và báo lỗi cho Tiêu đề */}
            <div className="char-counter-container">
              {isTitleError && <span className="error-text">Tiêu đề quá dài!</span>}
              <span className={`char-counter ${isTitleError ? "text-danger" : ""}`}>
                {form.title.length} / {MAX_LENGTHS.title}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Slug (URL) <span className="required">*</span></label>
            <input 
              type="text"
              placeholder="url-friendly-slug" 
              value={form.slug} 
              onChange={(e) => onChange("slug", e.target.value)} 
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tóm tắt</label>
          <textarea 
            placeholder="Mô tả ngắn gọn về bài viết" 
            value={form.summary} 
            onChange={(e) => onChange("summary", e.target.value)}
            rows="3"
            className={isSummaryError ? "input-error" : ""}
          />
          {/* Bộ đếm và báo lỗi cho Tóm tắt */}
          <div className="char-counter-container">
            {isSummaryError && <span className="error-text">Tóm tắt quá dài!</span>}
            <span className={`char-counter ${isSummaryError ? "text-danger" : ""}`}>
              {form.summary.length} / {MAX_LENGTHS.summary}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Nội dung <span className="required">*</span></label>
          <textarea 
            placeholder="Nội dung chi tiết (hỗ trợ HTML)" 
            value={form.content} 
            onChange={(e) => onChange("content", e.target.value)}
            rows="8"
            required
            className={isContentError ? "input-error" : ""}
          />
          {/* Bộ đếm và báo lỗi cho Nội dung */}
          <div className="char-counter-container">
            {isContentError && <span className="error-text">Nội dung quá dài!</span>}
            <span className={`char-counter ${isContentError ? "text-danger" : ""}`}>
              {form.content.length} / {MAX_LENGTHS.content}
            </span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tác giả</label>
            <input 
              type="text"
              placeholder="Tên tác giả" 
              value={form.authorName} 
              onChange={(e) => onChange("authorName", e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Tên danh mục</label>
            <input 
              type="text"
              placeholder="Ví dụ: Chăm sóc răng miệng" 
              value={form.categoryName} 
              onChange={(e) => onChange("categoryName", e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input 
            type="text"
            placeholder="Phân cách bằng dấu phẩy: nha khoa, răng sứ, niềng răng" 
            value={form.tags} 
            onChange={(e) => onChange("tags", e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label>Ảnh đại diện</label>
          <div className="image-upload-wrapper">
            <input 
              type="file" 
              accept="image/*" 
              onChange={onSelectImage}
              id="imageUpload"
              className="file-input"
            />
            <label htmlFor="imageUpload" className="file-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Chọn ảnh</span>
            </label>
            {form.thumbnailURL && (
              <div className="image-preview">
                <img src={form.thumbnailURL} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={() => {
                    onChange("thumbnailURL", "");
                    onChange("thumbnailFile", null);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => onChange("isPublished", e.target.checked)}
            />
            <span>Xuất bản ngay</span>
          </label>
        </div>

        {message && <div className="form-message">{message}</div>}

        <div className="form-actions">
          <button 
            type="submit" 
            className={`btn-primary ${hasLimitErrors ? "btn-disabled" : ""}`} 
            disabled={saving || hasLimitErrors}
          >
            {saving ? "Đang lưu..." : submitLabel}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setMessage("");
              }}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <div className="blog-list">
        <h3>Danh sách blog</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Tên danh mục</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Ngày xuất bản</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">Đang tải...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">Chưa có blog</td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b.BlogID}>
                    <td>{b.BlogID}</td>
                    <td>
                      {b.ThumbnailURL ? (
                        <img src={b.ThumbnailURL} alt={b.Title} className="table-thumbnail" />
                      ) : (
                        <div className="no-image">Không ảnh</div>
                      )}
                    </td>
                    <td>
                      <div className="blog-title">{b.Title}</div>
                      <div className="blog-slug">{b.Slug}</div>
                    </td>
                    <td>{b.CategoryName || "-"}</td>
                    <td>{b.ViewCount || 0}</td>
                    <td>
                      <span className={`status-badge ${b.IsPublished ? 'published' : 'draft'}`}>
                        {b.IsPublished ? "Đã xuất bản" : "Nháp"}
                      </span>
                    </td>
                    <td>{formatDate(b.PublishedDate)}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => onEdit(b)} className="btn-edit" title="Sửa">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button onClick={() => onDelete(b.BlogID)} className="btn-delete" title="Xóa">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}