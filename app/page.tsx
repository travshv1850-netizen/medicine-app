"use client";

import { useState, useEffect } from "react";

type TimingKey = "morning" | "noon" | "evening" | "bedtime";

type Medicine = {
  id: string;
  name: string;
  timings: TimingKey[];
  color: string;
};

type CheckRecord = {
  [medicineId: string]: boolean;
};

type DailyChecks = {
  date: string;
  checks: CheckRecord;
};

const TIMING_LABELS: { key: TimingKey; label: string; icon: string; time: string }[] = [
  { key: "morning", label: "朝", icon: "🌅", time: "起床後" },
  { key: "noon", label: "昼", icon: "☀️", time: "昼食後" },
  { key: "evening", label: "夕", icon: "🌆", time: "夕食後" },
  { key: "bedtime", label: "寝る前", icon: "🌙", time: "就寝前" },
];

const MEDICINE_COLORS = [
  "#FF6B6B", "#FF9F43", "#FECA57", "#48DBB4",
  "#54A0FF", "#A29BFE", "#FD79A8", "#636E72",
];

const todayString = () => new Date().toLocaleDateString("ja-JP");

export default function MedicineApp() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [dailyChecks, setDailyChecks] = useState<CheckRecord>({});
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"today" | "manage">("today");
  const [newName, setNewName] = useState("");
  const [newTimings, setNewTimings] = useState<TimingKey[]>([]);
  const [newColor, setNewColor] = useState(MEDICINE_COLORS[0]);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const savedMeds = localStorage.getItem("medicines_v1");
    if (savedMeds) setMedicines(JSON.parse(savedMeds));
    const savedChecks = localStorage.getItem("daily_checks_v1");
    if (savedChecks) {
      const parsed: DailyChecks = JSON.parse(savedChecks);
      if (parsed.date === todayString()) {
        setDailyChecks(parsed.checks);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("medicines_v1", JSON.stringify(medicines));
  }, [medicines, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("daily_checks_v1", JSON.stringify({ date: todayString(), checks: dailyChecks }));
  }, [dailyChecks, mounted]);

  const toggleCheck = (medicineId: string, timing: TimingKey) => {
    const key = `${medicineId}_${timing}`;
    setDailyChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isChecked = (medicineId: string, timing: TimingKey) =>
    !!dailyChecks[`${medicineId}_${timing}`];

  const addMedicine = () => {
    const name = newName.trim();
    if (!name) { setAddError("薬の名前を入力してください"); return; }
    if (newTimings.length === 0) { setAddError("飲む時間帯を選んでください"); return; }
    setMedicines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, timings: newTimings, color: newColor },
    ]);
    setNewName("");
    setNewTimings([]);
    setNewColor(MEDICINE_COLORS[Math.floor(Math.random() * MEDICINE_COLORS.length)]);
    setAddError("");
  };

  const deleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleTiming = (key: TimingKey) => {
    setNewTimings((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const totalDoses = medicines.reduce((sum, m) => sum + m.timings.length, 0);
  const takenDoses = medicines.reduce(
    (sum, m) => sum + m.timings.filter((t) => isChecked(m.id, t)).length, 0
  );
  const allDone = totalDoses > 0 && takenDoses === totalDoses;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FF", fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "24px 20px 20px", color: "white", boxShadow: "0 4px 20px rgba(102,126,234,0.4)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>💊</span>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>お薬管理</h1>
          </div>
          <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
          {totalDoses > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, opacity: 0.9 }}>
                <span>{allDone ? "🎉 今日の分はすべて完了！" : `${takenDoses} / ${totalDoses} 回 服用済み`}</span>
                <span>{Math.round((takenDoses / totalDoses) * 100)}%</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(takenDoses / totalDoses) * 100}%`, background: allDone ? "#48DBB4" : "white", borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <div style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex" }}>
          {([{ key: "today", label: "今日の薬", icon: "📋" }, { key: "manage", label: "薬の管理", icon: "⚙️" }] as const).map((tab) => (
            <button key={tab.key} onClick={() => setView(tab.key)} style={{ flex: 1, padding: "14px 0", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: view === tab.key ? 700 : 400, color: view === tab.key ? "#667eea" : "#999", borderBottom: view === tab.key ? "3px solid #667eea" : "3px solid transparent", transition: "all 0.2s" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px" }}>
        {view === "today" && (
          <div>
            {medicines.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
                <p style={{ color: "#888", fontSize: 15, margin: 0 }}>薬が登録されていません</p>
                <p style={{ color: "#aaa", fontSize: 13, marginTop: 6 }}>「薬の管理」タブから追加してください</p>
                <button onClick={() => setView("manage")} style={{ marginTop: 16, padding: "10px 24px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  薬を追加する
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {TIMING_LABELS.map(({ key, label, icon, time }) => {
                  const meds = medicines.filter((m) => m.timings.includes(key));
                  if (meds.length === 0) return null;
                  const allTaken = meds.every((m) => isChecked(m.id, key));
                  return (
                    <div key={key} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: allTaken ? "2px solid #48DBB4" : "2px solid transparent", transition: "border 0.3s" }}>
                      <div style={{ padding: "12px 16px", background: allTaken ? "linear-gradient(135deg, #48DBB4, #00b894)" : "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{icon}</span>
                          <div>
                            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{label}</div>
                            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{time}</div>
                          </div>
                        </div>
                        {allTaken && <span style={{ background: "rgba(255,255,255,0.3)", color: "white", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 50 }}>✓ 完了</span>}
                      </div>
                      <div style={{ padding: "8px 0" }}>
                        {meds.map((med) => {
                          const checked = isChecked(med.id, key);
                          return (
                            <button key={med.id} onClick={() => toggleCheck(med.id, key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: checked ? "#F0FBF8" : "white", border: "none", cursor: "pointer", transition: "background 0.2s", textAlign: "left" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: checked ? "#48DBB4" : "#eee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", boxShadow: checked ? "0 2px 8px rgba(72,219,180,0.4)" : "none" }}>
                                {checked ? <span style={{ color: "white", fontSize: 14 }}>✓</span> : <div style={{ width: 10, height: 10, borderRadius: "50%", background: med.color }} />}
                              </div>
                              <span style={{ fontSize: 16, fontWeight: 500, color: checked ? "#aaa" : "#333", textDecoration: checked ? "line-through" : "none", transition: "all 0.2s" }}>{med.name}</span>
                              {!checked && <span style={{ marginLeft: "auto", fontSize: 12, color: "#ccc" }}>タップして服用</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {allDone && (
                  <div style={{ textAlign: "center", padding: "24px", background: "linear-gradient(135deg, #48DBB4, #00b894)", borderRadius: 16, color: "white", boxShadow: "0 4px 20px rgba(72,219,180,0.4)" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>今日の薬はすべて飲みました！</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>お疲れさまです</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === "manage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: "0 0 16px" }}>➕ 薬を追加</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 6 }}>薬の名前</label>
                <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setAddError(""); }} onKeyDown={(e) => e.key === "Enter" && addMedicine()} placeholder="例：血圧の薬、胃腸薬..." style={{ width: "100%", padding: "12px 14px", border: "2px solid #eee", borderRadius: 10, fontSize: 15, outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "#667eea")} onBlur={(e) => (e.target.style.borderColor = "#eee")} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 8 }}>飲む時間帯（複数選択可）</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {TIMING_LABELS.map(({ key, label, icon }) => {
                    const selected = newTimings.includes(key);
                    return (
                      <button key={key} onClick={() => toggleTiming(key)} style={{ padding: "10px", border: `2px solid ${selected ? "#667eea" : "#eee"}`, borderRadius: 10, background: selected ? "#EEF2FF" : "white", cursor: "pointer", fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? "#667eea" : "#888", transition: "all 0.2s" }}>
                        {icon} {key === "morning" ? "朝" : key === "noon" ? "昼" : key === "evening" ? "夕" : "寝る前"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 8 }}>色</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {MEDICINE_COLORS.map((color) => (
                    <button key={color} onClick={() => setNewColor(color)} style={{ width: 28, height: 28, borderRadius: "50%", background: color, border: newColor === color ? "3px solid #333" : "3px solid transparent", cursor: "pointer", flexShrink: 0, transition: "transform 0.15s", transform: newColor === color ? "scale(1.2)" : "scale(1)" }} />
                  ))}
                </div>
              </div>
              {addError && <p style={{ color: "#e74c3c", fontSize: 13, margin: "0 0 10px" }}>⚠️ {addError}</p>}
              <button onClick={addMedicine} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                追加する
              </button>
            </div>

            {medicines.length > 0 && (
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "16px 20px 8px" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0 }}>📋 登録中の薬（{medicines.length}種類）</h2>
                </div>
                {medicines.map((med, i) => (
                  <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderTop: i === 0 ? "none" : "1px solid #f5f5f5" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: med.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>{med.name}</div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                        {med.timings.map((t) => TIMING_LABELS.find((tl) => tl.key === t)?.label).join(" · ")}
                      </div>
                    </div>
                    <button onClick={() => deleteMedicine(med.id)} style={{ padding: "6px 12px", background: "#FFF0F0", color: "#e74c3c", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>削除</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
