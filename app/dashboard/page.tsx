"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dasgboard.module.css";

// ── Types ──────────────────────────────────────────────
type NavItem = { id: string; label: string; icon: React.ReactNode };
type StatCard = { label: string; value: string; change: string; up: boolean; color: string; sparkData: number[] };
type Activity = { id: number; user: string; action: string; time: string; type: "success" | "warning" | "info" };

// ── Icon helpers (inline SVG — no extra dep) ───────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  employees: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  finance: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  inventory: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  analytics: "M18 20V10 M12 20V4 M6 20v-6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  trend_up: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  trend_down: "M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
  check: "M20 6L9 17l-5-5",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  info: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 8v4 M12 16h.01",
  chevron: "M9 18l6-6-6-6",
  menu: "M3 12h18 M3 6h18 M3 18h18",
  close: "M18 6L6 18 M6 6l12 12",
};

// ── Static data ────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",  icon: <Icon d={ICONS.dashboard} /> },
  { id: "employees", label: "Employees",  icon: <Icon d={ICONS.employees} /> },
  { id: "finance",   label: "Finance",    icon: <Icon d={ICONS.finance} /> },
  { id: "inventory", label: "Inventory",  icon: <Icon d={ICONS.inventory} /> },
  { id: "analytics", label: "Analytics",  icon: <Icon d={ICONS.analytics} /> },
  { id: "settings",  label: "Settings",   icon: <Icon d={ICONS.settings} /> },
];

const STATS: StatCard[] = [
  { label: "Total Employees", value: "2,841", change: "+12.4%", up: true,  color: "blue",   sparkData: [30,45,35,60,55,70,80] },
  { label: "Monthly Revenue", value: "₹42.8L", change: "+18.4%", up: true, color: "teal",   sparkData: [40,35,55,45,65,60,85] },
  { label: "Inventory Items", value: "8,350", change: "-2.1%",  up: false, color: "purple", sparkData: [80,75,70,78,72,68,65] },
  { label: "AI Predictions",  value: "97.2%", change: "+3.8%",  up: true,  color: "amber",  sparkData: [70,75,72,80,78,88,97] },
];

const ACTIVITIES: Activity[] = [
  { id:1, user:"Priya Sharma",   action:"Added 45 units to Inventory",  time:"2 min ago",  type:"success" },
  { id:2, user:"Ravi Kumar",     action:"Payroll processed for March",  time:"18 min ago", type:"info"    },
  { id:3, user:"Anita Verma",    action:"Low stock alert — Item #2041", time:"34 min ago", type:"warning" },
  { id:4, user:"Suresh Mehta",   action:"New employee onboarded",       time:"1 hr ago",   type:"success" },
  { id:5, user:"Kavya Singh",    action:"Q1 Finance report generated",  time:"2 hr ago",   type:"info"    },
  { id:6, user:"Deepak Joshi",   action:"Invoice #INV-8821 sent",       time:"3 hr ago",   type:"success" },
];

const QUICK_ACTIONS = [
  { label: "Add Employee",   color: "blue",   icon: ICONS.employees },
  { label: "Create Invoice", color: "teal",   icon: ICONS.finance   },
  { label: "Stock Update",   color: "purple", icon: ICONS.inventory },
  { label: "Run Payroll",    color: "amber",  icon: ICONS.finance   },
];

// ── Sparkline SVG ──────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80; const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  const strokeColor: Record<string, string> = {
    blue: "#3b82f6", teal: "#00c6a2", purple: "#8b5cf6", amber: "#f59e0b"
  };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={strokeColor[color]} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Donut chart (CSS-based) ────────────────────────────
