import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetch5LastestReviews, fetchAllAppointments } from "../../services/reviewApi";

function Stars({ value }) {
  return (
    <div style={{ color: "#ffb95f", letterSpacing: 2 }}>
      {"★".repeat(value)}
      <span style={{ color: "#c3c6d6" }}>{"★".repeat(5 - value)}</span>
    </div>
  );
}

export default function Review() {
  const [tab, setTab] = useState("all");
  const [rating, setRating] = useState(0);
  const [doctor, setDoctor] = useState("");
  const [reviews, setReviews] = useState([]);
  const [formComment, setFormComment] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.UserID ?? user?.UserId ?? user?.id ?? null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const load5LastestReviews = async () => {
      try {
        setLoading(true);
        const rows = await fetch5LastestReviews();

        const mapped = rows.map((r) => {
          return {
            user: r.UserName,
            rating: r.Rating,
            comment: r.Comment || "Đang cập nhật thông tin.",
            doctor: r.DoctorName || "Đang cập nhật thông tin .",
          };
        });

        setReviews(mapped);
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    load5LastestReviews();
  }, []);

  useEffect(() => {
    const loadAllAppointments = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        if (!userId) {
          setError("Vui lòng đăng nhập để xem lịch sử khám.");
          setLoading(false);
          return;
        }
        const rows = await fetchAllAppointments(userId);

        const mapped = rows.map((r) => {
          return {
            id: r.AppointmentID || `${r.doctorName || r.DoctorName}-${r.AppointmentDate}`,
            user: r.UserName || r.userName || "Đang cập nhật",
            doctor: r.doctorName || r.DoctorName || "Đang cập nhật",
            visitedAt: r.AppointmentDate || "Đang cập nhật thông tin.",
            note: r.Note || "Đang cập nhật thông tin.",
            specialty: r.ChuyenMon || r.Specialty || "Đang cập nhật thông tin.",
            reviewed: Boolean(r.ReviewID || r.Rating || r.Comment),
            previousRating: Number(r.Rating) || 0,
            previousComment: r.Comment || "",
          };
        });

        setAppointmentInfo(mapped);
        setError("");
      } catch (e) {
        setError(e.message || "Không tải được danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    loadAllAppointments();
  }, []);

  const submitReview = (e) => {
    e.preventDefault();
    if (!doctor || !rating || !formComment.trim()) {
      alert("Vui lòng nhập đủ bác sĩ, số sao và nhận xét.");
      return;
    }
    setSubmitted(true);
  };

  const startReview = (visit) => {
    setSelectedVisit(visit);
    setDoctor(visit.doctor);
    setRating(visit.reviewed ? visit.previousRating : 0);
    setFormComment(visit.reviewed ? visit.previousComment : "");
    setSubmitted(false);
  };

  return (
    <div>
      {
        console.log(appointmentInfo)
        
      }
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

          {tab === "all" && (
            <div className="row g-3">
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
                          </div>
                          <button
                            type="button"
                            className={`btn ${visit.reviewed ? "btn-outline-primary" : "btn-primary"}`}
                            onClick={() => startReview(visit)}
                          >
                            {visit.reviewed ? "Cập nhật đánh giá" : "Đánh giá"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : !submitted ? (
                  <form onSubmit={submitReview}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Chọn bác sĩ</label>
                      <input className="form-control" value={doctor} readOnly />
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
                        onChange={(e) => setFormComment(e.target.value)}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-secondary w-50" onClick={() => setSelectedVisit(null)}>
                        Chọn lần khám khác
                      </button>
                      <button type="submit" className="btn btn-primary w-50">
                        {selectedVisit.reviewed ? "Cập nhật đánh giá" : "Gửi đánh giá ngay"}
                      </button>
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
                        setSubmitted(false);
                        setSelectedVisit(null);
                        setDoctor("");
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
