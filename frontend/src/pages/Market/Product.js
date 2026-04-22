// Product.js
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Package, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { addCartItem } from "../../services/cartApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchProducts } from "../../services/productApi";

/* ─────────────────────────────────────────────
   Keyframes + component styles (no extra file)
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes pd-fadeInDown {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pd-fadeInUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pd-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes pd-cardIn {
  from { opacity: 0; transform: translateY(28px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pd-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: .45; }
}
@keyframes pd-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@keyframes pd-spin {
  to { transform: rotate(360deg); }
}

/* ── Page shell ── */
.pd-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  padding: 96px 40px 56px;
  background: #f2f5fb;
}
.pd-container { max-width: 1440px; margin: 0 auto; }

/* ── Header ── */
.pd-header { animation: pd-fadeInDown .5s ease both; margin-bottom: 4px; }
.pd-title {
  font-size: clamp(26px, 3vw, 40px);
  font-weight: 800; color: #0f172a;
  letter-spacing: -.6px; margin: 0 0 6px;
}
.pd-subtitle { font-size: 15px; color: #64748b; margin: 0 0 24px; }

/* ── Search & filter bar ── */
.pd-bar {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  margin-bottom: 28px;
  animation: pd-fadeInDown .5s .08s ease both;
}
.pd-search-wrap {
  flex: 1 1 380px; position: relative; min-width: 260px;
}
.pd-search-wrap svg {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; pointer-events: none;
}
.pd-search {
  width: 100%; height: 50px; padding: 0 18px 0 48px;
  border: 1.5px solid #e1e7f0; border-radius: 50px;
  font-size: 14.5px; color: #0f172a; background: #fff;
  outline: none; font-family: 'DM Sans', sans-serif;
  transition: border-color .2s, box-shadow .2s;
}
.pd-search::placeholder { color: #94a3b8; }
.pd-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.13); }

.pd-select {
  height: 50px; min-width: 180px; border: 1.5px solid #e1e7f0;
  border-radius: 14px; font-size: 14px; color: #334155;
  background: #fff; padding: 0 14px; outline: none;
  font-family: 'DM Sans', sans-serif; cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.pd-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.13); }

/* ── Status messages ── */
.pd-loading {
  display: flex; align-items: center; gap: 10px;
  color: #64748b; font-size: 14px; margin-bottom: 16px;
  animation: pd-pulse 1.2s infinite;
}
.pd-spinner {
  width: 18px; height: 18px; border: 2.5px solid #e1e7f0;
  border-top-color: #3b82f6; border-radius: 50%;
  animation: pd-spin .75s linear infinite; flex-shrink: 0;
}
.pd-error {
  background: #fff0f0; color: #b91c1c; border-left: 3px solid #ef4444;
  padding: 10px 16px; border-radius: 10px; font-size: 13.5px;
  margin-bottom: 16px; animation: pd-fadeIn .3s ease;
}

/* ── Product grid ── */
.pd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

/* ── Product card ── */
.pd-card {
  background: #fff; border-radius: 20px;
  border: 1px solid #e8edf5; overflow: hidden;
  display: flex; flex-direction: column;
  transition: box-shadow .25s, transform .25s, border-color .25s;
  animation: pd-cardIn .45s ease both;
}
.pd-card:hover {
  box-shadow: 0 16px 40px rgba(59,130,246,.13);
  transform: translateY(-5px);
  border-color: #bfcfee;
}

