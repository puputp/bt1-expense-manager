import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("chi"); // chi | thu
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const r = await api.get("/expenses");
      setItems(r.data || []);
    } catch (e) {
      setErr(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalChi = useMemo(
  () =>
    items
      .filter((x) => x.type === "chi" && !!x.is_paid) // ✅ chỉ tính CHI đã trả
      .reduce((s, x) => s + Number(x.amount || 0), 0),
  [items]
);


  const totalThu = useMemo(
    () =>
      items
        .filter((x) => x.type === "thu")
        .reduce((s, x) => s + Number(x.amount || 0), 0),
    [items]
  );

  const balance = totalThu - totalChi;

  const fmt = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(n || 0));

  const onAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setErr("Vui lòng nhập tiêu đề.");
    if (Number(amount) <= 0) return setErr("Số tiền phải > 0.");

    try {
      setSubmitting(true);
      setErr("");
      await api.post("/expenses", {
        title: title.trim(),
        amount: Number(amount),
        type,
      });
      setTitle("");
      setAmount("");
      setType("chi");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Add failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ chỉ toggle cho CHI
  const onToggleChiPaid = async (id) => {
    try {
      await api.patch(`/expenses/${id}/toggle`);
      await load();
    } catch (e) {
      setErr(e?.message || "Toggle failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Xoá khoản này nha?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
      <h1 style={{
        textAlign: "center",
        marginBottom: 20,
        fontWeight: 900,
        fontSize: 26,
        color: "#1f2937"
      }}>
        Bài kiểm tra – MSSV: DH52201247 - Ca 2
      </h1>
        <header style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.logo}>💸</span>
            <div>
              <div style={styles.title}>Quản lý chi tiêu</div>
              <div style={styles.subtitle}>React + Laravel API</div>
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Tổng thu</div>
              <div style={{ ...styles.statValue, color: "#0f766e" }}>
                {fmt(totalThu)}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Tổng chi</div>
              <div style={{ ...styles.statValue, color: "#b91c1c" }}>
                {fmt(totalChi)}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Còn lại</div>
              <div
                style={{
                  ...styles.statValue,
                  color: balance >= 0 ? "#0f766e" : "#b91c1c",
                }}
              >
                {fmt(balance)}
              </div>
            </div>
          </div>
        </header>

        <main style={styles.grid}>
          {/* FORM */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Thêm khoản mới</div>
              <div style={styles.cardHint}>
                THU: ghi nhận tiền nhận • CHI: có trạng thái đã trả/chưa trả
              </div>
            </div>

            {err ? <div style={styles.alert}>⚠️ {err}</div> : null}

            <form onSubmit={onAdd} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Tiêu đề</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Ăn trưa, Tiền xăng, Lương..."
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Số tiền</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="45000"
                    inputMode="numeric"
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.field, width: 150 }}>
                  <label style={styles.label}>Loại</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={styles.input}
                  >
                    <option value="chi">Chi</option>
                    <option value="thu">Thu</option>
                  </select>
                </div>
              </div>

              <button disabled={submitting} style={styles.btn}>
                {submitting ? "Đang thêm..." : "➕ Thêm"}
              </button>
            </form>
          </section>

          {/* LIST */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Danh sách</div>
              <div style={styles.cardHint}>
                ✅ CHI: bấm để đổi trạng thái • 🗑️: xoá
              </div>
            </div>

            {loading ? (
              <div style={styles.muted}>Đang tải...</div>
            ) : items.length === 0 ? (
              <div style={styles.empty}>
                Chưa có khoản nào. Thêm thử 1 khoản bên trái nha.
              </div>
            ) : (
              <div style={styles.list}>
                {items.map((x) => {
                  const isThu = x.type === "thu";
                  const paid = !!x.is_paid;

                  return (
                    <div key={x.id} style={styles.item}>
                      <div style={styles.itemLeft}>
                        <div style={styles.badgeWrap}>
                          <span
                            style={{
                              ...styles.badge,
                              background: isThu ? "#dcfce7" : "#fee2e2",
                              color: isThu ? "#166534" : "#991b1b",
                            }}
                          >
                            {isThu ? "THU" : "CHI"}
                          </span>
                          <span style={styles.itemTitle}>{x.title}</span>
                        </div>
                        <div style={styles.itemSub}>{fmt(x.amount)}</div>
                      </div>

                      <div style={styles.itemRight}>
                        {/* ✅ THU: không có trạng thái & không toggle */}
                        {!isThu && (
                          <button
                            onClick={() => onToggleChiPaid(x.id)}
                            style={{
                              ...styles.pill,
                              background: paid ? "#dcfce7" : "#fee2e2",
                              color: paid ? "#166534" : "#991b1b",
                              borderColor: paid ? "#86efac" : "#fecaca",
                            }}
                            title="Bấm để đổi trạng thái (chỉ áp dụng cho CHI)"
                          >
                            {paid ? "✅ Đã trả" : "⏳ Chưa trả"}
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(x.id)}
                          style={styles.iconBtn}
                          title="Xoá"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <footer style={styles.footer}>
          <span>© BT1 – Expense Manager • React (Vite) + Laravel API</span>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, #dbeafe 0%, rgba(219,234,254,0) 60%), radial-gradient(1000px 500px at 90% 20%, #dcfce7 0%, rgba(220,252,231,0) 55%), #f6f7fb",
    display: "flex",
    justifyContent: "center",
    padding: "40px 16px",
  },
  shell: { width: "100%", maxWidth: 980 },
  header: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    flexWrap: "wrap",
  },
  brand: { display: "flex", gap: 12, alignItems: "center" },
  logo: {
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    fontSize: 22,
  },
  title: { fontSize: 22, fontWeight: 800, letterSpacing: 0.2 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  stats: { display: "flex", gap: 10, flexWrap: "wrap" },
  statCard: {
    background: "white",
    borderRadius: 16,
    padding: "10px 12px",
    minWidth: 150,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    border: "1px solid rgba(15,23,42,0.06)",
  },
  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 16, fontWeight: 800, marginTop: 2 },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
    border: "1px solid rgba(15,23,42,0.06)",
    backdropFilter: "blur(8px)",
  },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 800 },
  cardHint: { fontSize: 12, color: "#64748b", marginTop: 4 },

  alert: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    padding: "10px 12px",
    borderRadius: 14,
    fontSize: 13,
    marginBottom: 12,
  },

  form: { display: "grid", gap: 10 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, color: "#334155", fontWeight: 700 },
  input: {
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    background: "white",
  },
  row: { display: "flex", gap: 10, alignItems: "end" },
  btn: {
    marginTop: 6,
    borderRadius: 14,
    border: "none",
    padding: "12px 14px",
    background: "#111827",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },

  muted: { color: "#64748b", fontSize: 14, padding: 8 },
  empty: {
    color: "#64748b",
    fontSize: 14,
    padding: 14,
    borderRadius: 14,
    background: "rgba(15,23,42,0.03)",
    border: "1px dashed rgba(15,23,42,0.18)",
  },

  list: { display: "grid", gap: 10 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    background: "white",
    border: "1px solid rgba(15,23,42,0.06)",
  },
  itemLeft: { display: "grid", gap: 4 },
  badgeWrap: { display: "flex", alignItems: "center", gap: 10 },
  badge: {
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
  },
  itemTitle: { fontWeight: 800 },
  itemSub: { fontSize: 13, color: "#475569" },
  itemRight: { display: "flex", alignItems: "center", gap: 8 },
  pill: {
    borderRadius: 999,
    border: "1px solid",
    padding: "8px 10px",
    fontWeight: 800,
    cursor: "pointer",
    background: "white",
  },
  iconBtn: {
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "8px 10px",
    background: "white",
    cursor: "pointer",
  },

  footer: {
    marginTop: 14,
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
};
