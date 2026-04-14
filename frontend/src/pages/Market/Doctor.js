import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

const doctors = [
  { id: 1, specialty: "Rang Ham Mat", name: "BS. Nguyen Van Nam", desc: "Chuyen dieu tri nha chu, viem loi va phuc hinh rang." },
  { id: 2, specialty: "Nieng Rang", name: "BS. Tran Thi Lan", desc: "Tu van va thuc hien nieng rang cho tre em va nguoi lon." },
  { id: 3, specialty: "Nho Rang", name: "BS. Le Minh Tuan", desc: "Nho rang kho, rang khon va xu ly bien chung rang mieng." },
  { id: 4, specialty: "Tay Trang Rang", name: "BS. Pham Thu Ha", desc: "Tay trang rang tham my bang cong nghe den LED hien dai." },
  { id: 5, specialty: "Phuc Hinh Rang", name: "BS. Vu Quoc Bao", desc: "Tram rang, boc su va phuc hoi chuc nang an nhai." },
  { id: 6, specialty: "Noi Nha", name: "BS. Do Hai Yen", desc: "Dieu tri tuy rang va bao ton rang that toi uu." },
  { id: 7, specialty: "Tieu Phau", name: "BS. Hoang Gia Huy", desc: "Tieu phau rang mieng va dieu tri ton thuong mo mem." },
  { id: 8, specialty: "Kham Tong Quat", name: "BS. Bui Thanh Mai", desc: "Kham dinh ky, tu van phong ngua benh rang mieng." },
];

const styles = {
  page: { padding: "32px 40px", background: "#f5f6fa", minHeight: "100vh" },
  title: { fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#888", marginBottom: 20 },
  searchInput: {
    width: 280,
    padding: "9px 14px 9px 36px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 13,
    color: "#333",
    outline: "none",
    marginBottom: 28,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "10px center",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #eee",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardImg: {
    background: "#f0f2f5",
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  specialty: { fontSize: 11, color: "#1DA0E0", fontWeight: 600 },
  doctorName: { fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.4 },
  doctorDesc: { fontSize: 12, color: "#888", lineHeight: 1.5, flex: 1 },
};

export default function Doctor() {
  const [search, setSearch] = useState("");

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Bac si nha khoa</h1>
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
              <Stethoscope size={48} color="#ccc" />
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
          </div>
        ))}
      </div>
    </div>
  );
}
