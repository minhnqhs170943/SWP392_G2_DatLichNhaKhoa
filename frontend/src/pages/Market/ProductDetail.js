// ProductDetail.js
import { ShoppingCart, ArrowLeft, Shield, Truck, RotateCcw, Package } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addCartItem } from "../../services/cartApi";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { fetchProductById } from "../../services/productApi";
import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   Styles + Keyframes
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes pd2-fadeInLeft {
  from { opacity: 0; transform: translateX(-28px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pd2-fadeInRight {
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pd2-fadeInUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pd2-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes pd2-scaleIn {
  from { opacity: 0; transform: scale(.94); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pd2-spin {
  to { transform: rotate(360deg); }
}
@keyframes pd2-shimmer {
  0%   { background-position: -700px 0; }
  100% { background-position: 700px 0; }
}
@keyframes pd2-badgeSlide {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pd2-imgFloat {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes pd2-priceReveal {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Page ── */
.pd2-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #f2f5fb;
  padding: 86px 36px 56px;
}
.pd2-container { max-width: 1080px; margin: 0 auto; }

/* ── Back button ── */
.pd2-back {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: #64748b;
  background: #fff; border: 1.5px solid #e1e7f0; border-radius: 50px;
  padding: 7px 18px; cursor: pointer; margin-bottom: 28px;
  font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
  animation: pd2-fadeIn .4s ease both;
}
.pd2-back:hover { border-color: #3b82f6; color: #3b82f6; transform: translateX(-3px); }

/* ── Main row ── */
.pd2-main { display: grid; grid-template-columns: 1fr 1.15fr; gap: 24px; margin-bottom: 24px; align-items: start; }
@media (max-width: 768px) {
  .pd2-main { grid-template-columns: 1fr; }
  .pd2-page { padding: 80px 16px 48px; }
}

/* ── Image panel ── */
.pd2-img-card {
  background: #fff; border-radius: 22px; border: 1px solid #e8edf5;
  display: flex; align-items: center; justify-content: center;
  min-height: 340px; overflow: hidden; position: relative;
  animation: pd2-fadeInLeft .55s ease both;
}
.pd2-img-card img {
  width: 100%; height: 100%; object-fit: contain;
  padding: 28px; max-height: 360px;
  transition: transform .4s ease;
}
.pd2-img-card:hover img { transform: scale(1.05); }
.pd2-img-badge {
  position: absolute; top: 16px; left: 16px;
  background: #eff6ff; color: #2563eb; border-radius: 50px;
  font-size: 11.5px; font-weight: 700; padding: 4px 12px;
  animation: pd2-badgeSlide .5s .3s ease both; opacity: 0;
  animation-fill-mode: forwards;
}
.pd2-img-placeholder { color: #cbd5e1; }

/* ── Info panel ── */
.pd2-info-card {
  background: #fff; border-radius: 22px; border: 1px solid #e8edf5;
  padding: 32px;
  animation: pd2-fadeInRight .55s ease both;
  display: flex; flex-direction: column;
}

.pd2-brand {
  font-size: 12px; font-weight: 700; color: #3b82f6;
  text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px;
  animation: pd2-fadeInUp .4s .1s ease both;
}
.pd2-name {
  font-size: 22px; font-weight: 800; color: #0f172a;
  line-height: 1.3; margin: 0 0 14px;
  letter-spacing: -.3px;
  animation: pd2-fadeInUp .4s .15s ease both;
}
.pd2-desc {
  font-size: 14px; color: #64748b; line-height: 1.7; margin: 0 0 20px;
  animation: pd2-fadeInUp .4s .2s ease both;
}
.pd2-price {
  font-size: 28px; font-weight: 800; color: #3b82f6; margin-bottom: 24px;
  animation: pd2-priceReveal .45s .25s ease both; opacity: 0;
  animation-fill-mode: forwards;
}

/* ── Action buttons ── */
.pd2-actions { display: flex; gap: 10px; margin-bottom: 24px; animation: pd2-fadeInUp .4s .3s ease both; }

.pd2-btn-cart {
  width: 52px; height: 48px; flex-shrink: 0;
  border: 2px solid #3b82f6; border-radius: 14px;
  background: #fff; color: #3b82f6; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.pd2-btn-cart:hover {
  background: #3b82f6; color: #fff;
  box-shadow: 0 5px 16px rgba(59,130,246,.3);
  transform: translateY(-2px);
}
.pd2-btn-cart:active { transform: scale(.95); }

.pd2-btn-buy {
  flex: 1; height: 48px; background: #3b82f6;
  border: none; border-radius: 14px; color: #fff;
  font-size: 15px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.pd2-btn-buy:hover {
  background: #2563eb;
  box-shadow: 0 6px 18px rgba(59,130,246,.38);
  transform: translateY(-2px);
}
.pd2-btn-buy:active { transform: scale(.97); }

/* ── Trust badges ── */
.pd2-badges { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; animation: pd2-fadeInUp .4s .35s ease both; }
.pd2-badge {
  display: flex; align-items: center; gap: 8px;
  background: #f0f7ff; border-radius: 12px; padding: 10px 12px;
  font-size: 12.5px; color: #2563eb; font-weight: 600;
  transition: transform .2s, background .2s;
}
.pd2-badge:hover { background: #dbeafe; transform: translateY(-2px); }
.pd2-badge svg { flex-shrink: 0; }

/* ── Detail sections ── */
.pd2-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 640px) { .pd2-details { grid-template-columns: 1fr; } }

.pd2-detail-card {
  background: #fff; border-radius: 18px; border: 1px solid #e8edf5; padding: 24px;
  transition: box-shadow .22s, transform .22s;
}
.pd2-detail-card:hover {
  box-shadow: 0 10px 30px rgba(59,130,246,.09);
  transform: translateY(-3px);
}
.pd2-detail-title {
  font-size: 13px; font-weight: 700; color: #0f172a;
  text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px;
  padding-bottom: 10px; border-bottom: 1.5px solid #f0f4fb;
}
.pd2-detail-text { font-size: 14px; color: #64748b; line-height: 1.7; margin: 0; }

/* ── Loading / error / not found ── */
.pd2-center {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif; background: #f2f5fb;
}
.pd2-spinner {
  width: 40px; height: 40px; border: 3.5px solid #e1e7f0;
  border-top-color: #3b82f6; border-radius: 50%;
  animation: pd2-spin .8s linear infinite; margin: 0 auto 16px;
}
.pd2-notfound {
  text-align: center; padding: 40px;
  background: #fff; border-radius: 20px; border: 1px solid #e8edf5;
  animation: pd2-scaleIn .4s ease both;
}
.pd2-notfound h4 { font-weight: 800; font-size: 18px; color: #0f172a; margin-bottom: 6px; }
.pd2-notfound p  { font-size: 14px; color: #94a3b8; margin-bottom: 20px; }
.pd2-error-msg {
  background: #fff0f0; color: #b91c1c; border-left: 3px solid #ef4444;
  padding: 12px 18px; border-radius: 12px; font-size: 14px; margin-bottom: 20px;
  animation: pd2-fadeIn .3s ease;
}

/* ── Skeleton shimmer ── */
.pd2-skeleton {
  background: linear-gradient(90deg,#f0f3f9 25%,#e4e9f3 50%,#f0f3f9 75%);
  background-size: 700px 100%;
  animation: pd2-shimmer 1.4s infinite linear;
  border-radius: 10px;
}
`;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatPrice(value) {
  const n = Number(String(value).replace(/[^\d.-]/g, "")) || 0;
  return n.toLocaleString("vi-VN") + " ₫";
}

function SkeletonDetail() {
  const sk = (w, h, r = 10) => (
    <div className="pd2-skeleton" style={{ width: w, height: h, borderRadius: r, marginBottom: 10 }} />
  );
  return (
    <div className="pd2-container">
      <div style={{ width: 120, height: 36, marginBottom: 28 }} className="pd2-skeleton" />
      <div className="pd2-main">
        <div className="pd2-img-card" style={{ minHeight: 340 }}>
          <div className="pd2-skeleton" style={{ width: "70%", height: 220, borderRadius: 16 }} />
        </div>
        <div className="pd2-info-card">
          {sk("40%", 14)}{sk("75%", 26, 8)}{sk("100%", 14)}{sk("90%", 14)}{sk("60%", 14)}
          <div style={{ marginTop: 12 }}>{sk("35%", 32, 8)}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <div className="pd2-skeleton" style={{ width: 52, height: 48, borderRadius: 14 }} />
            <div className="pd2-skeleton" style={{ flex: 1, height: 48, borderRadius: 14 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 20 }}>
            {[0,1,2].map(i => <div key={i} className="pd2-skeleton" style={{ height: 44, borderRadius: 12 }} />)}
          </div>
        </div>
      </div>
      <div className="pd2-details">
        {[0,1].map(i => (
          <div key={i} className="pd2-detail-card">
            {sk("50%", 14)}{sk("100%", 13)}{sk("85%", 13)}{sk("70%", 13)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const row = await fetchProductById(id);
        setProduct({
          id: row.ProductID,
          img: row.ImageURL,
          name: row.ProductName,
          brand: row.Brand || "Nhãn hiệu",
          desc: row.Description || "Đang cập nhật thông tin sản phẩm.",
          price: row.Price,
   
        });
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async (p) => {
    try {
      await addCartItem(p.id, 1);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      alert(e.message);
      if (e.message.includes("đăng nhập")) navigate("/login");
    }
  };

  const handleBuyNow = async (p) => {
    try {
      await addCartItem(p.id, 1);
      window.dispatchEvent(new Event("cart:updated"));
      navigate("/cart");
    } catch (e) {
      alert(e.message);
      if (e.message.includes("đăng nhập")) navigate("/login");
    }
  };

  const badges = [
    { icon: <Shield size={15} />, text: "Hàng chính hãng" },
    { icon: <Truck size={15} />, text: "Giao toàn quốc" },
    { icon: <RotateCcw size={15} />, text: "Đổi trả 7 ngày" },
  ];

  const details = [
    { title: "Mô tả chi tiết", content: product?.desc },
    { title: "Nhãn hiệu", content: product?.brand },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <Navbar />

      <div className="pd2-page">

        {/* Loading skeleton */}
        {loading && <SkeletonDetail />}

        {/* Error */}
        {!loading && !!error && (
          <div className="pd2-container">
            <div className="pd2-error-msg">{error}</div>
            <button className="pd2-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Quay lại
            </button>
          </div>
        )}

        {/* Not found */}
        {!loading && !error && !product && (
          <div className="pd2-center">
            <div className="pd2-notfound">
              <Package size={52} color="#cbd5e1" style={{ marginBottom: 14 }} />
              <h4>Không tìm thấy sản phẩm</h4>
              <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
              <button className="pd2-btn-buy" style={{ width: "auto", padding: "0 28px" }} onClick={() => navigate(-1)}>
                Quay lại
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        {!loading && !error && product && (
          <div className="pd2-container">

            {/* Back */}
            <button className="pd2-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Quay lại
            </button>

            {/* Top row: image + info */}
            <div className="pd2-main">

              {/* Image */}
              <div className="pd2-img-card">
                <span className="pd2-img-badge">{product.brand}</span>
                {product.img ? (
                  <img src={product.img} alt={product.name} />
                ) : (
                  <Package size={80} className="pd2-img-placeholder" />
                )}
              </div>

              {/* Info */}
              <div className="pd2-info-card">
                <div className="pd2-brand">{product.brand}</div>
                <h2 className="pd2-name">{product.name}</h2>
                <p className="pd2-desc">{product.desc}</p>
                <div className="pd2-price">{formatPrice(product.price)}</div>

                <div className="pd2-actions">
                  <button className="pd2-btn-cart" title="Thêm vào giỏ hàng" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart size={19} />
                  </button>
                  <button className="pd2-btn-buy" onClick={() => handleBuyNow(product)}>
                    Mua ngay
                  </button>
                </div>

                <div className="pd2-badges">
                  {badges.map((b, i) => (
                    <div
                      className="pd2-badge"
                      key={i}
                      style={{ animationDelay: `${0.38 + i * 0.07}s` }}
                    >
                      {b.icon} {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail cards */}
            <div className="pd2-details">
              {details.map((s, i) => (
                <div
                  className="pd2-detail-card"
                  key={i}
                  style={{ animation: `pd2-fadeInUp .45s ${0.45 + i * 0.1}s ease both`, opacity: 0, animationFillMode: "forwards" }}
                >
                  <div className="pd2-detail-title">{s.title}</div>
                  <p className="pd2-detail-text">{s.content}</p>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