function DonutChart() {
  const segments = [
    { label: "Finance",   pct: 35, color: "#3b82f6" },
    { label: "HR",        pct: 25, color: "#00c6a2" },
    { label: "Inventory", pct: 22, color: "#8b5cf6" },
    { label: "Payroll",   pct: 18, color: "#f59e0b" },
  ];
  let offset = 0;
  const r = 40; const cx = 50; const cy = 50;
  const circ = 2 * Math.PI * r;
  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 100 100" className={styles.donutSvg}>
        {segments.map((s) => {
          const dash = (s.pct / 100) * circ;
          const gap = circ - dash;
          const el = (
            <circle key={s.label} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth="12"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ / 100}
              style={{ transition: "stroke-dasharray .6s ease" }}
            />
          );
          offset += s.pct;
          return el;
        })}
        <circle cx={cx} cy={cy} r="28" fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">₹42.8L</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="6"  fill="#94a3b8">Total</text>
      </svg>
      <div className={styles.donutLegend}>
        {segments.map(s => (
          <div key={s.label} className={styles.donutItem}>
            <span className={styles.donutDot} style={{ background: s.color }} />
            <span className={styles.donutLabel}>{s.label}</span>
            <span className={styles.donutPct}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <div className={styles.root}>

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M4 9 L9 4 L14 9 L9 14Z" fill="white" opacity="0.9"/>
                <circle cx="9" cy="9" r="2.5" fill="white"/>
              </svg>
            </div>
            <div className={styles.logoText}>Nexa<span>ERP</span></div>
          </div>
          <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)}>
            <Icon d={ICONS.close} size={16} />
          </button>
        </div>

        <div className={styles.navSection}>
          <span className={styles.navSectionLabel}>Main Menu</span>
          <nav className={styles.nav}>
            {NAV_ITEMS.slice(0, 5).map(item => (
              <button key={item.id}
                className={`${styles.navItem} ${activeNav === item.id ? styles.navActive : ""}`}
                onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {activeNav === item.id && <span className={styles.navPip} />}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.navSection}>
          <span className={styles.navSectionLabel}>System</span>
          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${activeNav === "settings" ? styles.navActive : ""}`}
              onClick={() => setActiveNav("settings")}>
              <span className={styles.navIcon}><Icon d={ICONS.settings} /></span>
              <span className={styles.navLabel}>Settings</span>
            </button>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>RS</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Rahul Sharma</span>
              <span className={styles.userRole}>Admin</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <Icon d={ICONS.logout} size={16} />
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ── */}
      <div className={styles.main}>

        {/* TOP NAV */}
        <header className={styles.topbar}>
          <div className={styles.topLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Icon d={ICONS.menu} size={20} />
            </button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbRoot}>NexaERP</span>
              <Icon d={ICONS.chevron} size={14} />
              <span className={styles.breadcrumbPage}>{NAV_ITEMS.find(n => n.id === activeNav)?.label}</span>
            </div>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Icon d={ICONS.search} size={15} /></span>
            <input className={styles.searchInput} placeholder="Search employees, invoices…"
              value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          </div>

          <div className={styles.topRight}>
            <button className={styles.iconBtn}>
              <Icon d={ICONS.bell} size={18} />
              <span className={styles.notifDot} />
            </button>
            <div className={styles.topAvatar}>RS</div>
            <span className={styles.welcomeText}>Rahul&nbsp;👋</span>
          </div>
        </header>

        {/* CONTENT */}
        <main className={styles.content}>

          {/* Page heading */}
          <div className={styles.pageHead}>
            <div>
              <h1 className={styles.pageTitle}>Good morning, Rahul ☀️</h1>
              <p className={styles.pageSub}>Here&apos;s what&apos;s happening with your business today.</p>
            </div>
            <div className={styles.dateChip}>
              {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
            </div>
          </div>

          {/* STAT CARDS */}
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <div key={s.label} className={`${styles.statCard} ${styles[`stat_${s.color}`]}`}>
                <div className={styles.statTop}>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={`${styles.statBadge} ${s.up ? styles.badgeUp : styles.badgeDown}`}>
                    <Icon d={s.up ? ICONS.trend_up : ICONS.trend_down} size={11} />
                    {s.change}
                  </span>
                </div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statBottom}>
                  <Sparkline data={s.sparkData} color={s.color} />
                  <span className={styles.statPeriod}>Last 7 days</span>
                </div>
              </div>
            ))}
          </div>

          {/* MIDDLE ROW */}
          <div className={styles.midRow}>

            {/* Quick actions */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Quick Actions</h3>
              <div className={styles.quickGrid}>
                {QUICK_ACTIONS.map(a => (
                  <button key={a.label} className={`${styles.quickBtn} ${styles[`quick_${a.color}`]}`}>
                    <Icon d={a.icon} size={20} />
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue donut */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Revenue Breakdown</h3>
              <DonutChart />
            </div>

          </div>

          {/* BOTTOM ROW */}
          <div className={styles.bottomRow}>

            {/* Activity feed */}
            <div className={`${styles.card} ${styles.cardFlex}`}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <div className={styles.activityList}>
                {ACTIVITIES.map(a => (
                  <div key={a.id} className={styles.activityItem}>
                    <span className={`${styles.actIcon} ${styles[`act_${a.type}`]}`}>
                      <Icon d={a.type==="success" ? ICONS.check : a.type==="warning" ? ICONS.alert : ICONS.info} size={13} />
                    </span>
                    <div className={styles.actBody}>
                      <span className={styles.actUser}>{a.user}</span>
                      <span className={styles.actAction}>{a.action}</span>
                    </div>
                    <span className={styles.actTime}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights panel */}
            <div className={`${styles.card} ${styles.aiCard}`}>
              <div className={styles.aiHeader}>
                <div className={styles.aiOrb}>
                  <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
                    <path d="M12 18 Q18 8 24 18 Q18 28 12 18Z" fill="rgba(0,198,162,0.8)"/>
                    <circle cx="18" cy="18" r="3" fill="white" opacity="0.95"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.aiTitle}>AI Insights</h3>
                  <span className={styles.aiSub}>Powered by NexaAI</span>
                </div>
              </div>
              <div className={styles.insightList}>
                {[
                  { text: "Revenue up 18% — highest in Q1", type: "success" },
                  { text: "Item #2041 below reorder level", type: "warning" },
                  { text: "3 payroll tasks pending approval", type: "info"    },
                  { text: "14 new applicants this week",      type: "success" },
                ].map((ins, i) => (
                  <div key={i} className={`${styles.insightItem} ${styles[`ins_${ins.type}`]}`}>
                    <span className={styles.insightDot} />
                    {ins.text}
                  </div>
                ))}
              </div>
              <button className={styles.aiBtn}>View full report →</button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}