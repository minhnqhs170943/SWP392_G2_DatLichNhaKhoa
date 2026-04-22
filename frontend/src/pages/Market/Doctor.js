// Doctor.js
import { useState, useEffect, useRef } from "react";
import { UserRound, Search, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchDoctors, fetchAllServices } from "../../services/doctorApi";

/* ─────────────────────────────────────────────
   Styles + Keyframes
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes dr-fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dr-fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dr-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes dr-cardIn {
  from { opacity: 0; transform: translateY(26px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dr-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: .45; }
}
@keyframes dr-spin {
  to { transform: rotate(360deg); }
}
@keyframes dr-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@keyframes dr-slideTrack {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── Page ── */
.dr-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #f2f5fb;
  padding: 92px 40px 60px;
}
.dr-container { max-width: 1380px; margin: 0 auto; }

/* ── Header ── */
.dr-header { animation: dr-fadeInDown .5s ease both; margin-bottom: 20px; }
.dr-title   { font-size: clamp(26px,3vw,40px); font-weight: 800; color: #0f172a; letter-spacing: -.5px; margin: 0 0 5px; }
.dr-sub     { font-size: 15px; color: #64748b; margin: 0; }

/* ── Search ── */
.dr-search-wrap {
  position: relative; max-width: 580px; margin-bottom: 28px;
  animation: dr-fadeInDown .5s .08s ease both;
}
.dr-search-wrap svg {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; pointer-events: none;
}
.dr-search {
  width: 100%; height: 52px; padding: 0 18px 0 50px;
  border: 1.5px solid #e1e7f0; border-radius: 50px;
  font-size: 14.5px; color: #0f172a; background: #fff;
  outline: none; font-family: 'DM Sans', sans-serif;
  transition: border-color .2s, box-shadow .2s;
}
.dr-search::placeholder { color: #94a3b8; }
.dr-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.13); }

/* ── Section title ── */
.dr-section-title {
  font-size: 22px; font-weight: 800; color: #0f172a;
  letter-spacing: -.3px; margin: 36px 0 18px;
  animation: dr-fadeInUp .45s ease both;
}

/* ── Status ── */
.dr-loading {
  display: flex; align-items: center; gap: 10px;
  color: #64748b; font-size: 14px; margin-bottom: 16px;
  animation: dr-pulse 1.2s infinite;
}
.dr-spinner {
  width: 18px; height: 18px; border: 2.5px solid #e1e7f0;
  border-top-color: #3b82f6; border-radius: 50%;
  animation: dr-spin .75s linear infinite;
}
.dr-error {
  background: #fff0f0; color: #b91c1c; border-left: 3px solid #ef4444;
  padding: 10px 16px; border-radius: 10px; font-size: 13.5px;
  margin-bottom: 16px;
}

/* ── Doctor grid ── */
.dr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px,1fr));
  gap: 20px;
}

