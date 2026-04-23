import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  createReview,
  fetchEligibleAppointments,
  fetchLatestReviews,
  updateReview,
} from "../../services/reviewApi";

/* ─────────────────────────────────────────────
   Inline styles & keyframes (no extra CSS file)
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes rp-fadeInUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rp-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes rp-slideLeft {
  from { opacity: 0; transform: translateX(-18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes rp-scaleIn {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes rp-starPop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.5); }
  100% { transform: scale(1); }
}
@keyframes rp-successBounce {
  0%   { transform: scale(0.4); opacity: 0; }
  70%  { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes rp-checkDraw {
  from { stroke-dashoffset: 60; }
  to   { stroke-dashoffset: 0; }
}
@keyframes rp-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes rp-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

/* ── Page shell ── */
.rp-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #f2f5fb;
  padding: 90px 16px 56px;
}
.rp-container { max-width: 860px; margin: 0 auto; }

/* ── Header ── */
.rp-header { animation: rp-fadeInUp .5s ease both; }
.rp-title  { font-size: 28px; font-weight: 700; color: #151929; letter-spacing: -.4px; margin: 0 0 4px; }
.rp-sub    { font-size: 14px; color: #7a82a4; margin: 0; }

/* ── Tabs ── */
.rp-tabs { display: flex; gap: 8px; margin-bottom: 28px; animation: rp-fadeInUp .5s .07s ease both; }
.rp-tab  {
  padding: 9px 24px; border-radius: 50px; font-size: 14px; font-weight: 600;
  border: 1.5px solid transparent; cursor: pointer; transition: all .22s ease;
  font-family: 'DM Sans', sans-serif;
}
.rp-tab-active {
  background: #3b5bdb; color: #fff; border-color: #3b5bdb;
  box-shadow: 0 4px 16px rgba(59,91,219,.3);
}
.rp-tab-inactive {
  background: #fff; color: #5a637d; border-color: #e1e4f0;
}
.rp-tab-inactive:hover { border-color: #3b5bdb; color: #3b5bdb; transform: translateY(-1px); }

/* ── Alert ── */
.rp-alert-danger {
  background: #fff0f0; color: #b71c1c; border-left: 3px solid #ef5350;
  padding: 10px 16px; border-radius: 10px; font-size: 13.5px;
  margin-bottom: 16px; animation: rp-fadeIn .3s ease;
}

/* ── Loading ── */
.rp-loading { font-size: 14px; color: #9099ba; animation: rp-pulse 1.2s infinite; margin-bottom: 14px; }

/* ── Review cards ── */
.rp-reviews-grid { display: flex; flex-direction: column; gap: 14px; }
.rp-review-card {
  background: #fff; border-radius: 18px; padding: 22px 24px;
  border: 1px solid #eaecf5;
  transition: box-shadow .22s, transform .22s;
}
.rp-review-card:hover {
  box-shadow: 0 10px 32px rgba(59,91,219,.1);
  transform: translateY(-3px);
}
.rp-review-name   { font-weight: 700; font-size: 15px; color: #151929; margin: 0 0 2px; }
.rp-review-doctor { font-size: 12.5px; color: #9099ba; margin: 0 0 8px; }
.rp-stars         { font-size: 17px; letter-spacing: 2.5px; margin-bottom: 10px; color: #f9a825; }
.rp-stars .rp-star-empty { color: #dde0ef; }
.rp-review-comment {
  font-size: 14px; color: #3c4464; line-height: 1.65; margin: 0;
  padding: 12px 14px; background: #f7f8fd; border-radius: 10px;
  border-left: 3px solid #c5caf0; font-style: italic;
}

/* ── Write card ── */
.rp-write-card {
  background: #fff; border-radius: 22px;
  border: 1px solid #eaecf5; overflow: hidden;
  animation: rp-scaleIn .38s ease both;
}
.rp-write-body { padding: 32px; }

/* ── Visit list ── */
.rp-section-title { font-size: 17px; font-weight: 700; color: #151929; margin: 0 0 4px; }
.rp-section-sub   { font-size: 13px; color: #9099ba; margin: 0 0 22px; }
.rp-empty-state   { font-size: 14px; color: #9099ba; text-align: center; padding: 28px 0; }

.rp-visit-item {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 18px 20px; border: 1.5px solid #eaecf5; border-radius: 16px;
  background: #fafbfe; margin-bottom: 12px;
  transition: border-color .2s, box-shadow .2s, transform .15s;
}
.rp-visit-item:hover {
  border-color: #b0bbf5; box-shadow: 0 5px 20px rgba(59,91,219,.09);
  transform: translateY(-1px);
}
.rp-visit-name { font-weight: 700; font-size: 14.5px; color: #151929; margin: 0 0 2px; }
.rp-visit-spec { font-size: 12.5px; color: #9099ba; margin: 0; }
.rp-visit-date { font-size: 12.5px; color: #b0b9d8; margin: 0; }
.rp-badge-done   { display: inline-block; font-size: 11px; font-weight: 600; color: #1b6e3e; background: #e4f8ee; padding: 2px 10px; border-radius: 20px; margin-top: 5px; }
.rp-badge-locked { display: inline-block; font-size: 11px; color: #9099ba; background: #f0f1f8; padding: 2px 10px; border-radius: 20px; margin-top: 3px; }

/* ── Buttons ── */
.rp-btn {
  cursor: pointer; font-size: 13.5px; font-weight: 600; border-radius: 50px;
  padding: 9px 22px; border: none; transition: all .2s ease;
  font-family: 'DM Sans', sans-serif; white-space: nowrap;
}
.rp-btn-primary  { background: #3b5bdb; color: #fff; }
.rp-btn-primary:hover:not(:disabled) { background: #2e4ec4; box-shadow: 0 5px 16px rgba(59,91,219,.35); transform: translateY(-1px); }
.rp-btn-primary:active:not(:disabled) { transform: scale(.97); }
.rp-btn-outline  { background: #fff; color: #5a637d; border: 1.5px solid #e1e4f0; }
.rp-btn-outline:hover  { border-color: #3b5bdb; color: #3b5bdb; }
.rp-btn-disabled { background: #f0f1f8; color: #b0b9d8; cursor: not-allowed; }
.rp-btn-secondary { background: #f0f1f8; color: #9099ba; cursor: not-allowed; }

/* ── Form ── */
.rp-label { display: block; font-size: 13px; font-weight: 600; color: #4a5278; margin: 0 0 7px; }
.rp-input {
  width: 100%; padding: 10px 14px; border: 1.5px solid #e1e4f0;
  border-radius: 11px; font-size: 14px; color: #151929;
  background: #fafbfe; outline: none; font-family: 'DM Sans', sans-serif;
  transition: border-color .2s, box-shadow .2s;
}
.rp-input:focus { border-color: #3b5bdb; box-shadow: 0 0 0 3px rgba(59,91,219,.13); }
textarea.rp-input { resize: vertical; min-height: 124px; }

/* ── Star rating ── */
.rp-star-row  { display: flex; gap: 4px; }
.rp-star-btn  {
  background: none; border: none; font-size: 32px; cursor: pointer;
  color: #dde0ef; padding: 0; line-height: 1;
  transition: color .15s, transform .15s;
}
.rp-star-btn.lit  { color: #f9a825; }
.rp-star-btn:hover { transform: scale(1.18); }
.rp-star-btn.pop  { animation: rp-starPop .28s ease; }

.rp-char-hint  { font-size: 12px; color: #b0b9d8; margin-top: 5px; }
.rp-error-text { font-size: 12.5px; color: #d64040; margin-top: 4px; animation: rp-fadeIn .25s ease; }

.rp-form-actions { display: flex; gap: 12px; margin-top: 24px; }
.rp-form-actions > * { flex: 1; }

/* ── Success ── */
.rp-success      { text-align: center; padding: 44px 24px; animation: rp-fadeIn .4s ease both; }
.rp-success-icon {
  width: 70px; height: 70px; border-radius: 50%; background: #e6f9ee;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px; animation: rp-successBounce .55s ease both;
}
.rp-success-icon svg polyline { stroke-dasharray: 60; stroke-dashoffset: 60; animation: rp-checkDraw .5s .38s ease forwards; }
.rp-success-title { font-size: 21px; font-weight: 700; color: #151929; margin: 0 0 6px; }
.rp-success-sub   { font-size: 14px; color: #9099ba; margin: 0 0 24px; }
`;

/* ─────────────────────────────────────────────
   Stars display component
───────────────────────────────────────────── */
function Stars({ value }) {
  return (
    <div className="rp-stars">
      {"★".repeat(value)}
      <span className="rp-star-empty">{"★".repeat(5 - value)}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function Review() {
  const MIN_COMMENT_LENGTH = 10;
  const MAX_COMMENT_LENGTH = 500;

  const [tab, setTab] = useState("all");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [popStar, setPopStar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [formComment, setFormComment] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.UserID ?? user?.UserId ?? user?.id ?? null;
    } catch {
      return null;
    }
  };

  const loadLatest = async () => {
    const rows = await fetchLatestReviews();
    setReviews(
      rows.map((r) => ({
        user: r.UserName || "Ẩn danh",
        rating: Number(r.Rating) || 0,
        comment: r.Comment || "Đang cập nhật thông tin.",
        doctor: r.DoctorName || "Đang cập nhật thông tin.",
      }))
    );
  };

  const loadEligible = async () => {
    const userId = getUserId();
    if (!userId) { setAppointmentInfo([]); return; }
    const rows = await fetchEligibleAppointments(userId);
    setAppointmentInfo(
      rows.map((r) => ({
        id: r.AppointmentID,
        doctor: r.DoctorName || "Đang cập nhật",
        visitedAt: r.AppointmentDate || "Đang cập nhật",
        note: r.Note || "Đang cập nhật thông tin.",
        specialty: r.Specialty || "Đang cập nhật thông tin.",
        reviewed: Boolean(r.ReviewID),
        previousRating: Number(r.Rating) || 0,
        previousComment: r.Comment || "",
        canReviewOrEdit: Boolean(r.CanReviewOrEdit),
      }))
    );
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadLatest(), loadEligible()]);
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được dữ liệu đánh giá");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Submit ── */
  const submitReview = async (e) => {
    e.preventDefault();
    const trimmedComment = formComment.trim();
    if (!selectedVisit || !rating) { alert("Vui lòng nhập đủ số sao và nhận xét."); return; }
    if (!trimmedComment) { setCommentError("Vui lòng nhập nhận xét."); return; }
    if (trimmedComment.length < MIN_COMMENT_LENGTH) { setCommentError(`Nhận xét phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự.`); return; }
    if (trimmedComment.length > MAX_COMMENT_LENGTH) { setCommentError(`Nhận xét tối đa ${MAX_COMMENT_LENGTH} ký tự.`); return; }
    if (!selectedVisit.canReviewOrEdit) { alert("Bạn đã dùng hết số lần chỉnh sửa đánh giá."); return; }
    const userId = getUserId();
    if (!userId) { alert("Bạn cần đăng nhập để gửi đánh giá."); return; }

    try {
      setSubmitting(true);
      if (selectedVisit.reviewed) {
        await updateReview(selectedVisit.id, { userId, rating, comment: trimmedComment });
      } else {
        await createReview({ appointmentId: selectedVisit.id, userId, rating, comment: trimmedComment });
      }
      await Promise.all([loadLatest(), loadEligible()]);
      setSubmitSuccess(true);
      setError("");
      setCommentError("");
    } catch (err) {
      setError(err.message || "Gửi đánh giá thất bại");
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const startReview = (visit) => {
    setSelectedVisit(visit);
    setRating(visit.reviewed ? visit.previousRating : 0);
    setFormComment(visit.reviewed ? visit.previousComment : "");
    setCommentError("");
    setSubmitSuccess(false);
  };

  const handleStarClick = (n) => {
    setRating(n);
    setPopStar(n);
    setTimeout(() => setPopStar(null), 300);
  };

  /* ── Render ── */
  const displayRating = hoverRating || rating;

  return (
    <>
      <style>{STYLES}</style>
      <Navbar />

      <div className="rp-page">
        <div className="rp-container">

          {/* Header */}
          <div className="rp-header" style={{ marginBottom: 24 }}>
            <h2 className="rp-title">
              {tab === "all" ? "Trải Nghiệm Khách Hàng." : "Chia Sẻ Trải Nghiệm."}
            </h2>
            <p className="rp-sub">
              {tab === "all"
                ? "Khám phá phản hồi từ cộng đồng hoặc chia sẻ trải nghiệm của bạn."
                : "Những đóng góp của bạn giúp cộng đồng chọn được bác sĩ phù hợp nhất."}
            </p>
          </div>

          {/* Tabs */}
          <div className="rp-tabs">
            <button
              className={`rp-tab ${tab === "all" ? "rp-tab-active" : "rp-tab-inactive"}`}
              onClick={() => setTab("all")}
            >
              Tất cả đánh giá
            </button>
            <button
              className={`rp-tab ${tab === "write" ? "rp-tab-active" : "rp-tab-inactive"}`}
              onClick={() => setTab("write")}
            >
              Gửi đánh giá
            </button>
          </div>

          {/* Global error */}
          {!!error && <div className="rp-alert-danger">{error}</div>}
          {loading && <div className="rp-loading">Đang tải dữ liệu...</div>}

          {/* ── TAB: ALL REVIEWS ── */}
          {tab === "all" && (
            <div className="rp-reviews-grid">
              {!reviews.length && !loading && (
                <div className="rp-empty-state">Chưa có đánh giá nào.</div>
              )}
              {reviews.map((item, index) => (
                <div
                  className="rp-review-card"
                  key={index}
                  style={{ animation: `rp-fadeInUp .45s ${index * 0.08}s ease both` }}
                >
                  <p className="rp-review-name">{item.user}</p>
                  <p className="rp-review-doctor">{item.doctor}</p>
                  <Stars value={item.rating} />
                  <p className="rp-review-comment">"{item.comment}"</p>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: WRITE REVIEW ── */}
          {tab === "write" && (
            <div className="rp-write-card">
              <div className="rp-write-body">

                {/* Step 1 — visit list */}
                {!selectedVisit && (
                  <div style={{ animation: "rp-fadeIn .35s ease both" }}>
                    <h5 className="rp-section-title">Các lần đã gặp bác sĩ</h5>
                    <p className="rp-section-sub">Chọn một lần khám bên dưới để viết đánh giá.</p>

                    {!appointmentInfo.length && !loading && (
                      <div className="rp-empty-state">Hiện chưa có lịch hoàn thành nào cần đánh giá.</div>
                    )}

                    {appointmentInfo.map((visit, idx) => (
                      <div
                        className="rp-visit-item"
                        key={visit.id}
                        style={{ animation: `rp-slideLeft .38s ${idx * 0.07}s ease both` }}
                      >
                        <div>
                          <p className="rp-visit-name">{visit.doctor}</p>
                          <p className="rp-visit-spec">{visit.specialty}</p>
                          <p className="rp-visit-date">Lần khám: {visit.visitedAt}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 13 }}>{visit.note}</p>
                          {visit.reviewed && (
                            <span className="rp-badge-done">Đã đánh giá trước đó</span>
                          )}
                          {visit.reviewed && !visit.canReviewOrEdit && (
                            <><br /><span className="rp-badge-locked">Đã hết lượt chỉnh sửa (tối đa 1 lần)</span></>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`rp-btn ${visit.reviewed ? "rp-btn-outline" : "rp-btn-primary"}`}
                          onClick={() => startReview(visit)}
                        >
                          {visit.reviewed
                            ? (visit.canReviewOrEdit ? "Cập nhật đánh giá" : "Xem lại đánh giá")
                            : "Đánh giá"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2 — form */}
                {selectedVisit && !submitSuccess && (
                  <form
                    onSubmit={submitReview}
                    style={{ animation: "rp-fadeIn .35s ease both" }}
                  >
                    {/* Doctor */}
                    <div style={{ marginBottom: 20 }}>
                      <label className="rp-label">Chọn bác sĩ</label>
                      <input className="rp-input" value={selectedVisit.doctor} readOnly />
                    </div>

                    {/* Date */}
                    <div style={{ marginBottom: 20 }}>
                      <label className="rp-label">Lần khám</label>
                      <input className="rp-input" value={selectedVisit.visitedAt} readOnly />
                    </div>

                    {/* Stars */}
                    <div style={{ marginBottom: 20 }}>
                      <label className="rp-label">Đánh giá sao</label>
                      <div className="rp-star-row">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            disabled={selectedVisit.reviewed && !selectedVisit.canReviewOrEdit}
                            onClick={() => handleStarClick(n)}
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            className={`rp-star-btn${n <= displayRating ? " lit" : ""}${popStar === n ? " pop" : ""}`}
                            style={{ cursor: selectedVisit.reviewed && !selectedVisit.canReviewOrEdit ? "not-allowed" : "pointer" }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: 6 }}>
                      <label className="rp-label">Nhận xét của bạn</label>
                      <textarea
                        className="rp-input"
                        rows={5}
                        placeholder="Viết cảm nhận của bạn về buổi thăm khám..."
                        value={formComment}
                        maxLength={MAX_COMMENT_LENGTH}
                        readOnly={selectedVisit.reviewed && !selectedVisit.canReviewOrEdit}
                        onChange={(e) => {
                          setFormComment(e.target.value);
                          if (commentError) setCommentError("");
                        }}
                      />
                      {!!commentError && (
                        <div className="rp-error-text">{commentError}</div>
                      )}
                      <div className="rp-char-hint">
                        {formComment.trim().length}/{MAX_COMMENT_LENGTH} ký tự (tối thiểu {MIN_COMMENT_LENGTH})
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="rp-form-actions">
                      <button
                        type="button"
                        className="rp-btn rp-btn-outline"
                        onClick={() => setSelectedVisit(null)}
                      >
                        ← Chọn lần khám khác
                      </button>
                      {selectedVisit.canReviewOrEdit ? (
                        <button
                          type="submit"
                          className="rp-btn rp-btn-primary"
                          disabled={submitting}
                        >
                          {submitting
                            ? "Đang gửi..."
                            : selectedVisit.reviewed
                              ? "Cập nhật đánh giá"
                              : "Gửi đánh giá ngay"}
                        </button>
                      ) : (
                        <button type="button" className="rp-btn rp-btn-secondary" disabled>
                          Chế độ chỉ xem
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* Step 3 — success */}
                {selectedVisit && submitSuccess && (
                  <div className="rp-success">
                    <div className="rp-success-icon">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
                        stroke="#2e7d32" strokeWidth="3"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="7,19 14,26 29,11" />
                      </svg>
                    </div>
                    <h4 className="rp-success-title">
                      {selectedVisit.reviewed ? "Đánh giá đã được cập nhật!" : "Đánh giá đã được gửi!"}
                    </h4>
                    <p className="rp-success-sub">Cảm ơn bạn đã chia sẻ trải nghiệm.</p>
                    <button
                      className="rp-btn rp-btn-primary"
                      onClick={() => {
                        setTab("all");
                        setSubmitSuccess(false);
                        setSelectedVisit(null);
                        setRating(0);
                        setFormComment("");
                      }}
                    >
                      Xem đánh giá
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}