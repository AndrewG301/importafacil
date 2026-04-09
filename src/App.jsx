import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────
const round2 = (n) => Math.round(n * 100) / 100;
const fmtS = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
const CAT_LABEL = { ropa: "Ropa", zapatillas: "Zapatillas", accesorios: "Accesorios" };
const CAT_EMOJI = { ropa: "👕", zapatillas: "👟", accesorios: "👜" };
const CAT_COLOR = {
  ropa: { bg: "#ede9fe", text: "#5b21b6" },
  zapatillas: { bg: "#d1fae5", text: "#065f46" },
  accesorios: { bg: "#fef3c7", text: "#92400e" },
};

function Badge({ cat }) {
  const c = CAT_COLOR[cat] || CAT_COLOR.ropa;
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{CAT_LABEL[cat] || cat}</span>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#1a1a3e 50%,#141428 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0", paddingBottom: 60 },
  header: { background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 10 },
  logo: { fontSize: 19, fontWeight: 700, letterSpacing: -0.5, color: "#fff", display: "flex", alignItems: "center", gap: 8 },
  nav: { display: "flex", gap: 3, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 3, flexWrap: "wrap" },
  navBtn: (a) => ({ padding: "6px 14px", borderRadius: 7, border: "none", background: a ? "rgba(129,140,248,0.25)" : "transparent", color: a ? "#a5b4fc" : "#94a3b8", fontWeight: a ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }),
  main: { maxWidth: 980, margin: "0 auto", padding: "24px 18px" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "20px 22px", marginBottom: 14 },
  cardTitle: { fontSize: 12, fontWeight: 700, color: "#a5b4fc", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1.1 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 11 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
  input: { padding: "8px 11px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" },
  select: { padding: "8px 11px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "#1e1b4b", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" },
  textarea: { padding: "8px 11px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6 },
  btn: { padding: "7px 16px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, background: "rgba(255,255,255,0.07)", color: "#e2e8f0", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnSm: { padding: "4px 10px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  btnPrimary: { padding: "8px 18px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnSuccess: { padding: "8px 18px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#059669,#34d399)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnDanger: { padding: "5px 12px", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 7, background: "rgba(248,113,113,0.08)", color: "#f87171", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  metric: { background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.18)", borderRadius: 11, padding: "13px 14px", textAlign: "center" },
  metricLabel: { fontSize: 10, color: "#94a3b8", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.9 },
  metricVal: { fontSize: 20, fontWeight: 700, color: "#a5b4fc" },
  divider: { height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 0" },
  uploadArea: { border: "2px dashed rgba(129,140,248,0.35)", borderRadius: 12, padding: "26px", textAlign: "center", cursor: "pointer", background: "rgba(99,102,241,0.05)" },
  aiBox: { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#c7d2fe", lineHeight: 1.6, marginTop: 10 },
  marketBox: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "13px", fontSize: 13, color: "#e2e8f0", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "monospace" },
  tag: { fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.07)", color: "#94a3b8" },
  scenario: (hi) => ({ border: hi ? "1.5px solid #818cf8" : "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "14px", textAlign: "center", background: hi ? "rgba(129,140,248,0.1)" : "rgba(255,255,255,0.02)" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modalBox: { background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "24px", width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto" },
  spinner: { display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#a5b4fc", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};

// ── CostoInput ────────────────────────────────────────────────────────────────
function CostoInput({ onChange, tc }) {
  const [cur, setCur] = useState("SOL");
  const [raw, setRaw] = useState("");
  const handle = (v, c) => { setRaw(v); onChange(c === "USD" ? (parseFloat(v) || 0) * tc : (parseFloat(v) || 0)); };
  return (
    <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
      <select value={cur} onChange={e => { setCur(e.target.value); handle(raw, e.target.value); }}
        style={{ padding: "8px 7px", border: "none", borderRight: "1px solid rgba(255,255,255,0.12)", background: "#1e1b4b", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", width: 66 }}>
        <option value="SOL">S/</option><option value="USD">USD</option>
      </select>
      <input type="number" placeholder="0.00" value={raw} onChange={e => handle(e.target.value, cur)}
        style={{ padding: "8px 11px", border: "none", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", flex: 1, width: 0 }} />
    </div>
  );
}

// ── Modal editar pedido ───────────────────────────────────────────────────────
function EditarPedidoModal({ pedido, tc, onSave, onClose }) {
  const [nombre, setNombre] = useState(pedido.nombre);
  const [fecha, setFecha] = useState(pedido.fecha);
  const [agente, setAgente] = useState(pedido.agente || "");
  const [costos, setCostos] = useState({ china: pedido.costo_china, flete: pedido.costo_flete, comision: pedido.costo_comision, aduana: pedido.costo_aduana, local: pedido.costo_local, otros: pedido.costo_otros });
  const [prods, setProds] = useState(pedido.productos.map(p => ({ ...p })));
  const [saving, setSaving] = useState(false);

  const gExtra = (costos.flete || 0) + (costos.comision || 0) + (costos.aduana || 0) + (costos.local || 0) + (costos.otros || 0);
  const cpTotal = prods.reduce((s, p) => s + (p.costo || 0), 0) || 1;
  const totalEdit = Object.values(costos).reduce((a, b) => a + (b || 0), 0);
  const costoRealEdit = (p) => round2((p.costo || 0) + gExtra * ((p.costo || 0) / cpTotal));

  const guardar = async () => {
    setSaving(true);
    const ps = prods.map(p => {
      const cR = costoRealEdit(p);
      const pv = p.precio_venta || round2(cR * 1.6);
      return { ...p, costo_real: cR, precio_venta: pv, ganancia: round2(pv - cR) };
    });
    const totalVenta = round2(ps.reduce((s, p) => s + p.precio_venta, 0));
    const totalGanancia = round2(ps.reduce((s, p) => s + p.ganancia, 0));

    const { error } = await supabase.from("pedidos").update({
      nombre, fecha, agente,
      costo_china: costos.china, costo_flete: costos.flete, costo_comision: costos.comision,
      costo_aduana: costos.aduana, costo_local: costos.local, costo_otros: costos.otros,
      total_costos: totalEdit, total_venta: totalVenta, total_ganancia: totalGanancia,
    }).eq("id", pedido.id);

    if (!error) {
      for (const p of ps) {
        await supabase.from("productos").update({ precio_venta: p.precio_venta, ganancia: p.ganancia, costo_real: p.costo_real }).eq("id", p.id);
      }
      onSave();
    } else {
      alert("Error al guardar: " + error.message);
    }
    setSaving(false);
  };

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>✏️ Editar pedido</div>
          <button style={S.btnSm} onClick={onClose}>✕ Cerrar</button>
        </div>
        <div style={{ ...S.cardTitle, marginBottom: 10 }}>Datos del pedido</div>
        <div style={{ ...S.grid2, marginBottom: 16 }}>
          <div style={S.field}><span style={S.label}>Nombre</span><input style={S.input} value={nombre} onChange={e => setNombre(e.target.value)} /></div>
          <div style={S.field}><span style={S.label}>Fecha</span><input type="date" style={S.input} value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div style={S.field}><span style={S.label}>Agente</span><input style={S.input} value={agente} onChange={e => setAgente(e.target.value)} /></div>
        </div>
        <div style={{ ...S.cardTitle, marginBottom: 10 }}>Costos (S/)</div>
        <div style={{ ...S.grid2, marginBottom: 6 }}>
          {[["china", "Productos China"], ["flete", "Flete"], ["comision", "Comisión agente"], ["aduana", "Aduana/impuestos"], ["local", "Envío local"], ["otros", "Otros"]].map(([k, lbl]) => (
            <div key={k} style={S.field}>
              <span style={S.label}>{lbl}</span>
              <input type="number" style={S.input} value={costos[k] || ""} placeholder="0.00" onChange={e => setCostos(c => ({ ...c, [k]: parseFloat(e.target.value) || 0 }))} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600, marginBottom: 16 }}>Total: {fmtS(totalEdit)}</div>
        <div style={{ ...S.cardTitle, marginBottom: 10 }}>Precio de venta por producto</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Producto", "Cat.", "Costo real", "Precio venta (S/)", "Ganancia"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: h === "Producto" ? "left" : "right", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prods.map((p, i) => {
                const cR = costoRealEdit(p);
                const venta = p.precio_venta || cR;
                const gan = round2(venta - cR);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        {p.imagen_url ? <img src={p.imagen_url} alt="" style={{ width: 26, height: 26, borderRadius: 5, objectFit: "cover" }} /> : <span>{CAT_EMOJI[p.categoria]}</span>}
                        <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px", textAlign: "right" }}><Badge cat={p.categoria} /></td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#94a3b8" }}>{fmtS(cR)}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      <input type="number" value={venta} step="0.5"
                        onChange={e => setProds(ps => ps.map((pr, j) => j === i ? { ...pr, precio_venta: parseFloat(e.target.value) || 0 } : pr))}
                        style={{ ...S.input, width: 100, padding: "5px 8px", fontSize: 13, textAlign: "right" }} />
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", color: gan >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>{fmtS(gan)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button style={S.btn} onClick={onClose}>Cancelar</button>
          <button style={S.btnPrimary} onClick={guardar} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal API Key ─────────────────────────────────────────────────────────────
function ApiKeyModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey);
  const [show, setShow] = useState(false);
  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modalBox, maxWidth: 500 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>🤖 Configurar API Key de Gemini (Gratis)</div>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.7 }}>La IA de Google Gemini analiza fotos y genera descripciones automáticamente. Es completamente gratis.</p>
        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, lineHeight: 1.9, color: "#c7d2fe" }}>
          <strong style={{ color: "#a5b4fc" }}>Cómo obtenerla (100% gratis):</strong><br />
          1. Ve a <strong>aistudio.google.com</strong><br />
          2. Inicia sesión con tu cuenta Google<br />
          3. Click en <strong>"Get API Key"</strong> → <strong>"Create API key"</strong><br />
          4. Copia la key (<code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>AIza...</code>)
        </div>
        <div style={S.field}>
          <span style={S.label}>Tu API Key</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input type={show ? "text" : "password"} value={key} onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-api03-..." style={{ ...S.input, flex: 1, fontFamily: "monospace", fontSize: 13 }} />
            <button style={S.btnSm} onClick={() => setShow(!show)}>{show ? "Ocultar" : "Ver"}</button>
          </div>
          <span style={{ fontSize: 11, color: "#4a5568" }}>Guardada en tu navegador. Nadie más la ve.</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button style={S.btn} onClick={onClose}>Cancelar</button>
          <button style={S.btnPrimary} onClick={() => onSave(key)}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("pedido");
  const [tc, setTc] = useState(() => parseFloat(localStorage.getItem("if_tc")) || 3.75);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("if_apikey") || import.meta.env.VITE_GEMINI_KEY || "");
  const [showApiModal, setShowApiModal] = useState(false);

  // Pedido actual (borrador en memoria)
  const [pedidoNombre, setPedidoNombre] = useState("");
  const [pedidoFecha, setPedidoFecha] = useState(new Date().toISOString().slice(0, 10));
  const [pedidoAgente, setPedidoAgente] = useState("");
  const [costos, setCostos] = useState({ china: 0, flete: 0, comision: 0, aduana: 0, local: 0, otros: 0 });
  const [productosActuales, setProductosActuales] = useState([]);

  // Historial desde Supabase
  const [historial, setHistorial] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [editandoPedido, setEditandoPedido] = useState(null);

  // Producto form
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [aiMsg, setAiMsg] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [prodForm, setProdForm] = useState({ nombre: "", cat: "ropa", talla: "", costo: "", costoCur: "USD", qty: 1, color: "", desc: "" });
  const fileRef = useRef();

  // Precios
  const [precioCustoms, setPrecioCustoms] = useState({});
  const [pctA, setPctA] = useState(30);
  const [pctB, setPctB] = useState(60);
  const [pctC, setPctC] = useState(100);

  // Marketplace
  const [mpIdx, setMpIdx] = useState("");
  const [mpPct, setMpPct] = useState(60);
  const [mpCustom, setMpCustom] = useState("");

  // Saving
  const [saving, setSaving] = useState(false);

  // ── Cargar historial ──────────────────────────────────────────────────────────
  const cargarHistorial = useCallback(async () => {
    setLoadingHist(true);
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoadingHist(false); return; }

    const pedidosConProductos = await Promise.all(
      pedidos.map(async (ped) => {
        const { data: prods } = await supabase
          .from("productos")
          .select("*")
          .eq("pedido_id", ped.id)
          .order("created_at", { ascending: true });
        return { ...ped, productos: prods || [] };
      })
    );
    setHistorial(pedidosConProductos);
    setLoadingHist(false);
  }, []);

  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  // Guardar TC en localStorage al cambiar
  useEffect(() => { localStorage.setItem("if_tc", tc); }, [tc]);

  // ── API Key ───────────────────────────────────────────────────────────────────
  const guardarApiKey = (k) => { setApiKey(k); localStorage.setItem("if_apikey", k); setShowApiModal(false); };

  // ── Llamar Gemini ─────────────────────────────────────────────────────────────
  const llamarGemini = async (prompt, base64, mediaType) => {
    if (!apiKey) { alert("Configura tu API Key de Gemini primero (botón 🤖 IA arriba)."); return null; }
    const parts = [];
    if (base64 && mediaType) {
      parts.push({ inline_data: { mime_type: mediaType, data: base64 } });
    }
    parts.push({ text: prompt });
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const analizarFoto = async (base64, mediaType) => {
    setAiLoading(true); setAiMsg("🤖 Analizando imagen con IA...");
    try {
      const text = await llamarGemini(
        'Eres asistente de importaciones en Perú. Analiza esta imagen y responde SOLO en JSON sin backticks ni texto extra: {"nombre":"nombre comercial atractivo","categoria":"ropa|zapatillas|accesorios","talla_sugerida":"talla típica o vacío","color":"color principal","descripcion":"descripción 2-3 oraciones atractiva para Facebook Marketplace peruano"}',
        base64, mediaType
      );
      if (!text) return;
      const info = JSON.parse(text.replace(/```json|```/g, "").trim());
      setProdForm(f => ({ ...f, nombre: info.nombre || "", cat: info.categoria || "ropa", talla: info.talla_sugerida || "", color: info.color || "", desc: info.descripcion || "" }));
      setAiMsg("✅ IA detectó: " + (CAT_LABEL[info.categoria] || "Producto") + " — " + (info.nombre || ""));
    } catch (e) { setAiMsg("❌ Error: " + e.message); }
    setAiLoading(false);
  };

  const generarDesc = async () => {
    if (!prodForm.nombre) return alert("Ingresa el nombre primero.");
    setAiLoading(true); setAiMsg("🤖 Generando descripción...");
    try {
      const desc = await llamarGemini(
        `Genera descripción 2-3 oraciones atractiva para Facebook Marketplace peruano del producto: "${prodForm.nombre}", categoría: ${CAT_LABEL[prodForm.cat] || prodForm.cat}${prodForm.color ? ", color: " + prodForm.color : ""}${prodForm.talla ? ", talla: " + prodForm.talla : ""}. Solo la descripción, sin comillas.`
      );
      if (desc) { setProdForm(f => ({ ...f, desc: desc.trim() })); setAiMsg("✅ Descripción generada."); }
    } catch (e) { setAiMsg("❌ Error: " + e.message); }
    setAiLoading(false);
  };

  const procesarFoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoPreview(ev.target.result);
      analizarFoto(ev.target.result.split(",")[1], file.type);
    };
    reader.readAsDataURL(file);
  };

  // ── Cálculos ──────────────────────────────────────────────────────────────────
  const totalCostos = Object.values(costos).reduce((a, b) => a + b, 0);
  const gastosExtra = costos.flete + costos.comision + costos.aduana + costos.local + costos.otros;
  const cpTotal = productosActuales.reduce((s, p) => s + p.costo, 0) || 1;
  const costoReal = (p) => round2(p.costo + gastosExtra * (p.costo / cpTotal));
  const precioFinal = (p) => {
    const c = precioCustoms[p.tempId];
    return (c !== undefined && c !== "") ? (parseFloat(c) || 0) : round2(costoReal(p) * (1 + pctB / 100));
  };
  const gananciaTotal = productosActuales.reduce((s, p) => s + round2(precioFinal(p) - costoReal(p)), 0);
  const ventaTotal = productosActuales.reduce((s, p) => s + precioFinal(p), 0);

  // ── Agregar producto al borrador ──────────────────────────────────────────────
  const agregarProducto = () => {
    if (!prodForm.nombre) return alert("Ingresa el nombre del producto.");
    const cn = parseFloat(prodForm.costo) || 0;
    const cSoles = prodForm.costoCur === "USD" ? cn * tc : cn;
    const qty = parseInt(prodForm.qty) || 1;
    const nuevos = Array.from({ length: qty }, (_, i) => ({
      tempId: Date.now() + i, nombre: prodForm.nombre, cat: prodForm.cat,
      talla: prodForm.talla, costo: cSoles, color: prodForm.color,
      desc: prodForm.desc, fotoFile, fotoPreview,
    }));
    setProductosActuales(p => [...p, ...nuevos]);
    setFotoFile(null); setFotoPreview(null); setAiMsg(null);
    setProdForm({ nombre: "", cat: "ropa", talla: "", costo: "", costoCur: "USD", qty: 1, color: "", desc: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Guardar pedido en Supabase ────────────────────────────────────────────────
  const guardarPedido = async () => {
    if (!pedidoNombre) return alert("Ingresa el nombre del pedido.");
    if (!productosActuales.length) return alert("Agrega al menos un producto.");
    setSaving(true);

    // 1. Calcular totales
    const ps = productosActuales.map(p => {
      const cR = costoReal(p);
      const c = precioCustoms[p.tempId];
      const pv = (c !== undefined && c !== "") ? (parseFloat(c) || round2(cR * 1.6)) : round2(cR * (1 + pctB / 100));
      return { ...p, costoReal: cR, precioVenta: pv, ganancia: round2(pv - cR) };
    });
    const totalVenta = round2(ps.reduce((s, p) => s + p.precioVenta, 0));
    const totalGanancia = round2(ps.reduce((s, p) => s + p.ganancia, 0));

    // 2. Insertar pedido
    const { data: pedidoDB, error: errPed } = await supabase.from("pedidos").insert({
      nombre: pedidoNombre, fecha: pedidoFecha, agente: pedidoAgente, tc,
      costo_china: costos.china, costo_flete: costos.flete, costo_comision: costos.comision,
      costo_aduana: costos.aduana, costo_local: costos.local, costo_otros: costos.otros,
      total_costos: totalCostos, total_venta: totalVenta, total_ganancia: totalGanancia,
    }).select().single();

    if (errPed) { alert("Error al guardar pedido: " + errPed.message); setSaving(false); return; }

    // 3. Subir imágenes y guardar productos
    for (const p of ps) {
      let imagen_url = null;
      if (p.fotoFile) {
        const ext = p.fotoFile.name.split(".").pop();
        const path = `${pedidoDB.id}/${p.tempId}.${ext}`;
        const { error: errImg } = await supabase.storage.from("imagenes").upload(path, p.fotoFile, { upsert: true });
        if (!errImg) {
          const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path);
          imagen_url = urlData.publicUrl;
        }
      }
      await supabase.from("productos").insert({
        pedido_id: pedidoDB.id, nombre: p.nombre, categoria: p.cat,
        talla: p.talla, color: p.color, descripcion: p.desc,
        costo: p.costo, costo_real: p.costoReal,
        precio_venta: p.precioVenta, ganancia: p.ganancia,
        imagen_url,
      });
    }

    // 4. Reset
    setPedidoNombre(""); setPedidoFecha(new Date().toISOString().slice(0, 10));
    setPedidoAgente(""); setCostos({ china: 0, flete: 0, comision: 0, aduana: 0, local: 0, otros: 0 });
    setProductosActuales([]); setPrecioCustoms({});
    setSaving(false);
    await cargarHistorial();
    setTab("historial");
  };

  // ── Eliminar pedido ───────────────────────────────────────────────────────────
  const eliminarPedido = async (id) => {
    if (!window.confirm("¿Eliminar este pedido?")) return;
    await supabase.from("pedidos").delete().eq("id", id);
    setHistorial(h => h.filter(p => p.id !== id));
  };

  const copiar = (t) => navigator.clipboard.writeText(t).then(() => alert("Texto copiado.")).catch(() => alert("Selecciona el texto manualmente."));

  // ── Marketplace ───────────────────────────────────────────────────────────────
  const mpProd = mpIdx !== "" ? productosActuales[parseInt(mpIdx)] : null;
  const mpCosto = mpProd ? costoReal(mpProd) : 0;
  const mpSug = mpProd ? round2(mpCosto * (1 + mpPct / 100)) : 0;
  const mpFinal = mpCustom ? (parseFloat(mpCustom) || mpSug) : mpSug;
  const mpGan = round2(mpFinal - mpCosto);
  const mpTexto = mpProd
    ? `${mpProd.nombre.toUpperCase()}${mpProd.talla ? " - Talla " + mpProd.talla : ""}${mpProd.color ? " - " + mpProd.color : ""}\n\n💰 Precio: S/ ${mpFinal.toFixed(2)}\n\n${mpProd.desc || ""}\n\n✅ Producto importado de calidad\n${mpProd.talla ? "📐 Talla: " + mpProd.talla + "\n" : ""}${mpProd.color ? "🎨 Color: " + mpProd.color + "\n" : ""}📦 Envío disponible / Recojo en tienda\n📲 Escríbenos para más información\n💳 Transferencias y efectivo`
    : "";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>

      {editandoPedido && <EditarPedidoModal pedido={editandoPedido} tc={tc} onSave={async () => { setEditandoPedido(null); await cargarHistorial(); }} onClose={() => setEditandoPedido(null)} />}
      {showApiModal && <ApiKeyModal apiKey={apiKey} onSave={guardarApiKey} onClose={() => setShowApiModal(false)} />}

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <span style={{ fontSize: 22 }}>📦</span>
          <span>Importa<span style={{ color: "#818cf8" }}>Fácil</span></span>
          <span style={{ fontSize: 11, color: "#4a5568", fontWeight: 400 }}>China → Perú</span>
        </div>
        <nav style={S.nav}>
          {[["pedido", "Nuevo Pedido"], ["productos", "Productos"], ["precios", "Precios"], ["marketplace", "Marketplace"], ["historial", "Historial"]].map(([id, lbl]) => (
            <button key={id} style={S.navBtn(tab === id)} onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setShowApiModal(true)}
            style={{ padding: "5px 12px", border: apiKey ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(248,113,113,0.3)", borderRadius: 7, background: apiKey ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: apiKey ? "#34d399" : "#f87171", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            🤖 IA {apiKey ? "✓" : "⚠️"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>TC: 1 USD =</span>
            <input type="number" value={tc} onChange={e => setTc(parseFloat(e.target.value) || 3.75)} step="0.01"
              style={{ ...S.input, width: 66, fontSize: 13, padding: "5px 8px" }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>S/</span>
          </div>
        </div>
      </div>

      <div style={S.main}>

        {/* ── NUEVO PEDIDO ──────────────────────────────────────────────── */}
        {tab === "pedido" && <>
          <div style={S.card}>
            <div style={S.cardTitle}>Datos del pedido</div>
            <div style={S.grid2}>
              <div style={S.field}><span style={S.label}>Nombre del pedido</span><input style={S.input} value={pedidoNombre} onChange={e => setPedidoNombre(e.target.value)} placeholder="Ej: Pedido Mayo 2025" /></div>
              <div style={S.field}><span style={S.label}>Fecha</span><input type="date" style={S.input} value={pedidoFecha} onChange={e => setPedidoFecha(e.target.value)} /></div>
              <div style={S.field}><span style={S.label}>Agente / Proveedor</span><input style={S.input} value={pedidoAgente} onChange={e => setPedidoAgente(e.target.value)} placeholder="Nombre del agente" /></div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Costos del pedido</div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Elige USD o S/ en cada campo · TC actual: 1 USD = {tc} S/</p>
            <div style={S.grid2}>
              {[["china", "Costo total productos en China"], ["flete", "Flete China → Perú"], ["comision", "Comisión del agente"], ["aduana", "Impuestos / aduana"], ["local", "Envío local Perú"], ["otros", "Otros gastos"]].map(([k, lbl]) => (
                <div key={k} style={S.field}>
                  <span style={S.label}>{lbl}</span>
                  <CostoInput tc={tc} onChange={v => setCostos(c => ({ ...c, [k]: v }))} />
                </div>
              ))}
            </div>
            <div style={S.divider} />
            <div style={S.grid3}>
              <div style={S.metric}><div style={S.metricLabel}>Costo productos</div><div style={S.metricVal}>{fmtS(costos.china)}</div></div>
              <div style={S.metric}><div style={S.metricLabel}>Gastos adicionales</div><div style={S.metricVal}>{fmtS(gastosExtra)}</div></div>
              <div style={{ ...S.metric, background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.28)" }}>
                <div style={S.metricLabel}>Total pedido</div>
                <div style={{ ...S.metricVal, fontSize: 24 }}>{fmtS(totalCostos)}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={S.btnPrimary} onClick={() => setTab("productos")}>Continuar → Agregar productos</button>
          </div>
        </>}

        {/* ── PRODUCTOS ─────────────────────────────────────────────────── */}
        {tab === "productos" && <>
          <div style={S.card}>
            <div style={S.cardTitle}>Agregar producto</div>
            {!fotoPreview ? (
              <div style={S.uploadArea} onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#c7d2fe" }}>Subir foto → IA analiza automáticamente</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>{apiKey ? "✅ API Key configurada — la IA detectará todo" : "⚠️ Configura tu API Key (botón 🤖 arriba)"}</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={procesarFoto} />
              </div>
            ) : (
              <div>
                <img src={fotoPreview} alt="producto" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 10, marginBottom: 8 }} />
                {aiMsg && <div style={S.aiBox}>{aiMsg}</div>}
                <button style={{ ...S.btnSm, marginTop: 8 }} onClick={() => { setFotoFile(null); setFotoPreview(null); setAiMsg(null); if (fileRef.current) fileRef.current.value = ""; }}>🔄 Cambiar foto</button>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <div style={S.grid2}>
                <div style={S.field}><span style={S.label}>Nombre del producto</span><input style={S.input} value={prodForm.nombre} onChange={e => setProdForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Zapatilla Nike Air Max" /></div>
                <div style={S.field}><span style={S.label}>Categoría</span>
                  <select style={S.select} value={prodForm.cat} onChange={e => setProdForm(f => ({ ...f, cat: e.target.value }))}>
                    <option value="ropa">Ropa</option><option value="zapatillas">Zapatillas</option><option value="accesorios">Accesorios</option>
                  </select>
                </div>
                <div style={S.field}><span style={S.label}>Talla</span><input style={S.input} value={prodForm.talla} onChange={e => setProdForm(f => ({ ...f, talla: e.target.value }))} placeholder="M, L, 40, Único..." /></div>
                <div style={S.field}><span style={S.label}>Color</span><input style={S.input} value={prodForm.color} onChange={e => setProdForm(f => ({ ...f, color: e.target.value }))} placeholder="Negro, Azul..." /></div>
                <div style={S.field}>
                  <span style={S.label}>Costo unitario</span>
                  <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <select value={prodForm.costoCur} onChange={e => setProdForm(f => ({ ...f, costoCur: e.target.value }))}
                      style={{ padding: "8px 7px", border: "none", borderRight: "1px solid rgba(255,255,255,0.12)", background: "#1e1b4b", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", width: 66 }}>
                      <option value="USD">USD</option><option value="SOL">S/</option>
                    </select>
                    <input type="number" placeholder="0.00" value={prodForm.costo} onChange={e => setProdForm(f => ({ ...f, costo: e.target.value }))}
                      style={{ padding: "8px 11px", border: "none", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", flex: 1, width: 0 }} />
                  </div>
                  {prodForm.costo && <span style={{ fontSize: 11, color: "#64748b" }}>= {fmtS(prodForm.costoCur === "USD" ? (parseFloat(prodForm.costo) || 0) * tc : parseFloat(prodForm.costo) || 0)}</span>}
                </div>
                <div style={S.field}><span style={S.label}>Cantidad</span><input type="number" style={S.input} value={prodForm.qty} onChange={e => setProdForm(f => ({ ...f, qty: e.target.value }))} min="1" /></div>
              </div>
              <div style={{ ...S.field, marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={S.label}>Descripción para Marketplace</span>
                  <button style={{ ...S.btnSm, background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }} onClick={generarDesc} disabled={aiLoading}>
                    {aiLoading ? "⏳ Generando..." : "🤖 Generar con IA"}
                  </button>
                </div>
                <textarea style={S.textarea} rows={3} value={prodForm.desc} onChange={e => setProdForm(f => ({ ...f, desc: e.target.value }))} placeholder="Descripción del producto..." />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button style={S.btnPrimary} onClick={agregarProducto}>+ Agregar producto</button>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Productos del pedido: <span style={{ color: "#e2e8f0", textTransform: "none", letterSpacing: 0 }}>{pedidoNombre || "—"}</span></div>
            {!productosActuales.length
              ? <p style={{ fontSize: 13, color: "#64748b" }}>Sin productos aún.</p>
              : productosActuales.map((p, i) => {
                const cR = costoReal(p);
                return (
                  <div key={p.tempId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < productosActuales.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {p.fotoPreview ? <img src={p.fotoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>{CAT_EMOJI[p.cat]}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nombre}</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                        <Badge cat={p.cat} />
                        {p.talla && <span style={S.tag}>Talla: {p.talla}</span>}
                        {p.color && <span style={S.tag}>{p.color}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>Costo: {fmtS(p.costo)}</div>
                      <div style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>c/gastos: {fmtS(cR)}</div>
                    </div>
                    <button style={{ ...S.btnSm, color: "#f87171" }} onClick={() => setProductosActuales(ps => ps.filter((_, j) => j !== i))}>✕</button>
                  </div>
                );
              })
            }
          </div>
          {productosActuales.length > 0 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button style={S.btn} onClick={() => setTab("precios")}>Ver precios →</button>
              <button style={S.btnSuccess} onClick={guardarPedido} disabled={saving}>
                {saving ? "💾 Guardando en Supabase..." : "💾 Guardar pedido"}
              </button>
            </div>
          )}
        </>}

        {/* ── PRECIOS ───────────────────────────────────────────────────── */}
        {tab === "precios" && <>
          <div style={S.card}>
            <div style={S.cardTitle}>Resumen del pedido</div>
            <div style={S.grid3}>
              <div style={S.metric}><div style={S.metricLabel}>Costo total</div><div style={S.metricVal}>{fmtS(totalCostos)}</div></div>
              <div style={S.metric}><div style={S.metricLabel}>Productos</div><div style={S.metricVal}>{productosActuales.length}</div></div>
              <div style={S.metric}><div style={S.metricLabel}>Costo prom./unidad</div><div style={S.metricVal}>{fmtS(productosActuales.length ? totalCostos / productosActuales.length : 0)}</div></div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Escenarios de ganancia</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 16 }}>
              {[["A — Conservador", pctA, setPctA, false], ["B — Objetivo", pctB, setPctB, true], ["C — Premium", pctC, setPctC, false]].map(([lbl, pct, setPct, hi]) => {
                const prom = productosActuales.length ? totalCostos / productosActuales.length : 0;
                const vEj = round2(prom * (1 + pct / 100));
                return (
                  <div key={lbl} style={S.scenario(hi)}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 7 }}>{lbl}</div>
                    <input type="range" min="5" max="300" step="5" value={pct} onChange={e => setPct(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#818cf8", marginBottom: 6 }} />
                    <div style={{ fontSize: 22, fontWeight: 700, color: hi ? "#a5b4fc" : "#e2e8f0" }}>{pct}%</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>Venta ej: {fmtS(vEj)}</div>
                    <div style={{ fontSize: 12, color: "#34d399", marginTop: 1 }}>+{fmtS(round2(vEj - prom))} / ud.</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: 11, padding: "14px 16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.9, marginBottom: 4 }}>Ganancia neta total (escenario B {pctB}%)</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#34d399" }}>{fmtS(gananciaTotal)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.9, marginBottom: 4 }}>Total venta estimada</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#a5b4fc" }}>{fmtS(ventaTotal)}</div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Precio por producto — edita tu precio de venta</div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Escribe tu precio en la columna "Tu precio" para sobreescribir el sugerido. Se guarda al hacer click en "Guardar pedido".</p>
            {!productosActuales.length
              ? <p style={{ fontSize: 13, color: "#64748b" }}>Agrega productos primero.</p>
              : <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Producto", "Cat.", "Costo China", "Gastos prop.", "Costo real", `Sugerido ${pctB}%`, "Tu precio (S/)", "Ganancia"].map(h => (
                        <th key={h} style={{ padding: "7px 9px", textAlign: h === "Producto" ? "left" : "right", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productosActuales.map(p => {
                      const prop = p.costo / cpTotal;
                      const gP = gastosExtra * prop;
                      const cR = round2(p.costo + gP);
                      const sug = round2(cR * (1 + pctB / 100));
                      const custom = precioCustoms[p.tempId] !== undefined ? precioCustoms[p.tempId] : "";
                      const pF = custom !== "" ? (parseFloat(custom) || 0) : sug;
                      const gan = round2(pF - cR);
                      return (
                        <tr key={p.tempId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "9px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {p.fotoPreview ? <img src={p.fotoPreview} alt="" style={{ width: 30, height: 30, borderRadius: 5, objectFit: "cover" }} /> : <span>{CAT_EMOJI[p.cat]}</span>}
                              <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                            </div>
                          </td>
                          <td style={{ padding: "9px", textAlign: "right" }}><Badge cat={p.cat} /></td>
                          <td style={{ padding: "9px", textAlign: "right", color: "#94a3b8" }}>{fmtS(p.costo)}</td>
                          <td style={{ padding: "9px", textAlign: "right", color: "#64748b" }}>{fmtS(gP)}</td>
                          <td style={{ padding: "9px", textAlign: "right" }}>{fmtS(cR)}</td>
                          <td style={{ padding: "9px", textAlign: "right", color: "#a5b4fc" }}>{fmtS(sug)}</td>
                          <td style={{ padding: "9px", textAlign: "right" }}>
                            <input type="number" placeholder={sug.toFixed(2)} value={custom} step="0.5"
                              onChange={e => setPrecioCustoms(pc => ({ ...pc, [p.tempId]: e.target.value }))}
                              style={{ ...S.input, width: 95, fontSize: 13, padding: "5px 7px", textAlign: "right" }} />
                          </td>
                          <td style={{ padding: "9px", textAlign: "right", color: gan >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>{fmtS(gan)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <td colSpan={5} style={{ padding: "9px", fontWeight: 700, color: "#64748b", fontSize: 12 }}>TOTALES</td>
                      <td />
                      <td style={{ padding: "9px", textAlign: "right", fontWeight: 700, color: "#a5b4fc" }}>{fmtS(ventaTotal)}</td>
                      <td style={{ padding: "9px", textAlign: "right", fontWeight: 700, color: "#34d399" }}>{fmtS(gananciaTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            }
          </div>
          {productosActuales.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={S.btnSuccess} onClick={guardarPedido} disabled={saving}>{saving ? "Guardando..." : "💾 Guardar pedido"}</button>
            </div>
          )}
        </>}

        {/* ── MARKETPLACE ───────────────────────────────────────────────── */}
        {tab === "marketplace" && <>
          <div style={S.card}>
            <div style={S.cardTitle}>Generador de publicación — Facebook Marketplace</div>
            <div style={S.field}>
              <span style={S.label}>Selecciona un producto del pedido actual</span>
              <select style={S.select} value={mpIdx} onChange={e => { setMpIdx(e.target.value); setMpCustom(""); }}>
                <option value="">— Elige un producto —</option>
                {productosActuales.map((p, i) => <option key={p.tempId} value={i}>{CAT_EMOJI[p.cat]} {p.nombre} {p.talla ? `(${p.talla})` : ""}</option>)}
              </select>
            </div>

            {mpProd && <>
              <div style={S.divider} />
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>% de ganancia</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>{mpPct}%</span>
                </div>
                <input type="range" min="5" max="300" step="5" value={mpPct} onChange={e => { setMpPct(parseInt(e.target.value)); setMpCustom(""); }} style={{ width: "100%", accentColor: "#818cf8" }} />
              </div>
              <div style={S.grid3}>
                <div style={S.metric}><div style={S.metricLabel}>Costo unitario total</div><div style={S.metricVal}>{fmtS(mpCosto)}</div></div>
                <div style={{ ...S.metric, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)" }}>
                  <div style={S.metricLabel}>Precio sugerido ({mpPct}%)</div>
                  <div style={S.metricVal}>{fmtS(mpSug)}</div>
                </div>
                <div style={{ ...S.metric, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)" }}>
                  <div style={S.metricLabel}>Ganancia estimada</div>
                  <div style={{ ...S.metricVal, color: mpGan >= 0 ? "#34d399" : "#f87171" }}>{fmtS(mpGan)}</div>
                </div>
              </div>
              <div style={{ marginTop: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Pon tu propio precio de venta</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <span style={{ padding: "8px 10px", background: "#1e1b4b", color: "#94a3b8", fontSize: 13, borderRight: "1px solid rgba(255,255,255,0.1)" }}>S/</span>
                    <input type="number" placeholder={mpSug.toFixed(2)} value={mpCustom} onChange={e => setMpCustom(e.target.value)}
                      style={{ padding: "8px 11px", border: "none", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", width: 130 }} />
                  </div>
                  {mpCustom && <>
                    <div style={{ ...S.metric, padding: "8px 14px", flex: "none" }}>
                      <div style={S.metricLabel}>Precio final</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0" }}>{fmtS(parseFloat(mpCustom) || 0)}</div>
                    </div>
                    <div style={{ ...S.metric, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)", padding: "8px 14px", flex: "none" }}>
                      <div style={S.metricLabel}>Ganancia con tu precio</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: round2((parseFloat(mpCustom) || 0) - mpCosto) >= 0 ? "#34d399" : "#f87171" }}>{fmtS(round2((parseFloat(mpCustom) || 0) - mpCosto))}</div>
                    </div>
                    <button style={S.btnSm} onClick={() => setMpCustom("")}>Usar sugerido</button>
                  </>}
                </div>
              </div>
              <div style={S.divider} />
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Texto listo para copiar en Marketplace:</div>
              <div style={S.marketBox}>{mpTexto}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button style={S.btn} onClick={() => copiar(mpTexto)}>📋 Copiar texto</button>
              </div>
            </>}
            {!mpProd && !productosActuales.length && <p style={{ fontSize: 13, color: "#64748b", marginTop: 10 }}>Agrega productos en "Productos" primero.</p>}
          </div>

          {productosActuales.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>Ganancia total si vendes todo el pedido</div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Calculado al {mpPct}% de ganancia para todos los {productosActuales.length} productos:</p>
              <div style={S.grid3}>
                {[
                  ["Venta total estimada", fmtS(productosActuales.reduce((s, p) => s + round2(costoReal(p) * (1 + mpPct / 100)), 0)), "#a5b4fc"],
                  ["Costo total pedido", fmtS(totalCostos), "#94a3b8"],
                  ["Ganancia neta total", fmtS(productosActuales.reduce((s, p) => s + round2(costoReal(p) * mpPct / 100), 0)), "#34d399"],
                ].map(([lbl, val, color]) => (
                  <div key={lbl} style={S.metric}><div style={S.metricLabel}>{lbl}</div><div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div></div>
                ))}
              </div>
            </div>
          )}
        </>}

        {/* ── HISTORIAL ─────────────────────────────────────────────────── */}
        {tab === "historial" && <>
          {loadingHist && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ ...S.spinner, width: 28, height: 28, margin: "0 auto 12px", borderWidth: 3 }} />
              <p style={{ fontSize: 13, color: "#64748b" }}>Cargando pedidos desde Supabase...</p>
            </div>
          )}
          {!loadingHist && !historial.length && (
            <div style={{ ...S.card, textAlign: "center", padding: "40px 24px" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>📂</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Sin pedidos guardados</div>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Crea y guarda tu primer pedido.</p>
              <button style={S.btnPrimary} onClick={() => setTab("pedido")}>+ Nuevo pedido</button>
            </div>
          )}
          {!loadingHist && historial.map(ped => (
            <div key={ped.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{ped.nombre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{ped.fecha}{ped.agente ? ` · Agente: ${ped.agente}` : ""} · TC: {ped.tc} S/</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...S.tag, background: "rgba(129,140,248,0.13)", color: "#a5b4fc" }}>{ped.productos?.length || 0} productos</span>
                  <span style={{ ...S.tag, background: "rgba(52,211,153,0.1)", color: "#34d399" }}>Gan: {fmtS(ped.total_ganancia)}</span>
                  <button style={S.btnSm} onClick={() => setEditandoPedido(ped)}>✏️ Editar</button>
                  <button style={S.btnDanger} onClick={() => eliminarPedido(ped.id)}>🗑 Eliminar</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8, marginBottom: 14 }}>
                {[["Costo total", fmtS(ped.total_costos), "#94a3b8"], ["Total venta", fmtS(ped.total_venta), "#a5b4fc"], ["Ganancia neta", fmtS(ped.total_ganancia), "#34d399"]].map(([lbl, val, color]) => (
                  <div key={lbl} style={{ ...S.metric, padding: "10px 12px" }}>
                    <div style={{ ...S.metricLabel, fontSize: 10 }}>{lbl}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={S.divider} />
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Detalle del pedido</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["Producto", "Cat.", "Talla", "Costo real", "Precio venta", "Ganancia"].map(h => (
                        <th key={h} style={{ padding: "6px 8px", textAlign: h === "Producto" ? "left" : "right", fontWeight: 500, color: "#64748b", fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(ped.productos || []).map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {p.imagen_url ? <img src={p.imagen_url} alt="" style={{ width: 26, height: 26, borderRadius: 5, objectFit: "cover" }} /> : <span>{CAT_EMOJI[p.categoria]}</span>}
                            <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding: "8px", textAlign: "right" }}><Badge cat={p.categoria} /></td>
                        <td style={{ padding: "8px", textAlign: "right", color: "#64748b" }}>{p.talla || "—"}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{fmtS(p.costo_real)}</td>
                        <td style={{ padding: "8px", textAlign: "right", color: "#a5b4fc", fontWeight: 600 }}>{fmtS(p.precio_venta)}</td>
                        <td style={{ padding: "8px", textAlign: "right", color: p.ganancia >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>{fmtS(p.ganancia)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <td colSpan={3} style={{ padding: "8px", fontWeight: 700, color: "#64748b", fontSize: 12 }}>TOTAL</td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: 700 }}>{fmtS(ped.total_costos)}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: 700, color: "#a5b4fc" }}>{fmtS(ped.total_venta)}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: 700, color: "#34d399" }}>{fmtS(ped.total_ganancia)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
          {!loadingHist && historial.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={S.btnPrimary} onClick={() => setTab("pedido")}>+ Nuevo pedido</button>
            </div>
          )}
        </>}

      </div>
    </div>
  );
}