.pd-card-img {
  height: 210px; background: #f7f9fd;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative;
}
.pd-card-img img {
  width: 100%; height: 100%; object-fit: contain;
  transition: transform .35s ease;
  padding: 12px;
}
.pd-card:hover .pd-card-img img { transform: scale(1.06); }
.pd-card-img-placeholder { color: #cbd5e1; }

.pd-card-body {
  padding: 16px 18px 12px; flex: 1;
  display: flex; flex-direction: column; gap: 6px;
}
.pd-brand {
  font-size: 12px; font-weight: 600; color: #3b82f6;
  text-transform: uppercase; letter-spacing: .6px;
}
.pd-prod-name {
  font-size: 15.5px; font-weight: 700; color: #0f172a;
  line-height: 1.35; min-height: 42px;
}
.pd-prod-name a {
  text-decoration: none; color: inherit;
  transition: color .18s;
}
.pd-prod-name a:hover { color: #3b82f6; }
.pd-nsx { font-size: 12.5px; color: #64748b; flex: 1; line-height: 1.45; }
.pd-price {
  font-size: 18px; font-weight: 800; color: #3b82f6;
  margin-top: 4px;
}

.pd-card-actions {
  display: flex; gap: 10px; padding: 0 18px 18px;
}

.pd-btn-cart {
  width: 50px; height: 44px; flex-shrink: 0;
  border: 2px solid #3b82f6; border-radius: 14px;
  background: #fff; color: #3b82f6; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s ease;
}
.pd-btn-cart:hover {
  background: #3b82f6; color: #fff;
  box-shadow: 0 4px 14px rgba(59,130,246,.3);
  transform: translateY(-1px);
}
.pd-btn-cart:active { transform: scale(.95); }

.pd-btn-buy {
  flex: 1; height: 44px;
  background: #3b82f6; border: none; border-radius: 14px;
  color: #fff; font-size: 14.5px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.pd-btn-buy:hover {
  background: #2563eb;
  box-shadow: 0 5px 16px rgba(59,130,246,.38);
  transform: translateY(-1px);
}
.pd-btn-buy:active { transform: scale(.97); }

/* ── Pagination ── */
.pd-pagination {
  margin-top: 32px; display: flex; align-items: center;
  justify-content: center; gap: 6px; flex-wrap: wrap;
  animation: pd-fadeIn .4s ease both;
}
.pd-page-btn {
  min-width: 40px; height: 40px; border-radius: 12px;
  border: 1.5px solid #e1e7f0; background: #fff; color: #334155;
  font-size: 14px; font-weight: 600; cursor: pointer; padding: 0 10px;
  font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: all .18s ease;
}
.pd-page-btn:hover:not(:disabled) {
  border-color: #3b82f6; color: #3b82f6;
  transform: translateY(-1px);
}
.pd-page-btn.active {
  background: #3b82f6; color: #fff; border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59,130,246,.28);
}
.pd-page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Empty state ── */
.pd-empty {
  grid-column: 1/-1; text-align: center; padding: 56px 0;
  color: #94a3b8; animation: pd-fadeIn .35s ease;
}
.pd-empty svg { margin-bottom: 14px; opacity: .4; }
.pd-empty p { font-size: 15px; margin: 0; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .pd-page { padding: 80px 16px 48px; }
  .pd-select { min-width: 140px; }
}
`;

/* ─────────────────────────────────────────────
   Skeleton card shown while loading
───────────────────────────────────────────── */
const skeletonStyle = {
  background: "linear-gradient(90deg,#f0f2f8 25%,#e4e8f2 50%,#f0f2f8 75%)",
  backgroundSize: "600px 100%",
  animation: "pd-shimmer 1.4s infinite linear",
  borderRadius: 8,
};

function SkeletonCard() {
  return (
    <div className="pd-card" style={{ pointerEvents: "none" }}>
      <div style={{ height: 210, background: "#f0f2f8" }} />
      <div className="pd-card-body">
        <div style={{ ...skeletonStyle, height: 12, width: "40%" }} />
        <div style={{ ...skeletonStyle, height: 16, width: "80%", marginTop: 4 }} />
        <div style={{ ...skeletonStyle, height: 16, width: "60%" }} />
        <div style={{ ...skeletonStyle, height: 13, width: "55%", marginTop: 4 }} />
        <div style={{ ...skeletonStyle, height: 20, width: "35%", marginTop: 6 }} />
      </div>
      <div className="pd-card-actions">
        <div style={{ ...skeletonStyle, width: 50, height: 44, borderRadius: 14 }} />
        <div style={{ ...skeletonStyle, flex: 1, height: 44, borderRadius: 14 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function Product() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceOrder, setPriceOrder] = useState("none");
  const [nameOrder, setNameOrder] = useState("none");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rows = await fetchProducts();
        setProducts(
          rows.map((p) => {
            const priceNumber = Number(p.Price) || 0;
            return {
              id: p.ProductID,
              name: p.ProductName,
              brand: p.Brand || "Không xác định",
              desc: p.Description || "Đang cập nhật thông tin sản phẩm.",
              price: priceNumber.toLocaleString("vi-VN") + " ₫",
              priceNumber,
              image: p.ImageURL,
            };
          })
        );
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addCartItem(product.id, 1);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      alert(e.message);
      if (e.message.includes("đăng nhập")) navigate("/login");
    }
  };

  const handleBuyNow = async (product) => {
    try {
      await addCartItem(product.id, 1);
      window.dispatchEvent(new Event("cart:updated"));
      navigate("/cart");
    } catch (e) {
      alert(e.message);
      if (e.message.includes("đăng nhập")) navigate("/login");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const displayedProducts = [...filtered].sort((a, b) => {
    if (priceOrder === "asc" && a.priceNumber !== b.priceNumber) return a.priceNumber - b.priceNumber;
    if (priceOrder === "desc" && a.priceNumber !== b.priceNumber) return b.priceNumber - a.priceNumber;
    if (nameOrder === "az") return a.name.localeCompare(b.name, "vi");
    if (nameOrder === "za") return b.name.localeCompare(a.name, "vi");
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = displayedProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setPage(1); }, [search, priceOrder, nameOrder]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const scrollTop = () => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const changePage = (p) => { setPage(p); scrollTop(); };

  /* Pagination: show at most 5 page buttons */
  const pageButtons = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  })();

  return (
    <>
      <style>{STYLES}</style>
      <Navbar />

      <div className="pd-page">
        <div className="pd-container">

          {/* Header */}
          <div className="pd-header">
            <h1 className="pd-title">Thuốc nha khoa</h1>
            <p className="pd-subtitle">Các loại thuốc và dược phẩm chuyên dụng cho nha khoa</p>
          </div>

          {/* Search + filter */}
          <div className="pd-bar">
            <div className="pd-search-wrap">
              <Search size={18} />
              <input
                className="pd-search"
                type="text"
                placeholder="Tìm kiếm theo tên hoặc thương hiệu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="pd-select"
              value={priceOrder}
              onChange={(e) => setPriceOrder(e.target.value)}
            >
              <option value="none">Giá (mặc định)</option>
              <option value="asc">Giá thấp đến cao</option>
              <option value="desc">Giá cao đến thấp</option>
            </select>
            <select
              className="pd-select"
              value={nameOrder}
              onChange={(e) => setNameOrder(e.target.value)}
            >
              <option value="none">Tên (mặc định)</option>
              <option value="az">Tên A → Z</option>
              <option value="za">Tên Z → A</option>
            </select>
          </div>

          {/* Status */}
          {loading && (
            <div className="pd-loading">
              <div className="pd-spinner" />
              Đang tải sản phẩm...
            </div>
          )}
          {!!error && <div className="pd-error">{error}</div>}

          {/* Grid */}
          <div className="pd-grid" ref={gridRef}>
            {loading &&
              Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonCard key={i} />)
            }

            {!loading && paginatedProducts.length === 0 && (
              <div className="pd-empty">
                <Package size={52} />
                <p>Không tìm thấy sản phẩm nào phù hợp.</p>
              </div>
            )}

            {!loading &&
              paginatedProducts.map((p, idx) => (
                <div
                  className="pd-card"
                  key={p.id}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="pd-card-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} />
                    ) : (
                      <Package size={56} className="pd-card-img-placeholder" />
                    )}
                  </div>
                  <div className="pd-card-body">
                    <div className="pd-brand">{p.brand}</div>
                    <div className="pd-prod-name">
                      <Link to={`/product-detail/${p.id}`}>{p.name}</Link>
                    </div>
                    <div className="pd-price">{p.price}</div>
                  </div>
                  <div className="pd-card-actions">
                    <button className="pd-btn-cart" title="Thêm vào giỏ" onClick={() => handleAddToCart(p)}>
                      <ShoppingCart size={19} />
                    </button>
                    <button className="pd-btn-buy" onClick={() => handleBuyNow(p)}>
                      Mua Ngay
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Pagination */}
          {!loading && displayedProducts.length > itemsPerPage && (
            <div className="pd-pagination">
              <button
                className="pd-page-btn"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                <ChevronLeft size={16} /> Trước
              </button>

              {pageButtons.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} style={{ padding: "0 4px", color: "#94a3b8", alignSelf: "center" }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`pd-page-btn${p === page ? " active" : ""}`}
                    onClick={() => changePage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="pd-page-btn"
                disabled={page === totalPages}
                onClick={() => changePage(page + 1)}
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}