/* ── Doctor card ── */
.dr-card {
  background: #fff; border-radius: 20px; border: 1px solid #e8edf5;
  overflow: hidden; display: flex; flex-direction: column;
  transition: box-shadow .25s, transform .25s, border-color .25s;
  animation: dr-cardIn .45s ease both;
}
.dr-card:hover {
  box-shadow: 0 14px 38px rgba(59,130,246,.12);
  transform: translateY(-5px);
  border-color: #bfcfee;
}
.dr-card-img {
  height: 300px; overflow: hidden; position: relative;
  background: linear-gradient(135deg,#eef2ff,#f0f7ff);
  display: flex; align-items: center; justify-content: center;
}
.dr-card-img img {
  width: 100%; height: 100%; object-fit: cover; object-position: center 20%;
  transition: transform .38s ease;
}
.dr-card:hover .dr-card-img img { transform: scale(1.06); }
.dr-card-img-ph { color: #cbd5e1; }

.dr-card-body { padding: 18px 20px 12px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.dr-card-name   { font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.dr-card-name a { text-decoration: none; color: inherit; transition: color .18s; }
.dr-card-name a:hover { color: #3b82f6; }
.dr-card-spec   { font-size: 12.5px; font-weight: 600; color: #3b82f6; text-transform: uppercase; letter-spacing: .5px; }
.dr-card-exp    { font-size: 13px; color: #64748b; }
.dr-card-bio    { font-size: 13px; color: #475569; line-height: 1.55; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.dr-card-actions { padding: 0 18px 18px; display: flex; gap: 10px; }
.dr-btn-detail {
  flex: 1; height: 44px; background: #3b82f6; border: none; border-radius: 14px;
  color: #fff; font-size: 14.5px; font-weight: 700; cursor: pointer;
  text-decoration: none; display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.dr-btn-detail:hover {
  background: #2563eb; color: #fff;
  box-shadow: 0 5px 16px rgba(59,130,246,.35);
  transform: translateY(-1px);
}
.dr-btn-detail:active { transform: scale(.97); }

/* ── Pagination ── */
.dr-pagination {
  margin-top: 28px; display: flex; align-items: center;
  justify-content: center; gap: 6px; flex-wrap: wrap;
  animation: dr-fadeIn .4s ease both;
}
.dr-page-btn {
  min-width: 40px; height: 40px; border-radius: 12px;
  border: 1.5px solid #e1e7f0; background: #fff; color: #334155;
  font-size: 14px; font-weight: 600; cursor: pointer; padding: 0 10px;
  font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: all .18s ease;
}
.dr-page-btn:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; transform: translateY(-1px); }
.dr-page-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,.28); }
.dr-page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Empty state ── */
.dr-empty {
  grid-column: 1/-1; text-align: center; padding: 48px 0;
  color: #94a3b8; animation: dr-fadeIn .3s ease;
}
.dr-empty svg { margin-bottom: 12px; opacity: .4; }
.dr-empty p { font-size: 15px; margin: 0; }

/* ──────────────────────────────────────────
   SERVICE SLIDER
────────────────────────────────────────── */
.dr-slider-outer {
  position: relative;
  animation: dr-fadeInUp .5s ease both;
}

/* Arrow buttons */
.dr-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 10; width: 44px; height: 44px;
  background: #fff; border: 1.5px solid #e1e7f0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #334155;
  transition: all .2s ease; box-shadow: 0 4px 14px rgba(0,0,0,.08);
}
.dr-arrow:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; box-shadow: 0 5px 18px rgba(59,130,246,.3); }
.dr-arrow-left  { left: -22px; }
.dr-arrow-right { right: -22px; }
@media (max-width: 640px) {
  .dr-arrow-left  { left: 0; }
  .dr-arrow-right { right: 0; }
}

/* Viewport */
.dr-slider-viewport {
  overflow: hidden; border-radius: 16px;
}

/* Track */
.dr-slider-track {
  display: flex; gap: 18px;
  transition: transform .42s cubic-bezier(.4,0,.2,1);
  will-change: transform;
}

/* Service card */
.dr-svc-card {
  flex: 0 0 calc(25% - 14px);
  min-width: 0;
  background: #fff; border-radius: 20px; border: 1px solid #e8edf5;
  overflow: hidden; display: flex; flex-direction: column;
  transition: box-shadow .25s, transform .25s, border-color .25s;
}
.dr-svc-card:hover {
  box-shadow: 0 14px 36px rgba(59,130,246,.12);
  transform: translateY(-5px);
  border-color: #bfcfee;
}
@media (max-width: 1100px) { .dr-svc-card { flex: 0 0 calc(33.33% - 12px); } }
@media (max-width: 768px)  { .dr-svc-card { flex: 0 0 calc(50% - 9px); } }
@media (max-width: 520px)  { .dr-svc-card { flex: 0 0 calc(100% - 0px); } }

.dr-svc-img {
  height: 180px; overflow: hidden; position: relative;
  background: linear-gradient(135deg,#eef2ff,#f0f7ff);
  display: flex; align-items: center; justify-content: center;
}
.dr-svc-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .38s ease; }
.dr-svc-card:hover .dr-svc-img img { transform: scale(1.06); }

.dr-svc-body { padding: 16px 18px 10px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.dr-svc-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.35; }
.dr-svc-desc {
  font-size: 13px; color: #64748b; line-height: 1.55; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.dr-svc-actions { padding: 0 18px 18px; }
.dr-svc-btn {
  width: 100%; height: 42px; background: #3b82f6; border: none; border-radius: 14px;
  color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all .2s ease;
}
.dr-svc-btn:hover { background: #2563eb; box-shadow: 0 5px 16px rgba(59,130,246,.35); transform: translateY(-1px); }
.dr-svc-btn:active { transform: scale(.97); }

/* Dots */
.dr-dots { display: flex; justify-content: center; gap: 7px; margin-top: 18px; }
.dr-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #dde1f0;
  cursor: pointer; border: none; padding: 0;
  transition: all .2s ease;
}
.dr-dot.active { background: #3b82f6; width: 22px; border-radius: 4px; }

/* ── Skeleton shimmer ── */
.dr-skeleton {
  background: linear-gradient(90deg,#f0f3f9 25%,#e4e9f3 50%,#f0f3f9 75%);
  background-size: 600px 100%;
  animation: dr-shimmer 1.4s infinite linear;
  border-radius: 10px;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .dr-page { padding: 80px 14px 48px; }
}
`;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatPrice(value) {
  const n = Number(String(value).replace(/[^\d.-]/g, "")) || 0;
  return n.toLocaleString("vi-VN") + " ₫";
}
function normalizeText(v) { return String(v ?? "").toLowerCase(); }

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="dr-card" style={{ pointerEvents: "none" }}>
      <div style={{ height: 300, background: "#f0f3f9" }} />
      <div className="dr-card-body">
        <div className="dr-skeleton" style={{ height: 18, width: "70%" }} />
        <div className="dr-skeleton" style={{ height: 12, width: "40%", marginTop: 4 }} />
        <div className="dr-skeleton" style={{ height: 12, width: "55%", marginTop: 2 }} />
        <div className="dr-skeleton" style={{ height: 13, width: "90%", marginTop: 4 }} />
        <div className="dr-skeleton" style={{ height: 13, width: "80%" }} />
      </div>
      <div className="dr-card-actions">
        <div className="dr-skeleton" style={{ flex: 1, height: 44, borderRadius: 14 }} />
      </div>
    </div>
  );
}

/* ── Skeleton service card ── */
function SkeletonSvcCard() {
  return (
    <div className="dr-svc-card" style={{ pointerEvents: "none" }}>
      <div style={{ height: 180, background: "#f0f3f9" }} />
      <div className="dr-svc-body">
        <div className="dr-skeleton" style={{ height: 18, width: "75%" }} />
        <div className="dr-skeleton" style={{ height: 13, width: "100%", marginTop: 4 }} />
        <div className="dr-skeleton" style={{ height: 13, width: "85%" }} />
      </div>
      <div className="dr-svc-actions">
        <div className="dr-skeleton" style={{ height: 42, borderRadius: 14 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Service Slider component
───────────────────────────────────────────── */
function ServiceSlider({ services, loading, onBook }) {
  const [idx, setIdx] = useState(0);
  const viewportRef = useRef(null);

  // Determine cards per slide based on viewport
  const getPerSlide = () => {
    const w = viewportRef.current?.offsetWidth || window.innerWidth;
    if (w < 520) return 1;
    if (w < 768) return 2;
    if (w < 1100) return 3;
    return 4;
  };
  const [perSlide, setPerSlide] = useState(4);
  useEffect(() => {
    const update = () => setPerSlide(getPerSlide());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIdx = loading ? 0 : Math.max(0, Math.ceil(services.length / perSlide) - 1);
  const safeIdx = Math.min(idx, maxIdx);

  const go = (n) => setIdx(Math.max(0, Math.min(maxIdx, n)));
  const offset = safeIdx * (100 / perSlide) * perSlide;

  return (
    <div className="dr-slider-outer">
      {/* Arrows */}
      <button className="dr-arrow dr-arrow-left" onClick={() => go(safeIdx - 1)} disabled={safeIdx === 0}
        style={{ opacity: safeIdx === 0 ? .35 : 1, cursor: safeIdx === 0 ? "not-allowed" : "pointer" }}>
        <ChevronLeft size={20} />
      </button>
      <button className="dr-arrow dr-arrow-right" onClick={() => go(safeIdx + 1)} disabled={safeIdx >= maxIdx}
        style={{ opacity: safeIdx >= maxIdx ? .35 : 1, cursor: safeIdx >= maxIdx ? "not-allowed" : "pointer" }}>
        <ChevronRight size={20} />
      </button>

      {/* Viewport */}
      <div className="dr-slider-viewport" ref={viewportRef}>
        <div
          className="dr-slider-track"
          style={{ transform: `translateX(calc(-${offset}% - ${safeIdx * 18}px))` }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonSvcCard key={i} />)
            : services.map((svc, i) => (
                <div className="dr-svc-card" key={svc.id} style={{ animation: `dr-cardIn .4s ${i * 0.05}s ease both` }}>
                  <div className="dr-svc-img">
                    {svc.img
                      ? <img src={svc.img} alt={svc.name} />
                      : <Stethoscope size={48} color="#cbd5e1" />}
                  </div>
                  <div className="dr-svc-body">
                    <div className="dr-svc-name">{svc.name}</div>
                    <div className="dr-svc-desc">{svc.desc || "Đang cập nhật"}</div>
                  </div>
                  <div className="dr-svc-actions">
                    <button className="dr-svc-btn" onClick={() => onBook(svc)}>
                      {typeof svc.price === "number" ? formatPrice(svc.price) : svc.price}
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Dots */}
      {!loading && maxIdx > 0 && (
        <div className="dr-dots">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button key={i} className={`dr-dot${i === safeIdx ? " active" : ""}`} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function Doctor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [doctorPage, setDoctorPage] = useState(1);
  const doctorsPerPage = 8;
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [dRows, sRows] = await Promise.all([fetchDoctors(), fetchAllServices()]);
        setDoctors(dRows.map((d) => ({
          id: d.UserID, name: d.FullName, avt: d.AvatarURL,
          bio: d.Bio, experience: d.ExperienceYears, specialty: d.Specialty,
        })));
        setServices(sRows.map((s) => ({
          id: s.ServiceID, name: s.ServiceName,
          price: s.Price || "Đang cập nhật giá",
          desc: s.Description || "Đang cập nhật thông tin.",
          active: s.IsActive, img: s.ImageURL,
        })));
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const keyword = normalizeText(search);
  const filtered = doctors.filter(
    (d) => normalizeText(d.name).includes(keyword) || normalizeText(d.specialty).includes(keyword)
  );
  const filteredServices = services.filter(
    (s) => normalizeText(s.name).includes(keyword) || normalizeText(s.desc).includes(keyword)
  );

  const doctorTotalPages = Math.max(1, Math.ceil(filtered.length / doctorsPerPage));
  const paginatedDoctors = filtered.slice((doctorPage - 1) * doctorsPerPage, doctorPage * doctorsPerPage);

  useEffect(() => { setDoctorPage(1); }, [search]);
  useEffect(() => { if (doctorPage > doctorTotalPages) setDoctorPage(doctorTotalPages); }, [doctorPage, doctorTotalPages]);

  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const changePage = (p) => { setDoctorPage(p); scrollToGrid(); };

  const pageButtons = (() => {
    if (doctorTotalPages <= 7) return Array.from({ length: doctorTotalPages }, (_, i) => i + 1);
    const pages = [];
    const start = Math.max(2, doctorPage - 1);
    const end = Math.min(doctorTotalPages - 1, doctorPage + 1);
    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < doctorTotalPages - 1) pages.push("...");
    pages.push(doctorTotalPages);
    return pages;
  })();

  return (
    <>
      <style>{STYLES}</style>
      <Navbar />

      <div className="dr-page">
        <div className="dr-container">

          {/* Header */}
          <div className="dr-header">
            <h1 className="dr-title">Bác Sĩ Nha Khoa</h1>
            <p className="dr-sub">Danh sách bác sĩ và dịch vụ tại phòng khám</p>
          </div>

          {/* Search */}
          <div className="dr-search-wrap">
            <Search size={18} />
            <input
              className="dr-search"
              type="text"
              placeholder="Tìm kiếm bác sĩ, dịch vụ hoặc chuyên khoa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status */}
          {loading && (
            <div className="dr-loading">
              <div className="dr-spinner" /> Đang tải dữ liệu...
            </div>
          )}
          {!!error && <div className="dr-error">{error}</div>}

          {/* Doctor grid */}
          <div className="dr-grid" ref={gridRef}>
            {loading && Array.from({ length: doctorsPerPage }).map((_, i) => <SkeletonCard key={i} />)}
            {!loading && paginatedDoctors.length === 0 && (
              <div className="dr-empty">
                <UserRound size={52} />
                <p>Không tìm thấy bác sĩ phù hợp.</p>
              </div>
            )}
            {!loading && paginatedDoctors.map((doc, idx) => (
              <div className="dr-card" key={doc.id} style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="dr-card-img">
                  {doc.avt
                    ? <img src={doc.avt} alt={doc.name} />
                    : <UserRound size={60} className="dr-card-img-ph" />}
                </div>
                <div className="dr-card-body">
                  <div className="dr-card-name">
                    <Link to={`/doctor-detail/${doc.id}`}>{doc.name}</Link>
                  </div>
                  <div className="dr-card-spec">{doc.specialty}</div>
                  <div className="dr-card-exp">Kinh nghiệm: {doc.experience ?? 0} năm</div>
                  <div className="dr-card-bio">{doc.bio || "Chưa có thông tin giới thiệu."}</div>
                </div>
                <div className="dr-card-actions">
                  <Link to={`/doctor-detail/${doc.id}`} className="dr-btn-detail">Chi tiết</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > doctorsPerPage && (
            <div className="dr-pagination">
              <button className="dr-page-btn" disabled={doctorPage === 1} onClick={() => changePage(doctorPage - 1)}>
                <ChevronLeft size={16} /> Trước
              </button>
              {pageButtons.map((p, i) =>
                p === "..." ? (
                  <span key={`d-${i}`} style={{ padding: "0 4px", color: "#94a3b8", alignSelf: "center" }}>…</span>
                ) : (
                  <button key={p} className={`dr-page-btn${p === doctorPage ? " active" : ""}`} onClick={() => changePage(p)}>
                    {p}
                  </button>
                )
              )}
              <button className="dr-page-btn" disabled={doctorPage === doctorTotalPages} onClick={() => changePage(doctorPage + 1)}>
                Sau <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Service slider */}
          <h2 className="dr-section-title">Danh sách dịch vụ</h2>
          <ServiceSlider
            services={filteredServices}
            loading={loading}
            onBook={() => navigate("/booking")}
          />

        </div>
      </div>

      <Footer />
    </>
  );
}
