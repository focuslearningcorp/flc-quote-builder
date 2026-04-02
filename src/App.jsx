import { useState, useMemo } from "react";

const VC = {
  dmPerSeat: { vdm: 73.36, vls: 106.71 },
  get totalDmPerSeat() { return this.dmPerSeat.vdm + this.dmPerSeat.vls; },
  sharedHostingYr: 3686.44,
  perUserHostingYr: 571.20,
  tierMargins: {
    Essential:        { dm: 0.90, hosting: 0.70, discount: 0 },
    "Essential Plus": { dm: 0.90, hosting: 0.70, discount: 0 },
    Enhanced:         { dm: 0.90, hosting: 0.70, discount: 0 },
    Enterprise:       { dm: 0.90, hosting: 0.70, discount: 0 },
  },
  upgradeAddOns: { MMS: 35000, "Self-Managed": 17500, "In-Place": 10000 },
  discountGuardrails: {
    Essential:        { suggested: 10, approval: 15, max: 25, label: "0-10% standard, 11-15% needs approval" },
    "Essential Plus": { suggested: 10, approval: 15, max: 25, label: "0-10% standard, 11-15% needs approval" },
    Enhanced:         { suggested: 10, approval: 15, max: 25, label: "0-10% standard, 11-15% needs approval" },
    Enterprise:       { suggested: 15, approval: 20, max: 30, label: "0-15% standard, 16-20% needs approval" },
  },
  seatLimits: {
    Essential: { vdm: 10 }, "Essential Plus": { vdm: 10 },
    Enhanced: { vdm: 35 }, Enterprise: { vdm: Infinity },
  },
  services: [
    { id:"clearpath",     name:"ClearPATH Onboarding (40 hrs)",           hours:40,  costToFLC:2590,  list:7409,  auto:["Essential"],                      avail:["Essential Plus"], note:"Included in Dedicated TAM for Enhanced/Enterprise" },
    { id:"training",      name:"Basic Training (remote/virtual included)", hours:8,   costToFLC:518,   list:2480,  auto:["Essential","Enhanced","Enterprise"], avail:["Essential Plus"], note:"In-person: $1,100" },
    { id:"cbt",           name:"Train-the-Trainer CBT Library (INPO 2.0)",hours:0,   costToFLC:0,     list:8000,  auto:["Essential","Enhanced","Enterprise"], avail:["Essential Plus"], note:"Turnkey CBT library" },
    { id:"sharedTam",     name:"Shared Technical Account Manager",         hours:36,  costToFLC:2331,  list:6668,  auto:["Essential"],                      avail:["Essential Plus"], note:"2 hrs/mo meeting + 1 hr/mo admin" },
    { id:"dedicatedTam",  name:"Dedicated Technical Account Manager",      hours:200, costToFLC:12950, list:38000, auto:["Enhanced","Enterprise"],          avail:[], note:"Full TAM scope" },
    { id:"additionalSvc", name:"Additional Scoped Services",               hours:90,  costToFLC:5828,  list:16671, auto:["Enterprise"],                     avail:[], note:"Job Aid Dev, JTA coaching, etc." },
  ],
  enterpriseExtras: [
    { id:"extraReformat",  name:"Reformatting Instructor Materials (5 sets/yr)",        note:"Subject to scoping" },
    { id:"extraJobAid",    name:"Adding/Modifying Job Aids (10/yr)",                    note:"Subject to scoping" },
    { id:"extraOJT",       name:"OJT Guide & Task Qualification Sheets (15 guides/yr)", note:"Subject to scoping" },
    { id:"extraSelfStudy", name:"Self-Study Guide Development (2/yr, SCORM)",           note:"Subject to scoping" },
  ],
};

const QC = {
  tierPrices: {
    Essential:        { swList: 34816,  adminLimit: 5,    empLimit: 10   },
    "Essential Plus": { swList: 34816,  adminLimit: 5,    empLimit: 10   },
    Enhanced:         { swList: 63768,  adminLimit: 20,   empLimit: 50   },
    Enterprise:       { swList: 105229, adminLimit: null, empLimit: null },
  },
  itAddOns: { onPrem: 15000, managedIT: 7000 },
  dmCostPerCust: 6959,
  services: [
    { id:"qtdTrain",   name:"QTD Training (Virtual or In-Person)",         costToFLC:518,   list:1481.84,  auto:["Essential","Enhanced","Enterprise"], avail:["Essential Plus"], note:"Foundations + live Q&A" },
    { id:"contentLib", name:"Training Content Library - 10 credits",       costToFLC:0,     list:3056.29,  auto:["Essential","Enhanced","Enterprise"], avail:["Essential Plus"], note:"Pre-built CBTs, task lists & ILA templates" },
    { id:"coaching",   name:"Best-Practice Coaching (2 hrs/mo avg)",       costToFLC:1332,  list:4445.52,  auto:["Essential","Enhanced","Enterprise"], avail:["Essential Plus"], note:"Monthly expert session" },
    { id:"reports",    name:"Report Building & Customization",              costToFLC:518,   list:1481.84,  auto:["Essential","Enhanced","Enterprise"], avail:["Essential Plus"], note:"Custom report templates" },
    { id:"per005",     name:"PER-005 Compliance Support - 2 positions",    costToFLC:5260,  list:17041.15, auto:["Enhanced","Enterprise"],             avail:["Essential Plus"], note:"Quarterly reviews, mock NERC evaluations" },
    { id:"trainAdmin", name:"Training Admin Support - up to 20 employees", costToFLC:10742, list:34823.22, auto:["Enterprise"],                        avail:[], note:"SOCCED reconciliation, scheduling" },
  ],
  pickOneOptions: [
    { id:"reformat",   name:"Reformatting of Instructor Materials (5 sets/yr)",       costToFLC:5140, list:16670.69 },
    { id:"jobAids",    name:"Adding/Modifying Job Aids (10 job aids/yr)",              costToFLC:5140, list:16670.69 },
    { id:"ojtGuide",   name:"OJT Guide & Task Qualification Sheet Dev (15 guides/yr)",costToFLC:5140, list:16670.69 },
    { id:"selfStudy",  name:"Self-Study Guide Dev (2 guides/yr - SCORM wrapped)",     costToFLC:5140, list:16670.69 },
    { id:"nercEval",   name:"Mock NERC Evaluation / Coaching Prep (PER standards)",   costToFLC:913,  list:2963.68  },
    { id:"trnPolicy",  name:"Training Policy, Procedures & Internal Controls Dev",    costToFLC:1985, list:7409.20  },
  ],
  discountGuardrails: {
    Essential:        { suggested: 10, approval: 15, max: 25, label: "0-10% standard, 11-15% needs approval, 25% max" },
    "Essential Plus": { suggested: 10, approval: 15, max: 25, label: "0-10% standard, 11-15% needs approval, 25% max" },
    Enhanced:         { suggested: 10, approval: 15, max: 25, label: "0-10% standard, 11-15% needs approval, 25% max" },
    Enterprise:       { suggested: 15, approval: 20, max: 30, label: "0-15% standard, 16-20% needs approval, 30% max" },
  },
};

