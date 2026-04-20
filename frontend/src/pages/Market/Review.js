import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  createReview,
  fetchEligibleAppointments,
  fetchLatestReviews,
  updateReview,
} from "../../services/reviewApi";

function Stars({ value }) {
  return (
    <div style={{ color: "#ffb95f", letterSpacing: 2 }}>
      {"★".repeat(value)}
      <span style={{ color: "#c3c6d6" }}>{"★".repeat(5 - value)}</span>
    </div>
  );
}

export default function Review() {
  const MIN_COMMENT_LENGTH = 10;
  const MAX_COMMENT_LENGTH = 500;
  const [tab, setTab] = useState("all");
  const [rating, setRating] = useState(0);
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
    const mapped = rows.map((r) => ({
      user: r.UserName || "Ẩn danh",
      rating: Number(r.Rating) || 0,
      comment: r.Comment || "Đang cập nhật thông tin.",
      doctor: r.DoctorName || "Đang cập nhật thông tin.",
    }));
    setReviews(mapped);
  };

  const loadEligible = async () => {
    const userId = getUserId();
    if (!userId) {
      setAppointmentInfo([]);
      return;
    }
    const rows = await fetchEligibleAppointments(userId);
    const mapped = rows.map((r) => ({
      id: r.AppointmentID,
      doctor: r.DoctorName || "Đang cập nhật",
      visitedAt: r.AppointmentDate || "Đang cập nhật",
      note: r.Note || "Đang cập nhật thông tin.",
      specialty: r.Specialty || "Đang cập nhật thông tin.",
      reviewed: Boolean(r.ReviewID),
      previousRating: Number(r.Rating) || 0,
      previousComment: r.Comment || "",
      canReviewOrEdit: Boolean(r.CanReviewOrEdit),
    }));
    setAppointmentInfo(mapped);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await Promise.all([loadLatest(), loadEligible()]);
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được dữ liệu đánh giá");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    const trimmedComment = formComment.trim();

    if (!selectedVisit || !rating) {
      alert("Vui lòng nhập đủ số sao và nhận xét.");
      return;
    }

    if (!trimmedComment) {
      setCommentError("Vui lòng nhập nhận xét.");
      return;
    }

    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      setCommentError(`Nhận xét phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự.`);
      return;
    }

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setCommentError(`Nhận xét tối đa ${MAX_COMMENT_LENGTH} ký tự.`);
      return;
    }

    if (!selectedVisit.canReviewOrEdit) {
      alert("Bạn đã dùng hết số lần chỉnh sửa đánh giá.");
      return;
    }
    const userId = getUserId();
    if (!userId) {
      alert("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    try {
      setSubmitting(true);
      if (selectedVisit.reviewed) {
        await updateReview(selectedVisit.id, {
          userId,
          rating,
          comment: trimmedComment,
        });
      } else {
        await createReview({
          appointmentId: selectedVisit.id,
          userId,
          rating,
          comment: trimmedComment,
        });
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

  return (
    <div>
      <Navbar />
      <div className="min-vh-100 px-3 px-md-4" style={{ background: "#f7f9fb", paddingTop: 90, paddingBottom: 40 }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: 28 }}>
              {tab === "all" ? "Trải Nghiệm Khách Hàng." : "Chia Sẻ Trải Nghiệm."}
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              {tab === "all"
                ? "Khám phá phản hồi từ cộng đồng hoặc chia sẻ trải nghiệm của bạn."
                : "Những đóng góp của bạn giúp cộng đồng chọn được bác sĩ phù hợp nhất."}
            </p>
          </div>

          <div className="d-flex gap-2 mb-4">
            <button
              className={`btn ${tab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setTab("all")}
            >
              Tất cả đánh giá
            </button>
            <button
              className={`btn ${tab === "write" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setTab("write")}
            >
              Gửi đánh giá
            </button>
          </div>
          {!!error && <div className="alert alert-danger py-2">{error}</div>}
          {loading && <div className="text-muted mb-3">Đang tải dữ liệu...</div>}

          {tab === "all" && (
            <div className="row g-3">
              {!reviews.length && !loading && (
                <div className="col-12 text-muted">Chưa có đánh giá nào.</div>
              )}
              {reviews.map((item, index) => (
                <div className="col-12" key={`${index}`}>
                  <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
                    <div className="card-body">
                      <div className="fw-bold mb-1">{item.user}</div>
                      <small className="text-muted"> {item.doctor}</small>
                      <Stars value={item.rating} />
                      <p className="mt-2 mb-2" style={{ lineHeight: 1.6 }}>
                        "{item.comment}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "write" && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
              <div className="card-body p-4">
                {!selectedVisit ? (
                  <>
                    <h5 className="fw-bold mb-3">Các lần đã gặp bác sĩ</h5>
                    <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                      Chọn một lần khám bên dưới để viết đánh giá.
                    </p>

                    <div className="d-flex flex-column gap-3">
                      {!appointmentInfo.length && (
                        <div className="text-muted">Hiện chưa có lịch hoàn thành nào cần đánh giá.</div>
                      )}
                      {appointmentInfo.map((visit) => (
                        <div
                          key={visit.id}
                          className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-3 border rounded-3 bg-white"
                        >
                          <div>
                            <div className="fw-bold">{visit.doctor}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>{visit.specialty}</div>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                              Lần khám: {visit.visitedAt}
                            </div>
                            <div style={{ fontSize: 13 }}>{visit.note}</div>
                            {visit.reviewed && (
                              <small className="text-success fw-semibold">Đã đánh giá trước đó</small>
                            )}
                            {visit.reviewed && !visit.canReviewOrEdit && (
                              <small className="text-muted d-block">Đã hết lượt chỉnh sửa (tối đa 1 lần)</small>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`btn ${visit.reviewed ? "btn-outline-primary" : "btn-primary"}`}
                            onClick={() => startReview(visit)}
                          >
                            {visit.reviewed
                              ? (visit.canReviewOrEdit ? "Cập nhật đánh giá" : "Xem lại đánh giá")
                              : "Đánh giá"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : !submitSuccess ? (
                  <form onSubmit={submitReview}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Chọn bác sĩ</label>
                      <input className="form-control" value={selectedVisit.doctor} readOnly />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Lần khám</label>
                      <input className="form-control" value={selectedVisit.visitedAt} readOnly />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Đánh giá sao</label>
                      <div style={{ fontSize: 28 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            disabled={selectedVisit.reviewed && !selectedVisit.canReviewOrEdit}
                            onClick={() => setRating(n)}
                            style={{ border: "none", background: "transparent", color: n <= rating ? "#ffb95f" : "#c3c6d6" }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nhận xét của bạn</label>
                      <textarea
                        className="form-control"
                        rows="5"
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
                        <div className="text-danger mt-1" style={{ fontSize: 13 }}>
                          {commentError}
                        </div>
                      )}
                      <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                        {formComment.trim().length}/{MAX_COMMENT_LENGTH} ký tự (tối thiểu {MIN_COMMENT_LENGTH})
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-secondary w-50" onClick={() => setSelectedVisit(null)}>
                        Chọn lần khám khác
                      </button>
                      {selectedVisit.canReviewOrEdit ? (
                        <button type="submit" className="btn btn-primary w-50" disabled={submitting}>
                          {submitting
                            ? "Đang gửi..."
                            : selectedVisit.reviewed
                              ? "Cập nhật đánh giá"
                              : "Gửi đánh giá ngay"}
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary w-50" disabled>
                          Chế độ chỉ xem
                        </button>
                      )}
                    </div>

                  </form>
                ) : (
                  <div className="text-center py-4">
                    <h4 className="fw-bold">
                      {selectedVisit?.reviewed ? "Đánh giá đã được cập nhật!" : "Đánh giá đã được gửi!"}
                    </h4>
                    <p className="text-muted mb-3">
                      Cảm ơn bạn đã chia sẻ trải nghiệm.
                    </p>
                    <button
                      className="btn btn-primary"
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
    </div>
  );
}
