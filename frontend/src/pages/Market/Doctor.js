import { useState, useEffect } from "react";
import { Stethoscope, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { fetchDoctors } from "../../services/doctorApi";

const styles = {
    page: { padding: "88px 56px 36px", background: "#f5f6fa", minHeight: "100vh" },
    container: { maxWidth: 1360, margin: "0 auto" },
    title: { fontSize: "clamp(28px, 2.6vw, 40px)", fontWeight: 750, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.2px" },
    subtitle: { fontSize: 15, color: "#334155", marginBottom: 18 },
    searchInput: {
        width: "100%",
        maxWidth: 620,
        height: 50,
        padding: "0 16px 0 44px",
        border: "1px solid #d3dae6",
        borderRadius: 14,
        fontSize: 14,
        color: "#334155",
        outline: "none",
        marginBottom: 22,
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "14px center",
        backgroundSize: 20,
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
    card: {
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
    },
    cardImg: {
        background: "#e5e7eb",
        height: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardBody: { padding: 18, flex: 1, display: "flex", flexDirection: "column", gap: 8 },
    specialty: { fontSize: 13, color: "#3b82f6", fontWeight: 500 },
    doctorName: { fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, minHeight: 64 },
    doctorDesc: { fontSize: 13, color: "#334155", lineHeight: 1.45, flex: 1 },
    cardActions: { display: "flex", gap: 10, padding: "0 18px 18px" },
    btnIcon: {
        width: 72, height: 42, border: "2px solid #3b82f6",
        borderRadius: 12, background: "#fff", color: "#3b82f6",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    btnDetail: {
        flex: 1, height: 42, background: "#3b82f6",
        border: "none", borderRadius: 12, color: "#fff",
        fontSize: 15, fontWeight: 700, display: "flex",
        alignItems: "center", justifyContent: "center", textDecoration: "none",
    },
};



export default function Doctor() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [doctors, setDoctors] = useState([]);


    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoading(true);
                const rows = await fetchDoctors();

                const mapped = rows.map((d) => ({
                    id: d.DoctorID,
                    name: d.FullName,
                    specialty: d.Specialty || "Nha khoa",
                    desc: d.Description || d.Bio || "Đang cập nhật thông tin bác sĩ.",
                }));

                setDoctors(mapped);
                setError("");
            } catch (e) {
                setError(e.message || "Không tải được danh sách bác sĩ");
            } finally {
                setLoading(false);
            }
        };

        loadDoctors();
    }, []);

    const filtered = doctors.filter(
        (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.specialty.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <div style={styles.page}>
                <div style={styles.container}>
                    <h1 style={styles.title}>Bác Sĩ Nha Khoa</h1>
                    <p style={styles.subtitle}>Danh sach bac si va chuyen khoa tai phong kham</p>
                    <input
                        style={styles.searchInput}
                        type="text"
                        placeholder="Tim kiem bac si hoac chuyen khoa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div style={styles.grid}>
                        {filtered.map((doctor) => (
                            <div key={doctor.id} style={styles.card}>
                                <div style={styles.cardImg}>
                                    <Stethoscope size={58} color="#9ca3af" />
                                </div>
                                <div style={styles.cardBody}>
                                    <div style={styles.specialty}>{doctor.specialty}</div>
                                    <div style={styles.doctorName}>
                                        <Link to={`/doctor-detail/${doctor.id}`} style={{ textDecoration: "none", color: "#111" }}>
                                            {doctor.name}
                                        </Link>
                                    </div>
                                    <div style={styles.doctorDesc}>{doctor.desc}</div>
                                </div>
                                <div style={styles.cardActions}>
                                    <button style={styles.btnIcon}>
                                        <UserRound size={20} />
                                    </button>
                                    <Link to={`/doctor-detail/${doctor.id}`} style={styles.btnDetail}>
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>

    );
}