const fmt = n => "$" + Math.round(n).toLocaleString();
const pct = n => (n * 100).toFixed(1) + "%";

function getVisionServices(bundle) {
  return {
    auto:     VC.services.filter(s => s.auto.includes(bundle)),
    optional: VC.services.filter(s => s.avail.includes(bundle)),
    extras:   bundle === "Enterprise" ? VC.enterpriseExtras : [],
  };
}

function calcVisionDeal(bundle, vdmSeats, onPrem, upgradeType, optSvcs, discPct, extraPrice) {
  if (bundle === "None" || bundle === "Legacy") return null;
  const seats = Math.max(1, vdmSeats), m = VC.tierMargins[bundle] || VC.tierMargins.Essential;
  const dmCost    = VC.totalDmPerSeat * seats;
  const hostingRaw = VC.sharedHostingYr + VC.perUserHostingYr * seats;
  const hostCost  = onPrem ? 0 : hostingRaw;
  const costFloor = dmCost + hostCost;
  const dmList    = dmCost / (1 - m.dm);
  const hostList  = hostingRaw / (1 - m.hosting);
  const addon     = onPrem ? (VC.upgradeAddOns[upgradeType] || 0) : 0;
  const swPrice   = (dmList + hostList) * (1 - m.discount) + addon;
  const { auto }  = getVisionServices(bundle);
  const autoSvc   = auto.reduce((s, v) => s + v.list, 0);
  const optSvc    = optSvcs.reduce((s, v) => s + v.list, 0);
  const svcTotal  = autoSvc + optSvc + (extraPrice || 0);
  const svcCost   = auto.reduce((s, v) => s + v.costToFLC, 0)
                  + optSvcs.reduce((s, v) => s + v.costToFLC, 0)
                  + (extraPrice || 0) * 0.3;
  const listTotal = swPrice + svcTotal, totalCost = costFloor + svcCost;
  const discAmt   = listTotal * discPct, final = listTotal - discAmt;
  return { seats, bundle, margins: m, dmCost, hostCost, costFloor, dmList, hostList, addon, swPrice,
    autoSvc, optSvc, svcTotal, svcCost, listTotal, totalCost, discPct, discAmt, finalPrice: final,
    swMargin:      swPrice  > 0 ? (swPrice  - costFloor) / swPrice  : 0,
    blendedMargin: final    > 0 ? (final    - totalCost) / final    : 0,
    belowFloor:    final < costFloor };
}

function calcVisionLegacy(onPrem, upgradeType, vdmSeats) {
  const seats  = Math.max(1, vdmSeats), dm = VC.totalDmPerSeat * seats;
  const hostRaw = VC.sharedHostingYr + VC.perUserHostingYr * seats;
  const host   = onPrem ? 0 : hostRaw;
  const cf     = dm + host, m = VC.tierMargins.Enterprise;
  const dmL    = dm / (1 - m.dm), hL = hostRaw / (1 - m.hosting);
  const addon  = onPrem ? (VC.upgradeAddOns[upgradeType] || 0) : 0;
  const impliedList = dmL + hL;
  const seg    = onPrem
    ? (upgradeType === "Self-Managed" ? "On-Prem · Self-Managed"
     : upgradeType === "In-Place"     ? "On-Prem · In-Place"
                                      : "On-Prem · MMS")
    : "Hosted";
  return { costFloor: cf, impliedList, addon, totalList: impliedList + addon, segment: seg,
    dmCost: dm, hostCost: host, dmList: dmL, hostList: hL };
}

function getQlarityServices(bundle) {
  if (!bundle || bundle === "None" || bundle === "Legacy")
    return { auto: [], optional: [], hasPickOne: false };
  return {
    auto:       QC.services.filter(s => s.auto.includes(bundle)),
    optional:   QC.services.filter(s => s.avail.includes(bundle)),
    hasPickOne: bundle === "Enterprise",
  };
}

