import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const sampleReviews = [
  {
    id: 1,
    doctor: "Bác sĩ A",
    rating: 5,
    content: "Bác sĩ làm rất nhẹ nhàng, không bị ê buốt.",
    note: "Verified Patient",
  },
  {
    id: 2,
    doctor: "Bác sĩ B",
    rating: 4,
    content: "Phòng khám sạch sẽ, tư vấn kỹ và rất tận tâm.",
    note: "Recommended for Orthodontics",
  },
];

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
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReview = (e) => {
    e.preventDefault();
    if (!doctor || !rating || !comment.trim()) {
      alert("Vui lòng nhập đủ bác sĩ, số sao và nhận xét.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div>
      <Navbar />
      <div className="min-vh-100 px-3 px-md-4" style={{ background: "#f7f9fb", paddingTop: 90, paddingBottom: 40 }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: 28 }}>
              {tab === "all" ? "Patient Experiences." : "Chia Sẻ Trải Nghiệm."}
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
              {sampleReviews.map((item) => (
                <div className="col-md-6" key={item.id}>
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
                    <div className="card-body">
                      <div className="fw-bold mb-1">{item.doctor}</div>
                      <Stars value={item.rating} />
                      <p className="mt-2 mb-2 text-muted" style={{ lineHeight: 1.6 }}>
                        "{item.content}"
                      </p>
                      <small className="text-primary fw-semibold">{item.note}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "write" && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
              <div className="card-body p-4">
                {!submitted ? (
                  <form onSubmit={submitReview}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Chọn bác sĩ</label>
                      <select className="form-select" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                        <option value="">Chọn bác sĩ của bạn...</option>
                        <option value="Bác sĩ A">Bác sĩ A</option>
                        <option value="Bác sĩ B">Bác sĩ B</option>
                        <option value="Bác sĩ C">Bác sĩ C</option>
                      </select>
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
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                      Gửi đánh giá ngay
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <h4 className="fw-bold">Đánh giá đã được gửi!</h4>
                    <p className="text-muted mb-3">
                      Cảm ơn bạn đã chia sẻ trải nghiệm.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setTab("all");
                        setSubmitted(false);
                        setDoctor("");
                        setRating(0);
                        setComment("");
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
