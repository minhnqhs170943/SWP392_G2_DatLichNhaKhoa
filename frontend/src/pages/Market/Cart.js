// Cart.js
import { useEffect, useState } from "react";
import { fetchCart, updateCartItem, removeCartItem, clearCartItems } from "../../services/cartApi";
import { Trash2, ShieldCheck, RotateCcw, Truck, ShoppingBag, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* ─────────────────────────────────────────────
   Styles + Keyframes
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes ct-fadeInDown {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ct-fadeInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ct-fadeInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ct-fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ct-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ct-slideIn {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ct-slideOut {
  from { opacity: 1; transform: translateX(0) scaleY(1); max-height: 120px; }
  to   { opacity: 0; transform: translateX(12px) scaleY(0.8); max-height: 0; }
}
@keyframes ct-scaleIn {
  from { opacity: 0; transform: scale(.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ct-bounce {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes ct-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@keyframes ct-totalReveal {
  from { opacity: 0; transform: scale(.9); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Page ── */
.ct-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #f2f5fb;
  padding: 92px 24px 60px;
}
.ct-container { max-width: 1180px; margin: 0 auto; }

/* ── Header ── */
.ct-header { animation: ct-fadeInDown .45s ease both; margin-bottom: 28px; }
.ct-title   { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -.4px; margin: 0 0 4px; }
.ct-sub     { font-size: 14px; color: #64748b; margin: 0; }

/* ── Layout ── */
.ct-layout { display: grid; grid-template-columns: 1fr 360px; gap: 22px; align-items: start; }
@media (max-width: 900px) { .ct-layout { grid-template-columns: 1fr; } }

/* ── Left panel ── */
.ct-left { animation: ct-fadeInLeft .5s ease both; }

/* ── Items card ── */
.ct-items-card {
  background: #fff; border-radius: 20px; border: 1px solid #e8edf5;
  overflow: hidden; margin-bottom: 14px;
}
.ct-items-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f4fb;
  display: flex; align-items: center; justify-content: space-between;
}
.ct-items-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }

/* ── Cart item row ── */
.ct-item {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid #f5f7fb;
  animation: ct-slideIn .38s ease both;
  transition: background .18s;
}
.ct-item:last-child { border-bottom: none; }
.ct-item:hover { background: #fafbff; }

.ct-item-img {
  width: 64px; height: 64px; flex-shrink: 0;
  background: linear-gradient(135deg,#eef2ff,#f0f7ff);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #e8edf5;
}
.ct-item-img svg { color: #c7d0e8; }

.ct-item-info { flex: 1; min-width: 0; }
.ct-item-name  { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct-item-brand { font-size: 12px; color: #94a3b8; margin: 0 0 4px; }
.ct-item-price { font-size: 13.5px; font-weight: 700; color: #3b82f6; margin: 0; }

/* ── Qty controls ── */
.ct-qty {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.ct-qty-btn {
  width: 30px; height: 30px; border: 1.5px solid #e1e7f0;
  border-radius: 8px; background: #fff; color: #334155;
  font-size: 16px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  transition: all .18s ease;
}
.ct-qty-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.ct-qty-btn:active { transform: scale(.9); }
.ct-qty-num { min-width: 24px; text-align: center; font-size: 14px; font-weight: 700; color: #0f172a; }

/* ── Item subtotal ── */
.ct-item-total {
  min-width: 90px; text-align: right; font-size: 14px;
  font-weight: 700; color: #0f172a; flex-shrink: 0;
}

/* ── Delete button ── */
.ct-del-btn {
  width: 34px; height: 34px; border: none; background: none;
  color: #cbd5e1; cursor: pointer; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: all .18s ease; flex-shrink: 0;
}
.ct-del-btn:hover { color: #ef4444; background: #fff0f0; }

/* ── Clear all ── */
.ct-clear-wrap { text-align: center; margin-top: 10px; }
.ct-clear-btn {
  background: none; border: none; color: #ef4444; font-size: 13px;
  font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
  padding: 6px 14px; border-radius: 8px; transition: background .18s;
}
.ct-clear-btn:hover { background: #fff0f0; }

/* ── Empty state ── */
.ct-empty {
  background: #fff; border-radius: 20px; border: 1px solid #e8edf5;
  text-align: center; padding: 56px 24px;
  animation: ct-scaleIn .4s ease both;
}
.ct-empty-icon { animation: ct-bounce 2s ease infinite; margin-bottom: 16px; color: #cbd5e1; }
.ct-empty h5  { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
.ct-empty p   { font-size: 14px; color: #94a3b8; margin: 0 0 22px; }
.ct-empty-btn {
  display: inline-block; background: #3b82f6; color: #fff;
  border: none; border-radius: 50px; padding: 11px 28px;
  font-size: 14.5px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.ct-empty-btn:hover { background: #2563eb; box-shadow: 0 5px 16px rgba(59,130,246,.35); transform: translateY(-1px); }

/* ── Right panel (summary) ── */
.ct-right { animation: ct-fadeInRight .5s ease both; }

.ct-summary-card {
  background: #fff; border-radius: 20px; border: 1px solid #e8edf5;
  padding: 24px; position: sticky; top: 100px;
}
.ct-summary-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 20px; }

.ct-summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13.5px; margin-bottom: 10px;
}
.ct-summary-label { color: #64748b; }
.ct-summary-val   { font-weight: 600; color: #0f172a; }
.ct-summary-val.discount { color: #ef4444; }

.ct-divider { border: none; border-top: 1px solid #f0f4fb; margin: 16px 0; }

.ct-total-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.ct-total-label { font-size: 15px; font-weight: 700; color: #0f172a; }
.ct-total-amount {
  font-size: 22px; font-weight: 800; color: #3b82f6;
  animation: ct-totalReveal .5s ease both;
}

.ct-checkout-btn {
  width: 100%; height: 48px; background: #3b82f6; border: none;
  border-radius: 14px; color: #fff; font-size: 15px; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 10px;
  transition: all .2s ease;
}
.ct-checkout-btn:hover:not(:disabled) {
  background: #2563eb; box-shadow: 0 6px 18px rgba(59,130,246,.38);
  transform: translateY(-1px);
}
.ct-checkout-btn:active:not(:disabled) { transform: scale(.97); }
.ct-checkout-btn:disabled { opacity: .5; cursor: not-allowed; }

.ct-continue-btn {
  width: 100%; height: 44px; background: #fff; border: 1.5px solid #e1e7f0;
  border-radius: 14px; color: #334155; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.ct-continue-btn:hover { border-color: #3b82f6; color: #3b82f6; }

/* ── Trust badges ── */
.ct-trust { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.ct-trust-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: #64748b;
}
.ct-trust-icon {
  width: 32px; height: 32px; border-radius: 10px; background: #f0faf5;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ── Skeleton ── */
.ct-skeleton {
  background: linear-gradient(90deg,#f0f3f9 25%,#e4e9f3 50%,#f0f3f9 75%);
  background-size: 600px 100%;
  animation: ct-shimmer 1.4s infinite linear;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .ct-page { padding: 82px 14px 48px; }
  .ct-item  { flex-wrap: wrap; }
  .ct-item-total { flex: 0 0 auto; }
}
`;

/* ─────────────────────────────────────────────
   Helper
───────────────────────────────────────────── */
function formatPrice(n) {
  return (Number(n) || 0).toLocaleString("vi-VN") + " ₫";
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const mapCartRows = (rows) =>
    (rows || []).map((x) => ({
      id: x.ProductID,
      name: x.ProductName,
      brand: x.Brand,
      price: Number(x.Price) || 0,
      qty: x.Quantity,
    }));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rows = await fetchCart();
        setCart(mapCartRows(rows));
      } catch (e) {
        alert(e.message);
        if (e.message.includes("đăng nhập")) navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const updateQty = async (id, delta) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    try {
      const rows = await updateCartItem(id, item.qty + delta);
      setCart(mapCartRows(rows));
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) { alert(e.message); }
  };

  const removeItem = async (id) => {
    setRemovingId(id);
    setTimeout(async () => {
      try {
        const rows = await removeCartItem(id);
        setCart(mapCartRows(rows));
        window.dispatchEvent(new Event("cart:updated"));
      } catch (e) { alert(e.message); }
      setRemovingId(null);
    }, 280);
  };

  const handleClearCart = async () => {
    try {
      await clearCartItems();
      setCart([]);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) { alert(e.message); }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const trust = [
    { icon: <Truck size={16} color="#16a34a" />, text: "Miễn phí vận chuyển" },
    { icon: <ShieldCheck size={16} color="#16a34a" />, text: "Thanh toán an toàn & bảo mật" },
    { icon: <RotateCcw size={16} color="#16a34a" />, text: "Đổi trả trong 7 ngày" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <Navbar />

      <div className="ct-page">
        <div className="ct-container">

          {/* Header */}
          <div className="ct-header">
            <h2 className="ct-title">Giỏ hàng của bạn</h2>
            <p className="ct-sub">
              {loading ? "Đang tải..." : `Bạn có ${cart.length} sản phẩm trong giỏ hàng`}
            </p>
          </div>

          <div className="ct-layout">

            {/* ── LEFT ── */}
            <div className="ct-left">
              {loading ? (
                /* Skeleton */
                <div className="ct-items-card">
                  <div className="ct-items-header">
                    <div className="ct-skeleton" style={{ height: 16, width: 140 }} />
                  </div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div className="ct-item" key={i} style={{ gap: 14 }}>
                      <div className="ct-skeleton" style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="ct-skeleton" style={{ height: 14, width: "70%", marginBottom: 6 }} />
                        <div className="ct-skeleton" style={{ height: 12, width: "45%", marginBottom: 6 }} />
                        <div className="ct-skeleton" style={{ height: 13, width: "30%" }} />
                      </div>
                      <div className="ct-skeleton" style={{ width: 90, height: 30, borderRadius: 8 }} />
                      <div className="ct-skeleton" style={{ width: 80, height: 14, borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              ) : cart.length === 0 ? (
                /* Empty */
                <div className="ct-empty">
                  <div className="ct-empty-icon"><ShoppingBag size={58} /></div>
                  <h5>Giỏ hàng trống</h5>
                  <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                  <button className="ct-empty-btn" onClick={() => navigate("/product")}>
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                /* Items */
                <>
                  <div className="ct-items-card">
                    <div className="ct-items-header">
                      <p className="ct-items-title">Sản phẩm đã chọn</p>
                    </div>
                    {cart.map((item, idx) => (
                      <div
                        className="ct-item"
                        key={item.id}
                        style={{
                          animationDelay: `${idx * 0.07}s`,
                          opacity: removingId === item.id ? 0 : 1,
                          transform: removingId === item.id ? "translateX(14px)" : "none",
                          transition: "opacity .26s, transform .26s",
                          pointerEvents: removingId === item.id ? "none" : "auto",
                        }}
                      >
                        {/* Image */}
                        <div className="ct-item-img">
                          <Package size={26} />
                        </div>

                        {/* Info */}
                        <div className="ct-item-info">
                          <p className="ct-item-name">{item.name}</p>
                          <p className="ct-item-brand">{item.brand}</p>
                          <p className="ct-item-price">{formatPrice(item.price)}</p>
                        </div>

                        {/* Delete */}
                        <button className="ct-del-btn" onClick={() => removeItem(item.id)}>
                          <Trash2 size={16} />
                        </button>

                        {/* Qty */}
                        <div className="ct-qty">
                          <button className="ct-qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                          <span className="ct-qty-num">{item.qty}</span>
                          <button className="ct-qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>

                        {/* Subtotal */}
                        <div className="ct-item-total">{formatPrice(item.price * item.qty)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="ct-clear-wrap">
                    <button className="ct-clear-btn" onClick={handleClearCart}>
                      Xóa toàn bộ giỏ hàng
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ── RIGHT (summary) ── */}
            <div className="ct-right">
              <div className="ct-summary-card">
                <p className="ct-summary-title">Tổng đơn hàng</p>

                <div className="ct-summary-row">
                  <span className="ct-summary-label">Tạm tính</span>
                  <span className="ct-summary-val">{formatPrice(subtotal)}</span>
                </div>
                <div className="ct-summary-row">
                  <span className="ct-summary-label">Phí vận chuyển</span>
                  <span className="ct-summary-val">{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                </div>
                <div className="ct-summary-row">
                  <span className="ct-summary-label">Giảm giá</span>
                  <span className="ct-summary-val discount">−{formatPrice(discount)}</span>
                </div>

                <hr className="ct-divider" />

                <div className="ct-total-row">
                  <span className="ct-total-label">Tổng cộng</span>
                  <span className="ct-total-amount">{formatPrice(total)}</span>
                </div>

                <button
                  className="ct-checkout-btn"
                  disabled={cart.length === 0 || loading}
                  onClick={() => navigate("/checkout")}
                >
                  Tiến hành thanh toán
                </button>
                <button className="ct-continue-btn" onClick={() => navigate("/product")}>
                  Tiếp tục mua sắm
                </button>

                <hr className="ct-divider" />

                <div className="ct-trust">
                  {trust.map((t, i) => (
                    <div
                      className="ct-trust-item"
                      key={i}
                      style={{ animation: `ct-fadeInUp .4s ${0.3 + i * 0.08}s ease both`, opacity: 0, animationFillMode: "forwards" }}
                    >
                      <div className="ct-trust-icon">{t.icon}</div>
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}