function calcQlarityDeal({ bundle, onPrem, managedIT, optSvcIds, pickOneId, discPct }) {
  const tier = QC.tierPrices[bundle];
  if (!tier) return null;
  const swBase   = tier.swList;
  const itAddOn  = (onPrem ? QC.itAddOns.onPrem : 0) + (managedIT ? QC.itAddOns.managedIT : 0);
  const swPrice  = swBase + itAddOn;
  const { auto, optional, hasPickOne } = getQlarityServices(bundle);
  const optSelected  = optional.filter(s => optSvcIds.includes(s.id));
  const pickOne      = hasPickOne ? (QC.pickOneOptions.find(p => p.id === pickOneId) || QC.pickOneOptions[0]) : null;
  const autoTotal    = auto.reduce((s, v) => s + v.list, 0);
  const optTotal     = optSelected.reduce((s, v) => s + v.list, 0);
  const pickOneTotal = pickOne ? pickOne.list : 0;
  const svcTotal     = autoTotal + optTotal + pickOneTotal;
  const autoCost     = auto.reduce((s, v) => s + v.costToFLC, 0);
  const optCost      = optSelected.reduce((s, v) => s + v.costToFLC, 0);
  const pickOneCost  = pickOne ? pickOne.costToFLC : 0;
  const svcCost      = autoCost + optCost + pickOneCost;
  const listTotal    = swPrice + svcTotal;
  const dmCostFloor  = QC.dmCostPerCust + svcCost;
  const discAmt      = listTotal * discPct;
  const finalPrice   = listTotal - discAmt;
  const swMargin     = swPrice  > 0 ? (swPrice  - QC.dmCostPerCust) / swPrice   : 0;
  const blendedMargin = finalPrice > 0 ? (finalPrice - dmCostFloor) / finalPrice : 0;
  return { bundle, swBase, itAddOn, swPrice, autoSvcs: auto, optSelected, pickOne,
    svcTotal, svcCost, listTotal, dmCostFloor, discPct, discAmt, finalPrice,
    swMargin, blendedMargin, belowFloor: finalPrice < dmCostFloor };
}

const BASE_CSS = `
  *{box-sizing:border-box}
  input,select{font-family:'Archivo',Arial,sans-serif;font-size:14px;border:1.5px solid #c8d6e5;border-radius:6px;padding:8px 12px;color:#10285A;transition:border-color .2s;width:100%}
  input:focus,select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
  select{background:white;cursor:pointer}
  textarea{font-family:'Archivo',Arial,sans-serif;font-size:13px;border:1.5px solid #c8d6e5;border-radius:6px;padding:10px;color:#10285A;width:100%;resize:vertical}
  .S{background:white;border-radius:10px;padding:20px 24px;margin-bottom:14px;border:1px solid #e8ecf1}
  .H{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--mid);margin-bottom:14px}
  .R{display:flex;gap:14px;margin-bottom:12px;flex-wrap:wrap}
  .F{display:flex;flex-direction:column;gap:4px;flex:1;min-width:130px}
  .F label{font-size:12px;font-weight:600;color:#5a6f87}
  .B{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
  .bg{background:#e6faf5;color:#0a7c5f}.by{background:#fef9e7;color:#9a7b0a}.br{background:#fde8e8;color:#c0392b}
  .sv{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0f3f6;font-size:13px}
  .sv:last-child{border-bottom:none}
  .dt{width:18px;height:18px;border-radius:4px;border:2px solid #c8d6e5;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
  .dt.on{background:var(--accent);border-color:var(--accent)}
  .dt.au{background:#10285A;border-color:#10285A}
  .sr{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f3f6;font-size:14px}
  .sr:last-child{border-bottom:none}
  .sr.t{font-weight:700;font-size:16px;border-top:2px solid #10285A;padding-top:12px;margin-top:4px;border-bottom:none}
  .A{background:#f8f9fb;border-radius:8px;padding:14px 16px;margin-top:12px;border:1px dashed #c8d6e5}
  .A h4{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--mid);margin:0 0 8px}
  .ar{display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#5a6f87}
  .ar .v{font-weight:600;color:#10285A}
  .mt{height:8px;background:#e8ecf1;border-radius:4px;overflow:hidden;margin-top:4px}
  .mf{height:100%;border-radius:4px;transition:width .4s ease}
  .po{display:flex;align-items:flex-start;gap:10px;padding:9px 12px;border-radius:7px;cursor:pointer;border:1.5px solid #e4eaf2;transition:all .15s;font-size:13px;margin-bottom:6px}
  .po:hover{border-color:var(--accent);background:#f4fdfb}
  .po.sel{border-color:#10285A;background:#eef2fa}
  .rb{width:16px;height:16px;border-radius:50%;border:2px solid #c8d6e5;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .po.sel .rb{border-color:#10285A;background:#10285A}
  .rb-dot{width:6px;height:6px;border-radius:50%;background:white}
`;

export default function QuoteBuilder() {
  const [product, setProduct] = useState("VISION");
  const [admin,   setAdmin]   = useState(false);
  const [client,  setClient]  = useState("");
  const [owner,   setOwner]   = useState("");

  const [vBundle,  setVBundle]  = useState("Essential");
  const [vdm,      setVdm]      = useState(10);
  const [students, setStudents] = useState(50);
  const [vOnPrem,  setVOnPrem]  = useState(false);
  const [upType,   setUpType]   = useState("MMS");
  const [vDisc,    setVDisc]    = useState(0);
  const [aeOvr,    setAeOvr]    = useState("");
  const [vOptTog,  setVOptTog]  = useState({});
  const [vExtraP,  setVExtraP]  = useState("");

  const [qBundle,     setQBundle]     = useState("Essential");
  const [adminSeats,  setAdminSeats]  = useState(3);
  const [empRecords,  setEmpRecords]  = useState(10);
  const [qOnPrem,     setQOnPrem]     = useState(false);
  const [managedIT,   setManagedIT]   = useState(false);
  const [qOptSvcIds,  setQOptSvcIds]  = useState([]);
  const [pickOneId,   setPickOneId]   = useState(QC.pickOneOptions[0].id);
  const [qDisc,       setQDisc]       = useState(0);
  const [priorValue,  setPriorValue]  = useState("");
  const [increasePct, setIncreasePct] = useState(5);

  const switchProduct = (p) => {
    setProduct(p);
    setAdmin(false);
    if (p === "VISION") {
      setVBundle("Essential"); setVdm(10); setStudents(50);
      setVOnPrem(false); setUpType("MMS"); setVDisc(0);
      setAeOvr(""); setVOptTog({}); setVExtraP("");
    } else {
      setQBundle("Essential"); setAdminSeats(3); setEmpRecords(10);
      setQOnPrem(false); setManagedIT(false); setQOptSvcIds([]);
      setPickOneId(QC.pickOneOptions[0].id); setQDisc(0);
      setPriorValue(""); setIncreasePct(5);
    }
  };

  const isVision = product === "VISION";
  const accent     = isVision ? "#05D2B2" : "#71D2C5";
  const accentSoft = isVision ? "rgba(5,210,178,.15)" : "rgba(113,210,197,.18)";
  const mid        = isVision ? "#15688E" : "#2E69AD";
  const gradFrom   = isVision ? "#1A4481" : "#1B387D";
  const gradTo     = isVision ? "#05D2B2" : "#71D2C5";

  const CSS = BASE_CSS
    .replace(/var\(--accent\)/g, accent)
    .replace(/var\(--accent-soft\)/g, accentSoft)
    .replace(/var\(--mid\)/g, mid);

  const vIsOn  = vBundle !== "None";
  const vIsLeg = vBundle === "Legacy";
  const vIsStd = vIsOn && !vIsLeg;
  const { auto: vAutoS, optional: vOptS, extras: vExtras } = useMemo(() => getVisionServices(vBundle), [vBundle]);
  const vEnOpt = useMemo(() => vOptS.filter(s => vOptTog[s.id]), [vOptS, vOptTog]);
  const vDeal  = useMemo(() => calcVisionDeal(vBundle, vdm, vOnPrem, upType, vEnOpt, vDisc / 100, parseFloat(vExtraP) || 0),
    [vBundle, vdm, vOnPrem, upType, vEnOpt, vDisc, vExtraP]);
  const vLeg   = useMemo(() => vIsLeg ? calcVisionLegacy(vOnPrem, upType, vdm) : null, [vIsLeg, vOnPrem, upType, vdm]);
  const vLim   = VC.seatLimits[vBundle];
  const vSeatWarn = vLim && vdm > vLim.vdm;
  const vRecTier  = vdm <= 10 ? "Essential" : vdm <= 35 ? "Enhanced" : "Enterprise";
  const vOvrVal   = aeOvr ? parseFloat(aeOvr) : null;
  const legP      = vLeg ? (vOvrVal || vLeg.totalList) : 0;
  const legM      = vLeg && legP > 0 ? (legP - vLeg.costFloor) / legP : 0;

  const qIsLeg = qBundle === "Legacy";
  const qIsStd = qBundle !== "None" && !qIsLeg;
  const qTier  = QC.tierPrices[qBundle];
  const qSeatWarn = qTier && (
    (qTier.adminLimit && adminSeats > qTier.adminLimit) ||
    (qTier.empLimit   && empRecords > qTier.empLimit)
  );
  const { auto: qAuto, optional: qOptional, hasPickOne } = useMemo(() => getQlarityServices(qBundle), [qBundle]);
  const qDeal = useMemo(() =>
    qIsStd ? calcQlarityDeal({ bundle: qBundle, onPrem: qOnPrem, managedIT, optSvcIds: qOptSvcIds, pickOneId, discPct: qDisc / 100 }) : null,
    [qBundle, qOnPrem, managedIT, qOptSvcIds, pickOneId, qDisc, qIsStd]);
  const qLegacyPrice = useMemo(() => {
    const prior = parseFloat(priorValue) || 0;
    return prior > 0 ? { prior, pctVal: increasePct, price: prior * (1 + increasePct / 100) } : null;
  }, [priorValue, increasePct]);
  const qG = QC.discountGuardrails[qBundle] || QC.discountGuardrails.Essential;
  const toggleQOpt = id => setQOptSvcIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const downloadCSV = (rows, filename) => {
    const csv  = rows.filter(Boolean).map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const renderDiscountBlock = (disc, setDisc, deal, g, productName) => {
    const overSuggested = disc > g.suggested && disc <= g.approval;
    const overApproval  = disc > g.approval  && disc <= g.max;
    const overMax       = disc > g.max;
    const vFloor = productName === "VISION" && deal && deal.blendedMargin < 0.76 && deal.blendedMargin > 0;
    return (
      <div style={{ margin: "16px 0 8px", background: "#f8f9fb", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div className="F" style={{ maxWidth: 140, marginBottom: 0 }}>
            <label>Discount %</label>
            <input type="number" min={0} max={60} step={1} value={disc}
              onChange={e => setDisc(Math.max(0, Math.min(60, parseFloat(e.target.value) || 0)))}
              style={{ borderColor: overApproval || overMax ? "#e74c3c" : overSuggested ? "#f0c36d" : "#c8d6e5" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-end", paddingBottom: 2 }}>
            {[0, 5, 10, 15, 20].map(v => (
              <button key={v} onClick={() => setDisc(v)} style={{
                padding: "4px 10px", borderRadius: 14, fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                border: disc === v ? "2px solid #10285A" : "1px solid #c8d6e5",
                background: disc === v ? "#10285A" : v <= g.suggested ? "#e6faf5" : v <= g.approval ? "#fef9e7" : "#fde8e8",
                color: disc === v ? "white" : "#10285A",
              }}>{v}%</button>
            ))}
          </div>
          {disc > 0 && deal && <div style={{ fontSize: 14, color: "#5a6f87" }}>-{fmt(deal.discAmt)}</div>}
        </div>
        <div style={{ fontSize: 11, color: "#5a6f87", marginBottom: overSuggested || overApproval || overMax ? 8 : 0 }}>{g.label}</div>
        {overSuggested && <div style={{ background: "#fef9e7", border: "1px solid #f0c36d", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#7d6608" }}>Warning: Discount exceeds standard range ({g.suggested}%). Document business justification.</div>}
        {overApproval  && <div style={{ background: "#fde8e8", border: "1px solid #e6a1a1", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#922", marginTop: 4 }}>Discount exceeds approval threshold ({g.approval}%). Requires Sales Leadership sign-off.</div>}
        {overMax       && <div style={{ background: "#fde8e8", border: "1px solid #c0392b", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#c0392b", fontWeight: 600, marginTop: 4 }}>Discount exceeds maximum ({g.max}%). Not authorized.</div>}
        {vFloor        && <div style={{ background: "#fde8e8", border: "1px solid #c0392b", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#c0392b", fontWeight: 600, marginTop: 4 }}>Deal margin ({pct(deal.blendedMargin)}) is below the 76% floor. Reduce discount or escalate.</div>}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Archivo',Arial,sans-serif", color: "#10285A", maxWidth: 920, margin: "0 auto", padding: "24px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      <div style={{ background: `linear-gradient(135deg,${gradFrom},${gradTo})`, borderRadius: 12, padding: "20px 28px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["VISION", "Qlarity"].map(p => (
            <button key={p} onClick={() => switchProduct(p)} style={{
              padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
              background: product === p ? "white" : "rgba(255,255,255,.15)",
              color:      product === p ? (p === "VISION" ? "#1A4481" : "#1B387D") : "white",
              border:     product === p ? "none" : "1px solid rgba(255,255,255,.35)",
            }}>{p}</button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 900 }}>{product} Quote Builder</div>
            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 12, marginTop: 2 }}>FOCUS Learning · Internal Use Only</div>
          </div>
          <button onClick={() => setAdmin(!admin)} style={{
            background: admin ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.3)", borderRadius: 6, color: "white",
            padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>{admin ? "Admin View ON" : "Admin View OFF"}</button>
        </div>
      </div>

      <div style={{ background: "#FFF3E0", border: "1px solid #ED7D2F", borderRadius: 8, padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>!</span>
        <div style={{ fontSize: 12, color: "#10285A" }}>
          <strong>Reminder:</strong> Customers should never see a breakdown of Software vs. Services pricing.
          Always present the <strong>Final Contract Price</strong> as a single line item.
        </div>
      </div>

      <div className="S">
        <div className="H">Deal Information</div>
        <div className="R">
          <div className="F"><label>Client Name</label><input value={client} onChange={e => setClient(e.target.value)} placeholder="Client name" /></div>
          <div className="F"><label>Opportunity Owner</label><input value={owner} onChange={e => setOwner(e.target.value)} placeholder="AE name" /></div>
        </div>
      </div>

      {isVision && (<>
        <div className="S"><div className="H">Product & Configuration</div>
          <div className="R">
            <div className="F"><label>Bundle Type</label>
              <select value={vBundle} onChange={e => { setVBundle(e.target.value); setVOptTog({}); setVExtraP(""); }}>
                {["None","Legacy","Essential","Essential Plus","Enhanced","Enterprise"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="F"><label>VDM Seats (concurrent)</label>
              <input type="number" min={1} max={500} value={vdm} onChange={e => setVdm(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div className="F"><label>Student Seats</label>
              <input type="number" min={1} value={students} onChange={e => setStudents(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <div className="R">
            <div className="F"><label>On-Prem?</label>
              <select value={vOnPrem ? "Yes" : "No"} onChange={e => setVOnPrem(e.target.value === "Yes")}><option>No</option><option>Yes</option></select>
            </div>
            <div className="F" style={{ opacity: vOnPrem ? 1 : .3, pointerEvents: vOnPrem ? "auto" : "none" }}><label>Upgrade Type</label>
              <select value={upType} onChange={e => setUpType(e.target.value)}><option>MMS</option><option>Self-Managed</option><option>In-Place</option></select>
            </div>
          </div>
          {vSeatWarn && vIsStd && <div style={{ background: "#fef3e2", border: "1px solid #f0c36d", borderRadius: 6, padding: "8px 14px", marginTop: 4, fontSize: 13 }}>
            Warning: {vdm} seats exceeds {vBundle} limit ({vLim.vdm}). Recommended: <strong>{vRecTier}</strong>
          </div>}
        </div>

        {vIsLeg && vLeg && (
          <div className="S"><div className="H">Legacy Pricing</div>
            <div style={{ background: "#f0f6fb", borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div className="sr"><span>Segment</span><strong>{vLeg.segment}</strong></div>
              <div className="sr"><span>Cost Floor</span><span>{fmt(vLeg.costFloor)}</span></div>
              <div className="sr"><span>Implied List Price</span><strong>{fmt(vLeg.totalList)}</strong></div>
              {vOnPrem && <div className="sr"><span>{upType} Add-On</span><span>{fmt(vLeg.addon)}</span></div>}
            </div>
            <div className="F" style={{ maxWidth: 250 }}><label>AE Override (optional)</label>
              <input type="number" value={aeOvr} onChange={e => setAeOvr(e.target.value)} placeholder="Leave blank for implied list" />
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="sr t"><span>Legacy Price</span><span>{fmt(legP)}</span></div>
              <div style={{ marginTop: 8 }}>
                <span className={`B ${legM >= .5 ? "bg" : legM >= .3 ? "by" : "br"}`}>{pct(legM)} margin</span>
                {legP < vLeg.costFloor && <span className="B br" style={{ marginLeft: 8 }}>Below cost floor</span>}
              </div>
            </div>
            {admin && <div className="A"><h4>Cost Model</h4>
              <div className="ar"><span>D&M ({VC.totalDmPerSeat.toFixed(2)}/seat x {vdm})</span><span className="v">{fmt(vLeg.dmCost)}</span></div>
              <div className="ar"><span>Hosting</span><span className="v">{fmt(vLeg.hostCost)}</span></div>
              <div className="ar" style={{ fontWeight: 700 }}><span>Cost Floor</span><span className="v">{fmt(vLeg.costFloor)}</span></div>
              <div className="ar"><span>D&M List (90%)</span><span className="v">{fmt(vLeg.dmList)}</span></div>
              <div className="ar"><span>Hosting List (70%)</span><span className="v">{fmt(vLeg.hostList)}</span></div>
            </div>}
          </div>
        )}

        {vIsStd && (
          <div className="S"><div className="H">Services - {vBundle}</div>
            {vAutoS.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0a7c5f", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Included in {vBundle}</div>
              {vAutoS.map(s => (
                <div key={s.id} className="sv">
                  <div className="dt au"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" /></svg></div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{s.name}</div>
                    {admin && <div style={{ fontSize: 11, color: "#5a6f87", marginTop: 2 }}>{s.note} · Cost: {fmt(s.costToFLC)} · {s.hours} hrs</div>}
                  </div>
                  <div style={{ fontWeight: 600, color: mid }}>{fmt(s.list)}</div>
                </div>
              ))}
            </>}
            {vOptS.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#5a6f87", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 6 }}>
                {vBundle === "Essential Plus" ? "Select a la carte" : "Optional Add-Ons"}
              </div>
              {vOptS.map(s => (
                <div key={s.id} className="sv" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => setVOptTog(p => ({ ...p, [s.id]: !p[s.id] }))}>
                  <div className={`dt ${vOptTog[s.id] ? "on" : ""}`}>{vOptTog[s.id] && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" /></svg>}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{s.name}</div>
                    {admin && <div style={{ fontSize: 11, color: "#5a6f87", marginTop: 2 }}>{s.note}</div>}
                  </div>
                  <div style={{ fontWeight: 600, color: mid }}>{fmt(s.list)}</div>
                </div>
              ))}
            </>}
            {vExtras.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ED7D2F", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 6 }}>Additional Services (requires scoping)</div>
              {vExtras.map(ex => (
                <div key={ex.id} className="sv" style={{ opacity: .7 }}>
                  <div className="dt" style={{ borderColor: "#ED7D2F", borderStyle: "dashed" }} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{ex.name}</div><div style={{ fontSize: 11, color: "#5a6f87", marginTop: 2 }}>{ex.note}</div></div>
                </div>
              ))}
              <div className="F" style={{ maxWidth: 260, marginTop: 8 }}><label>Scoped Extra Services Price</label>
                <input type="number" value={vExtraP} onChange={e => setVExtraP(e.target.value)} placeholder="$0" />
              </div>
            </>}
            <div style={{ marginTop: 12, padding: "10px 0", borderTop: "1px solid #e8ecf1", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
              <span>Services Total</span><span>{vDeal ? fmt(vDeal.svcTotal) : "$0"}</span>
            </div>
          </div>
        )}

        {vDeal && (
          <div className="S"><div className="H">Deal Estimate</div>
            <div className="sr"><span>Software + IT</span><span>{fmt(vDeal.swPrice)}</span></div>
            <div className="sr"><span>Professional Services</span><span>{fmt(vDeal.svcTotal)}</span></div>
            <div className="sr" style={{ fontWeight: 600 }}><span>List Total</span><span>{fmt(vDeal.listTotal)}</span></div>
            {renderDiscountBlock(vDisc, setVDisc, vDeal, VC.discountGuardrails[vBundle] || VC.discountGuardrails.Essential, "VISION")}
            <div className="sr t"><span>Final Contract Price</span><span style={{ fontSize: 20 }}>{fmt(vDeal.finalPrice)}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span className={`B ${vDeal.swMargin >= .6 ? "bg" : vDeal.swMargin >= .4 ? "by" : "br"}`}>SW: {pct(vDeal.swMargin)}</span>
              <span className={`B ${vDeal.blendedMargin >= .55 ? "bg" : vDeal.blendedMargin >= .35 ? "by" : "br"}`}>Blended: {pct(vDeal.blendedMargin)}</span>
              {vDeal.belowFloor && <span className="B br">Below cost floor!</span>}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#5a6f87", marginBottom: 2 }}>Blended Margin</div>
              <div className="mt"><div className="mf" style={{ width: `${Math.min(100, Math.max(0, vDeal.blendedMargin * 100))}%`, background: vDeal.blendedMargin >= .55 ? "#05D2B2" : vDeal.blendedMargin >= .35 ? "#f0c36d" : "#e74c3c" }} /></div>
            </div>
            {admin && <div className="A"><h4>Pricing Breakdown</h4>
              <div className="ar"><span>D&M cost</span><span className="v">{fmt(vDeal.dmCost)}</span></div>
              <div className="ar"><span>Hosting cost</span><span className="v">{vOnPrem ? "$0" : fmt(vDeal.hostCost)}</span></div>
              <div className="ar" style={{ fontWeight: 700 }}><span>Cost Floor</span><span className="v">{fmt(vDeal.costFloor)}</span></div>
            </div>}
          </div>
        )}

        {vIsOn && <div className="S"><div className="H">Notes</div><textarea rows={3} placeholder="Deal notes, special terms, scoping details..." /></div>}

        {(vDeal || vLeg) && (
          <div className="S"><div className="H">Export</div>
            <button onClick={() => {
              const d = vDeal || {};
              const lines = [
                `Client: ${client}, Owner: ${owner}`,
                `Bundle: ${vBundle}, VDM Seats: ${vdm}`,
                vIsStd ? `Final Contract Price: ${fmt(d.finalPrice || 0)}` : `Legacy Price: ${fmt(legP)}`,
              ].filter(Boolean).join("\n");
              navigator.clipboard.writeText(lines);
              alert("Copied to clipboard. SW/Services split is for HubSpot only.");
            }} style={{ background: "#10285A", color: "white", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Copy for HubSpot
            </button>
          </div>
        )}
      </>)}

      {!isVision && (<>
        <div className="S"><div className="H">Product & Configuration</div>
          <div className="R">
            <div className="F"><label>Bundle Type</label>
              <select value={qBundle} onChange={e => { setQBundle(e.target.value); setQOptSvcIds([]); setPickOneId(QC.pickOneOptions[0].id); }}>
                {["None","Legacy","Essential","Essential Plus","Enhanced","Enterprise"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            {qIsStd && <>
              <div className="F"><label>Admin Seats</label>
                <input type="number" min={1} value={adminSeats} onChange={e => setAdminSeats(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="F"><label>Employee Records</label>
                <input type="number" min={1} value={empRecords} onChange={e => setEmpRecords(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
            </>}
          </div>
          {qIsStd && (
            <div className="R">
              <div className="F"><label>On-Prem? (+$15,000/yr)</label>
                <select value={qOnPrem ? "Yes" : "No"} onChange={e => setQOnPrem(e.target.value === "Yes")}><option>No</option><option>Yes</option></select>
              </div>
              <div className="F"><label>Managed IT Services? (+$7,000/yr)</label>
                <select value={managedIT ? "Yes" : "No"} onChange={e => setManagedIT(e.target.value === "Yes")}><option>No</option><option>Yes</option></select>
              </div>
            </div>
          )}
          {qSeatWarn && qIsStd && (
            <div style={{ background: "#fff3e0", border: "1px solid #E1941E", borderRadius: 6, padding: "8px 14px", marginTop: 4, fontSize: 13 }}>
              Seat count exceeds {qBundle} tier limits. Consider upgrading.
            </div>
          )}
        </div>

        {qIsLeg && (
          <div className="S"><div className="H">Legacy Pricing</div>
            <div className="R">
              <div className="F"><label>Prior Contract Value</label>
                <input type="number" value={priorValue} onChange={e => setPriorValue(e.target.value)} placeholder="Enter prior ACV" />
              </div>
              <div className="F"><label>Increase % (3-10%)</label>
                <input type="number" min={3} max={10} step={0.5} value={increasePct}
                  onChange={e => setIncreasePct(Math.min(10, Math.max(3, parseFloat(e.target.value) || 3)))} />
              </div>
            </div>
            {qLegacyPrice && (
              <div style={{ marginTop: 12 }}>
                <div className="sr"><span>Prior Contract</span><span>{fmt(qLegacyPrice.prior)}</span></div>
                <div className="sr"><span>Increase</span><span>+{qLegacyPrice.pctVal}%</span></div>
                <div className="sr t"><span>Legacy Price</span><span style={{ fontSize: 20 }}>{fmt(qLegacyPrice.price)}</span></div>
              </div>
            )}
          </div>
        )}

        {qIsStd && (
          <div className="S"><div className="H">Services - {qBundle}</div>
            {qAuto.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0a6b5a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Standard Inclusions</div>
              {qAuto.map(s => (
                <div key={s.id} className="sv">
                  <div className="dt au"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" /></svg></div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{s.name}</div>
                    {admin && <div style={{ fontSize: 11, color: "#575757", marginTop: 2 }}>{s.note} · Cost: {fmt(s.costToFLC)}</div>}
                  </div>
                  <div style={{ fontWeight: 600, color: mid }}>{fmt(s.list)}</div>
                </div>
              ))}
            </>}
            {qOptional.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#575757", textTransform: "uppercase", letterSpacing: 1, marginTop: 18, marginBottom: 6 }}>
                {qBundle === "Essential Plus" ? "A la carte - select all that apply" : "Optional Add-Ons"}
              </div>
              {qOptional.map(s => (
                <div key={s.id} className="sv" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => toggleQOpt(s.id)}>
                  <div className={`dt ${qOptSvcIds.includes(s.id) ? "on" : ""}`}>
                    {qOptSvcIds.includes(s.id) && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" /></svg>}
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{s.name}</div>
                    {admin && <div style={{ fontSize: 11, color: "#575757", marginTop: 2 }}>{s.note}</div>}
                  </div>
                  <div style={{ fontWeight: 600, color: mid }}>{fmt(s.list)}</div>
                </div>
              ))}
            </>}
            {hasPickOne && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#E1941E", textTransform: "uppercase", letterSpacing: 1, marginTop: 18, marginBottom: 8 }}>Enterprise Add-On - Select One</div>
              {QC.pickOneOptions.map(p => (
                <div key={p.id} className={`po ${pickOneId === p.id ? "sel" : ""}`} onClick={() => setPickOneId(p.id)}>
                  <div className="rb">{pickOneId === p.id && <div className="rb-dot" />}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {admin && <div style={{ fontSize: 11, color: "#575757", marginTop: 1 }}>Cost: {fmt(p.costToFLC)}</div>}
                  </div>
                  <div style={{ fontWeight: 600, color: mid, whiteSpace: "nowrap", marginLeft: 8 }}>{fmt(p.list)}</div>
                </div>
              ))}
            </>}
            <div style={{ marginTop: 14, padding: "10px 0", borderTop: "1px solid #e8ecf1", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
              <span>Services Total</span><span>{qDeal ? fmt(qDeal.svcTotal) : "$0"}</span>
            </div>
          </div>
        )}

        {qDeal && (
          <div className="S"><div className="H">Deal Estimate</div>
            <div className="sr"><span>SW License (tier base)</span><span>{fmt(qDeal.swBase)}</span></div>
            {qDeal.itAddOn > 0 && <>
              {qOnPrem   && <div className="sr" style={{ fontSize: 13, color: "#575757" }}><span>+ On-Prem</span><span>{fmt(QC.itAddOns.onPrem)}</span></div>}
              {managedIT && <div className="sr" style={{ fontSize: 13, color: "#575757" }}><span>+ Managed IT</span><span>{fmt(QC.itAddOns.managedIT)}</span></div>}
            </>}
            <div className="sr" style={{ fontWeight: 600 }}><span>SW + IT Total</span><span>{fmt(qDeal.swPrice)}</span></div>
            <div className="sr"><span>Professional Services</span><span>{fmt(qDeal.svcTotal)}</span></div>
            <div className="sr" style={{ fontWeight: 600 }}><span>List Total</span><span>{fmt(qDeal.listTotal)}</span></div>
            {renderDiscountBlock(qDisc, setQDisc, qDeal, qG, "Qlarity")}
            <div className="sr t"><span>Final Contract Price</span><span style={{ fontSize: 20 }}>{fmt(qDeal.finalPrice)}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span className={`B ${qDeal.swMargin >= .7 ? "bg" : qDeal.swMargin >= .5 ? "by" : "br"}`}>SW: {pct(qDeal.swMargin)}</span>
              <span className={`B ${qDeal.blendedMargin >= .6 ? "bg" : qDeal.blendedMargin >= .4 ? "by" : "br"}`}>Blended: {pct(qDeal.blendedMargin)}</span>
              {qDeal.belowFloor && <span className="B br">Below D&M cost floor</span>}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#5a6f87", marginBottom: 2 }}>Blended Margin</div>
              <div className="mt"><div className="mf" style={{ width: `${Math.min(100, Math.max(0, qDeal.blendedMargin * 100))}%`, background: qDeal.blendedMargin >= .6 ? "#71D2C5" : qDeal.blendedMargin >= .4 ? "#f0c36d" : "#e74c3c" }} /></div>
            </div>
            {admin && <div className="A"><h4>Pricing Breakdown (Admin Only)</h4>
              <div className="ar"><span>Qlarity D&M cost</span><span className="v">{fmt(QC.dmCostPerCust)}</span></div>
              <div className="ar"><span>Services cost to FLC</span><span className="v">{fmt(qDeal.svcCost)}</span></div>
              <div className="ar" style={{ fontWeight: 700 }}><span>Cost Floor (D&M basis)</span><span className="v">{fmt(qDeal.dmCostFloor)}</span></div>
            </div>}
          </div>
        )}

        {(qIsStd || qIsLeg) && <div className="S"><div className="H">Notes</div><textarea rows={3} placeholder="Deal notes, special terms, scoping details..." /></div>}

        {(qDeal || qLegacyPrice) && (
          <div className="S"><div className="H">Export</div>
            <button onClick={() => {
              const d = qDeal || {};
              const l = qLegacyPrice || {};
              const lines = [
                `Client: ${client}, Owner: ${owner}`,
                `Bundle: ${qBundle}`,
                qIsStd ? `Final Contract Price: ${fmt(d.finalPrice || 0)}` : `Legacy Price: ${fmt(l.price || 0)}`,
              ].filter(Boolean).join("\n");
              navigator.clipboard.writeText(lines);
              alert("Copied to clipboard. SW/Services split is for HubSpot only.");
            }} style={{ background: "#1B387D", color: "white", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Copy for HubSpot
            </button>
          </div>
        )}
      </>)}

      <div style={{ textAlign: "center", fontSize: 11, color: "#8a9bb5", marginTop: 14 }}>
        FOCUS Learning · Quote Builder · Internal Use Only · Confidential
      </div>
    </div>
  );
      }
