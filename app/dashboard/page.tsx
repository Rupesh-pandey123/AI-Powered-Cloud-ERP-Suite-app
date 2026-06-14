"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dasgboard.module.css";

// ── Types ──────────────────────────────────────────────
type NavItem = { id: string; label: string; icon: React.ReactNode };
type StatCard = { label: string; value: string; change: string; up: boolean; color: string; sparkData: number[] };
type Activity = { id: number; user: string; action: string; time: string; type: "success" | "warning" | "info" };

type Employee = { id: number; name: string; role: string; dept: string; status: "active" | "remote" | "onleave"; checkIn: string; salary: number };
type Invoice = { id: string; client: string; amount: number; status: "paid" | "pending" | "overdue"; date: string };
type InventoryItem = { sku: string; name: string; warehouse: string; stock: number; reorder: number; status: "instock" | "lowstock" | "outofstock" };

// ── Icon helpers (inline SVG — no extra dep) ───────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
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
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  refresh: "M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"
};

// ── Static/Initial Datasets ───────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",  icon: <Icon d={ICONS.dashboard} /> },
  { id: "employees", label: "Employees",  icon: <Icon d={ICONS.employees} /> },
  { id: "finance",   label: "Finance",    icon: <Icon d={ICONS.finance} /> },
  { id: "inventory", label: "Inventory",  icon: <Icon d={ICONS.inventory} /> },
  { id: "analytics", label: "Analytics",  icon: <Icon d={ICONS.analytics} /> },
  { id: "settings",  label: "Settings",   icon: <Icon d={ICONS.settings} /> },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 101, name: "Priya Sharma", role: "Inventory Lead", dept: "Supply Chain", status: "active", checkIn: "08:45 AM", salary: 85000 },
  { id: 102, name: "Ravi Kumar", role: "Payroll Manager", dept: "HR & Payroll", status: "active", checkIn: "09:02 AM", salary: 78000 },
  { id: 103, name: "Anita Verma", role: "Chief Accountant", dept: "Finance", status: "onleave", checkIn: "-", salary: 120000 },
  { id: 104, name: "Suresh Mehta", role: "Sales Executive", dept: "Sales & Marketing", status: "remote", checkIn: "09:30 AM", salary: 65000 },
  { id: 105, name: "Kavya Singh", role: "HR Generalist", dept: "HR & Payroll", status: "active", checkIn: "08:58 AM", salary: 72000 },
  { id: 106, name: "Deepak Joshi", role: "Financial Analyst", dept: "Finance", status: "active", checkIn: "09:15 AM", salary: 95000 },
  { id: 107, name: "Vikram Malhotra", role: "Senior Developer", dept: "Operations", status: "remote", checkIn: "10:00 AM", salary: 140000 }
];

const INITIAL_INVOICES: Invoice[] = [
  { id: "INV-8821", client: "Acme Industrial Solutions", amount: 142000, status: "paid", date: "01 May 2026" },
  { id: "INV-8822", client: "Global Tech Enterprises", amount: 85000, status: "pending", date: "15 May 2026" },
  { id: "INV-8823", client: "Nexa Retail Outlets", amount: 34000, status: "overdue", date: "10 Apr 2026" },
  { id: "INV-8824", client: "Zenith Holdings Ltd", amount: 210000, status: "paid", date: "24 May 2026" },
  { id: "INV-8825", client: "Apex Research Labs", amount: 115000, status: "pending", date: "28 May 2026" }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { sku: "SKU-2041", name: "AI Processing Units", warehouse: "Main Warehouse", stock: 12, reorder: 30, status: "lowstock" },
  { sku: "SKU-3092", name: "Edge Gateway Nodes", warehouse: "West Coast Branch", stock: 142, reorder: 40, status: "instock" },
  { sku: "SKU-1083", name: "Fiber Transceivers", warehouse: "Main Warehouse", stock: 0, reorder: 20, status: "outofstock" },
  { sku: "SKU-4911", name: "Server Rack Rails", warehouse: "South Branch", stock: 85, reorder: 25, status: "instock" },
  { sku: "SKU-5022", name: "Category 6A Cables", warehouse: "South Branch", stock: 450, reorder: 100, status: "instock" }
];

const ACTIVITIES = [
  { id: 1, user: "Priya Sharma",   action: "Added 45 units to Inventory",  time: "2 min ago",  type: "success" as const },
  { id: 2, user: "Ravi Kumar",     action: "Payroll processed for March",  time: "18 min ago", type: "info" as const    },
  { id: 3, user: "Anita Verma",    action: "Low stock alert — Item SKU-2041", time: "34 min ago", type: "warning" as const },
  { id: 4, user: "Suresh Mehta",   action: "New employee onboarded",       time: "1 hr ago",   type: "success" as const },
  { id: 5, user: "Kavya Singh",    action: "Q1 Finance report generated",  time: "2 hr ago",   type: "info" as const    },
  { id: 6, user: "Deepak Joshi",   action: "Invoice #INV-8821 sent",       time: "3 hr ago",   type: "success" as const },
];

const QUICK_ACTIONS = [
  { label: "Add Employee",   color: "blue",   actionType: "add_employee", icon: ICONS.employees },
  { label: "Create Invoice", color: "teal",   actionType: "create_invoice", icon: ICONS.finance   },
  { label: "Stock Update",   color: "purple", actionType: "stock_update", icon: ICONS.inventory },
  { label: "Run Payroll",    color: "amber",  actionType: "run_payroll", icon: ICONS.finance   },
];

const FORECAST_MODELS = {
  prophet: {
    name: "Prophet Forecasting Model",
    desc: "Additive regression model optimized for daily/weekly seasonality, trend shifts, and holiday impact estimation.",
    accuracy: "97.2%",
    time: "0.8 seconds",
    peak: "Mid-June: 28% demand spike",
    risk: "Low risk of inventory shortage due to high buffer stocks.",
    points: "10,180 40,160 70,140 100,150 130,90 160,80 190,110 220,80 250,60 280,30 310,40 340,20",
    confidence: "10,180 40,160 70,140 100,150 130,90 160,80 190,110 220,80 250,60 280,30 310,40 340,20 L 340,60 L 310,90 L 280,80 L 250,110 L 220,130 L 190,150 L 160,120 L 130,130 L 100,200 L 70,190 L 40,220 L 10,240 Z"
  },
  lstm: {
    name: "LSTM Deep Recurrent Network",
    desc: "Long Short-Term Memory neural network optimized for sequential pattern recognition and non-linear trend lines.",
    accuracy: "98.6%",
    time: "4.2 seconds",
    peak: "July: ₹52.4L revenue peak",
    risk: "Supplier disruption warning: High probability of late shipments in Warehouse B.",
    points: "10,170 40,140 70,160 100,130 130,110 160,95 190,70 220,50 250,45 280,35 310,20 340,10",
    confidence: "10,170 40,140 70,160 100,130 130,110 160,95 190,70 220,50 250,45 280,35 310,20 340,10 L 340,40 L 310,60 L 280,75 L 250,85 L 220,90 L 190,110 L 160,140 L 130,160 L 100,180 L 70,220 L 40,200 L 10,230 Z"
  },
  regression: {
    name: "Scikit-Learn Linear Regression",
    desc: "Ordinary Least Squares regression model designed for stable, linear baseline projections and noise filtering.",
    accuracy: "91.4%",
    time: "0.05 seconds",
    peak: "Q3-Q4: Steady 3.5% MoM growth",
    risk: "Inflation trend risk: Margins could contract by 1.8% if overhead expenses increase.",
    points: "10,190 40,175 70,160 100,145 130,130 160,115 190,100 220,85 250,70 280,55 310,40 340,25",
    confidence: "10,190 40,175 70,160 100,145 130,130 160,115 190,100 220,85 250,70 280,55 310,40 340,25 L 340,55 L 310,70 L 280,85 L 250,100 L 220,115 L 190,130 L 160,145 L 130,160 L 100,175 L 70,190 L 40,205 L 10,220 Z"
  }
};

const INITIAL_PROFILE = { name: "Rahul Sharma", email: "rahul@nexaerp.com", role: "Admin", company: "Nexa Tech Solutions" };

const INITIAL_RBAC = {
  "Super Admin": { Read: true, Write: true, Create: true, Delete: true, Export: true },
  "Tenant Admin": { Read: true, Write: true, Create: true, Delete: false, Export: true },
  "Finance Team": { Read: true, Write: true, Create: true, Delete: false, Export: false },
  "HR Team": { Read: true, Write: true, Create: false, Delete: false, Export: false },
  "Manager": { Read: true, Write: false, Create: false, Delete: false, Export: false }
};

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

// ── Main Component ────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // Stateful databases
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [activities, setActivities] = useState(ACTIVITIES);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [rbacRules, setRbacRules] = useState<Record<string, Record<string, boolean>>>(INITIAL_RBAC);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'prophet' | 'lstm' | 'regression'>('prophet');

  // Modals state
  const [addEmpOpen, setAddEmpOpen] = useState(false);
  const [createInvOpen, setCreateInvOpen] = useState(false);
  const [stockAdjustOpen, setStockAdjustOpen] = useState(false);

  // Form Fields State
  const [newEmp, setNewEmp] = useState({ name: "", email: "", role: "", dept: "Finance", status: "active" as const, salary: 65000 });
  const [newInv, setNewInv] = useState({ client: "", amount: 75000, status: "pending" as const });
  const [adjustStock, setAdjustStock] = useState({ sku: "SKU-2041", qty: 25 });

  // Processing Toasts Simulation
  const [toast, setToast] = useState<{ show: boolean; message: string; progress?: boolean }>({ show: false, message: "" });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    if (!token) router.push("/login");
    if (userEmail) {
      setProfile(prev => ({ ...prev, email: userEmail }));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const triggerToast = (msg: string, hasProgress = false) => {
    setToast({ show: true, message: msg, progress: hasProgress });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, hasProgress ? 2200 : 3000);
  };

  // Add Employee submit handler
  const handleAddEmployee = () => {
    if (!newEmp.name || !newEmp.email || !newEmp.role) {
      alert("Please fill in all employee fields.");
      return;
    }
    const newId = employees.length + 101;
    const newEmployee = {
      id: newId,
      name: newEmp.name,
      role: newEmp.role,
      dept: newEmp.dept,
      status: newEmp.status,
      checkIn: newEmp.status === "active" ? "09:00 AM" : "-",
      salary: newEmp.salary
    };

    setEmployees([newEmployee, ...employees]);
    setAddEmpOpen(false);

    // Prepend to activities feed
    const newAct = {
      id: Date.now(),
      user: profile.name,
      action: `Onboarded ${newEmp.name} as ${newEmp.role}`,
      time: "Just now",
      type: "success" as const
    };
    setActivities([newAct, ...activities]);

    triggerToast(`Employee onboarded successfully! (#EMP-${newId})`);
    // Reset form
    setNewEmp({ name: "", email: "", role: "", dept: "Finance", status: "active", salary: 65000 });
  };

  // Create Invoice submit handler
  const handleCreateInvoice = () => {
    if (!newInv.client || !newInv.amount) {
      alert("Please enter client details and amount.");
      return;
    }
    const newId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = {
      id: newId,
      client: newInv.client,
      amount: newInv.amount,
      status: newInv.status,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    };

    setInvoices([invoice, ...invoices]);
    setCreateInvOpen(false);

    const newAct = {
      id: Date.now(),
      user: profile.name,
      action: `Generated invoice ${newId} for ${newInv.client}`,
      time: "Just now",
      type: "success" as const
    };
    setActivities([newAct, ...activities]);

    triggerToast(`Invoice ${newId} created successfully!`);
    // Reset form
    setNewInv({ client: "", amount: 75000, status: "pending" });
  };

  // Stock update submit handler
  const handleStockUpdate = () => {
    const updatedInventory = inventory.map(item => {
      if (item.sku === adjustStock.sku) {
        const newStockLevel = Math.max(0, item.stock + adjustStock.qty);
        let computedStatus: "instock" | "lowstock" | "outofstock" = "instock";
        if (newStockLevel === 0) computedStatus = "outofstock";
        else if (newStockLevel <= item.reorder) computedStatus = "lowstock";

        return { ...item, stock: newStockLevel, status: computedStatus };
      }
      return item;
    });

    setInventory(updatedInventory);
    setStockAdjustOpen(false);

    const targetItemName = inventory.find(i => i.sku === adjustStock.sku)?.name || "Item";
    const newAct = {
      id: Date.now(),
      user: profile.name,
      action: `Adjusted ${targetItemName} stock by ${adjustStock.qty > 0 ? "+" : ""}${adjustStock.qty} units`,
      time: "Just now",
      type: "info" as const
    };
    setActivities([newAct, ...activities]);

    triggerToast(`Inventory stock level updated!`);
  };

  // Auto reorder replenishment simulation
  const handleAutoReorder = (sku: string) => {
    const updated = inventory.map(item => {
      if (item.sku === sku) {
        // Replenish to optimal level (reorder limit * 3)
        const refillAmt = item.reorder * 3;
        const addedQty = refillAmt - item.stock;

        setTimeout(() => {
          const newAct = {
            id: Date.now(),
            user: "NexaAI System",
            action: `Replenished stock of ${item.name} (+${addedQty} units)`,
            time: "Just now",
            type: "success" as const
          };
          setActivities(prev => [newAct, ...prev]);
        }, 1500);

        return { ...item, stock: refillAmt, status: "instock" as const };
      }
      return item;
    });

    setInventory(updated);
    triggerToast(`Fulfillment Order sent for ${sku}...`, true);
  };

  // Run payroll simulation
  const handleRunPayrollSimulation = () => {
    triggerToast("Compiling payroll datasets...", true);
    setTimeout(() => {
      const newAct = {
        id: Date.now(),
        user: "Finance Hub",
        action: `Processed salary disbursements for ${employees.length} employees`,
        time: "Just now",
        type: "success" as const
      };
      setActivities(prev => [newAct, ...prev]);
    }, 1500);
  };

  // Action: Terminate employee
  const handleTerminateEmp = (id: number) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    if (confirm(`Are you sure you want to process termination records for ${target.name}?`)) {
      setEmployees(employees.filter(e => e.id !== id));
      const newAct = {
        id: Date.now(),
        user: profile.name,
        action: `Processed exit records for ${target.name}`,
        time: "Just now",
        type: "warning" as const
      };
      setActivities([newAct, ...activities]);
      triggerToast(`Employee records updated.`);
    }
  };

  // Action: Delete invoice
  const handleDeleteInvoice = (id: string) => {
    if (confirm(`Remove ledger entry for invoice ${id}?`)) {
      setInvoices(invoices.filter(i => i.id !== id));
      triggerToast(`Ledger record deleted.`);
    }
  };

  // Quick Action Click Router
  const handleQuickAction = (actionType: string) => {
    if (actionType === "add_employee") setAddEmpOpen(true);
    else if (actionType === "create_invoice") setCreateInvOpen(true);
    else if (actionType === "stock_update") setStockAdjustOpen(true);
    else if (actionType === "run_payroll") handleRunPayrollSimulation();
  };

  // Compute stats card metrics
  const totalEmployeesCount = employees.length;
  const currentMonthRevenue = invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const lowStockCount = inventory.filter(i => i.status !== "instock").length;

  const STATS_CARDS: StatCard[] = [
    { label: "Total Employees", value: totalEmployeesCount.toString(), change: "+4.2%", up: true,  color: "blue",   sparkData: [30,35,38,40,42,44,employees.length * 10] },
    { label: "Monthly Revenue", value: `₹${(currentMonthRevenue / 100000).toFixed(2)}L`, change: "+18.4%", up: true, color: "teal",   sparkData: [40,35,55,45,65,60,85] },
    { label: "Inventory Alerts", value: lowStockCount.toString(), change: lowStockCount > 1 ? "+8.1%" : "-15.0%",  up: lowStockCount <= 1, color: "purple", sparkData: [8,6,5,4,2,3,lowStockCount * 2] },
    { label: "AI Predictions",  value: FORECAST_MODELS[selectedModel].accuracy, change: "+3.8%",  up: true,  color: "amber",  sparkData: [70,75,72,80,78,88,97] },
  ];

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
            <div className={styles.userAvatar}>
              {profile.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{profile.name}</span>
              <span className={styles.userRole}>{profile.role}</span>
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
            <div className={styles.topAvatar}>
              {profile.name.split(" ").map(n => n[0]).join("")}
            </div>
            <span className={styles.welcomeText}>{profile.name.split(" ")[0]}&nbsp;👋</span>
          </div>
        </header>

        {/* CONTENT PANEL */}
        <main className={styles.content}>

          {/* Page heading */}
          <div className={styles.pageHead}>
            <div>
              <h1 className={styles.pageTitle}>Welcome, {profile.email} ☀️</h1>
              <p className={styles.pageSub}>Here&apos;s what&apos;s happening with your business today.</p>
            </div>
            <div className={styles.dateChip}>
              {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
            </div>
          </div>

          {/* CONDITIONAL SUB VIEWS */}

          {activeNav === "dashboard" && (
            <div className="animate-pop">
              {/* STAT CARDS */}
              <div className={styles.statsGrid}>
                {STATS_CARDS.map((s) => (
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
                      <button key={a.label} className={`${styles.quickBtn} ${styles[`quick_${a.color}`]}`} onClick={() => handleQuickAction(a.actionType)}>
                        <Icon d={a.icon} size={20} />
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue Donut */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Revenue Allocation</h3>
                  <div className={styles.donutWrap}>
                    <svg viewBox="0 0 100 100" className={styles.donutSvg}>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="90 161.2" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#00c6a2" strokeWidth="12" strokeDasharray="63 188.2" strokeDashoffset="-90" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="55 196.2" strokeDashoffset="-153" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="43 208.2" strokeDashoffset="-208" />
                      <circle cx="50" cy="50" r="28" fill="white" />
                      <text x="50" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">
                        ₹{(currentMonthRevenue / 100000).toFixed(1)}L
                      </text>
                      <text x="50" y="59" textAnchor="middle" fontSize="6" fill="#94a3b8">Collected</text>
                    </svg>
                    <div className={styles.donutLegend}>
                      {[
                        { label: "Operations", pct: 36, color: "#3b82f6" },
                        { label: "Finances", pct: 25, color: "#00c6a2" },
                        { label: "Logistics", pct: 22, color: "#8b5cf6" },
                        { label: "Personnel", pct: 17, color: "#f59e0b" },
                      ].map(s => (
                        <div key={s.label} className={styles.donutItem}>
                          <span className={styles.donutDot} style={{ background: s.color }} />
                          <span className={styles.donutLabel}>{s.label}</span>
                          <span className={styles.donutPct}>{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className={styles.bottomRow}>
                {/* Activity feed */}
                <div className={`${styles.card} ${styles.cardFlex}`}>
                  <h3 className={styles.cardTitle}>Recent Activity</h3>
                  <div className={styles.activityList}>
                    {activities.slice(0, 6).map(a => (
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

                {/* AI Insights */}
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
                      { text: "Collection efficiency increased by 14% this month.", type: "success" as const },
                      { text: `${lowStockCount} inventory items are below reorder threshold.`, type: lowStockCount > 1 ? ("warning" as const) : ("info" as const) },
                      { text: `${employees.filter(e => e.status === "onleave").length} employees currently on leave records.`, type: "info" as const },
                    ].map((ins, i) => (
                      <div key={i} className={`${styles.insightItem} ${styles[`ins_${ins.type}`]}`}>
                        <span className={styles.insightDot} />
                        {ins.text}
                      </div>
                    ))}
                  </div>
                  <button className={styles.aiBtn} onClick={() => setActiveNav("analytics")}>Launch Forecasting Hub →</button>
                </div>
              </div>
            </div>
          )}

          {activeNav === "employees" && (
            <EmployeesTab
              employees={employees}
              onAddClick={() => setAddEmpOpen(true)}
              onDeleteEmp={handleTerminateEmp}
            />
          )}

          {activeNav === "finance" && (
            <FinanceTab
              invoices={invoices}
              onAddInvoiceClick={() => setCreateInvOpen(true)}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {activeNav === "inventory" && (
            <InventoryTab
              inventory={inventory}
              onReorder={handleAutoReorder}
              onAdjustClick={() => setStockAdjustOpen(true)}
            />
          )}

          {activeNav === "analytics" && (
            <AnalyticsTab
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          )}

          {activeNav === "settings" && (
            <SettingsTab
              profile={profile}
              onSaveProfile={(prof) => {
                setProfile(prof);
                triggerToast("User profile details updated.");
              }}
              mfaEnabled={mfaEnabled}
              onToggleMfa={setMfaEnabled}
              rbacRules={rbacRules}
              onTogglePermission={(role, perm) => {
                const currentVal = rbacRules[role][perm];
                setRbacRules({
                  ...rbacRules,
                  [role]: { ...rbacRules[role], [perm]: !currentVal }
                });
                triggerToast(`Permission matrix updated for ${role}.`);
              }}
            />
          )}

        </main>
      </div>

      {/* ── MODALS SECTION ── */}

      {/* Modal: Add Employee */}
      {addEmpOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Onboard Employee</h3>
              <button className={styles.modalClose} onClick={() => setAddEmpOpen(false)}>
                <Icon d={ICONS.close} size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  className={styles.formInput}
                  placeholder="E.g. Vikram Malhotra"
                  value={newEmp.name}
                  onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder="vikram@nexaerp.com"
                  value={newEmp.email}
                  onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Department</label>
                  <select
                    className={styles.formSelect}
                    value={newEmp.dept}
                    onChange={e => setNewEmp({ ...newEmp, dept: e.target.value })}
                  >
                    <option value="Finance">Finance</option>
                    <option value="HR & Payroll">HR & Payroll</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Role Title</label>
                  <input
                    className={styles.formInput}
                    placeholder="E.g. Financial Analyst"
                    value={newEmp.role}
                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Monthly Salary (₹)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={newEmp.salary}
                    onChange={e => setNewEmp({ ...newEmp, salary: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location Mode</label>
                  <select
                    className={styles.formSelect}
                    value={newEmp.status}
                    onChange={e => setNewEmp({ ...newEmp, status: e.target.value as any })}
                  >
                    <option value="active">Office Check-In</option>
                    <option value="remote">Remote Work</option>
                    <option value="onleave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setAddEmpOpen(false)}>Cancel</button>
              <button className={styles.btnConfirm} onClick={handleAddEmployee}>Onboard Staff</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Invoice */}
      {createInvOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Issue Ledger Invoice</h3>
              <button className={styles.modalClose} onClick={() => setCreateInvOpen(false)}>
                <Icon d={ICONS.close} size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Client Company Name</label>
                <input
                  className={styles.formInput}
                  placeholder="E.g. Zenith Holdings Ltd"
                  value={newInv.client}
                  onChange={e => setNewInv({ ...newInv, client: e.target.value })}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Invoice Amount (₹)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={newInv.amount}
                    onChange={e => setNewInv({ ...newInv, amount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Initial Ledger Status</label>
                  <select
                    className={styles.formSelect}
                    value={newInv.status}
                    onChange={e => setNewInv({ ...newInv, status: e.target.value as any })}
                  >
                    <option value="pending">Pending Payment</option>
                    <option value="paid">Paid Settlement</option>
                    <option value="overdue">Overdue Arrears</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setCreateInvOpen(false)}>Cancel</button>
              <button className={styles.btnConfirm} onClick={handleCreateInvoice}>Post Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Stock Adjust */}
      {stockAdjustOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Adjust Stock Allocation</h3>
              <button className={styles.modalClose} onClick={() => setStockAdjustOpen(false)}>
                <Icon d={ICONS.close} size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Inventory Product</label>
                <select
                  className={styles.formSelect}
                  value={adjustStock.sku}
                  onChange={e => setAdjustStock({ ...adjustStock, sku: e.target.value })}
                >
                  {inventory.map(item => (
                    <option key={item.sku} value={item.sku}>{item.name} ({item.sku})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Stock Delta Adjustment Quantity</label>
                <input
                  className={styles.formInput}
                  type="number"
                  placeholder="E.g. 50 (or -25 to deduct)"
                  value={adjustStock.qty}
                  onChange={e => setAdjustStock({ ...adjustStock, qty: parseInt(e.target.value) || 0 })}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  Use positive numbers to add stock, negative numbers to record consumption.
                </span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setStockAdjustOpen(false)}>Cancel</button>
              <button className={styles.btnConfirm} onClick={handleStockUpdate}>Apply Delta</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      {toast.show && (
        <div className={styles.processToast}>
          {toast.progress ? (
            <>
              <div className={styles.spin} style={{ width: 14, height: 14, borderWidth: 1.5 }} />
              <span>{toast.message}</span>
              <div className={styles.processBar}>
                <div className={styles.processBarFill} />
              </div>
            </>
          ) : (
            <>
              <Icon d={ICONS.check} size={16} />
              <span>{toast.message}</span>
            </>
          )}
        </div>
      )}

    </div>
  );
}

// ── SUB-PAGE COMPONENTS (Internal Bindings) ───────────

function EmployeesTab({
  employees,
  onAddClick,
  onDeleteEmp
}: {
  employees: typeof INITIAL_EMPLOYEES;
  onAddClick: () => void;
  onDeleteEmp: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const filtered = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "All" || e.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const depts = ["All", "Finance", "HR & Payroll", "Supply Chain", "Sales & Marketing", "Operations"];

  return (
    <div className="animate-pop">
      <div className={styles.filterRow}>
        <div className={styles.filterSearch}>
          <span className={styles.filterSearchIcon}><Icon d={ICONS.search} size={16} /></span>
          <input
            className={styles.filterSearchInput}
            placeholder="Search employees by name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.pillGroup}>
          {depts.map(d => (
            <button
              key={d}
              className={`${styles.pillBtn} ${deptFilter === d ? styles.pillBtnActive : ""}`}
              onClick={() => setDeptFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Staff Directory</h3>
          <button className={styles.btnConfirm} style={{ height: 34, padding: "0 12px", display: "flex", alignItems: "center", gap: 6 }} onClick={onAddClick}>
            <Icon d={ICONS.plus} size={14} />
            <span>Add Employee</span>
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Employee ID</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Department</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Monthly Salary</th>
                <th className={styles.th}>Check-In</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className={styles.tr}>
                  <td className={styles.td}>#EMP-{emp.id}</td>
                  <td className={styles.td} style={{ fontWeight: 500 }}>{emp.name}</td>
                  <td className={styles.td}>{emp.dept}</td>
                  <td className={styles.td}>{emp.role}</td>
                  <td className={styles.td}>₹{emp.salary.toLocaleString("en-IN")}</td>
                  <td className={styles.td}>{emp.checkIn}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[`badge_${emp.status}`]}`}>
                      <span className={styles.donutDot} style={{ width: 6, height: 6, marginRight: 4, background: emp.status==='active'?'#15803d':emp.status==='remote'?'#1d4ed8':'#b91c1c' }} />
                      {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button className={`${styles.actBtn} ${styles.actBtnDanger}`} onClick={() => onDeleteEmp(emp.id)} title="Terminate Employee">
                      <Icon d={ICONS.trash} size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={8} style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                    No employees found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinanceTab({
  invoices,
  onAddInvoiceClick,
  onDeleteInvoice
}: {
  invoices: typeof INITIAL_INVOICES;
  onAddInvoiceClick: () => void;
  onDeleteInvoice: (id: string) => void;
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = invoices.filter(inv => filterStatus === "all" || inv.status === filterStatus);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((acc, i) => acc + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === "pending").reduce((acc, i) => acc + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="animate-pop">
      <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
        <div className={`${styles.statCard} ${styles.stat_teal}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total Collected Revenue</span>
          </div>
          <div className={styles.statValue}>₹{(totalRevenue / 100000).toFixed(2)}L</div>
          <span className={styles.statPeriod}>From paid invoices</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat_blue}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Accounts Receivable</span>
          </div>
          <div className={styles.statValue}>₹{(outstanding / 100000).toFixed(2)}L</div>
          <span className={styles.statPeriod}>Pending collection</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat_amber}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Bad Debt Risk</span>
          </div>
          <div className={styles.statValue}>₹{(overdue / 100000).toFixed(2)}L</div>
          <span className={styles.statPeriod}>Overdue balance</span>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.pillGroup}>
          {["all", "paid", "pending", "overdue"].map(s => (
            <button
              key={s}
              className={`${styles.pillBtn} ${filterStatus === s ? styles.pillBtnActive : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.toUpperCase()} INVOICES
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Invoicing Ledger</h3>
          <button className={styles.btnConfirm} style={{ height: 34, padding: "0 12px", display: "flex", alignItems: "center", gap: 6 }} onClick={onAddInvoiceClick}>
            <Icon d={ICONS.plus} size={14} />
            <span>Create Invoice</span>
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Invoice ID</th>
                <th className={styles.th}>Client Name</th>
                <th className={styles.th}>Issue Date</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{inv.id}</td>
                  <td className={styles.td}>{inv.client}</td>
                  <td className={styles.td}>{inv.date}</td>
                  <td className={styles.td}>₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[`badge_${inv.status}`]}`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className={styles.actBtn} title="Download Invoice PDF">
                        <Icon d={ICONS.download} size={15} />
                      </button>
                      <button className={`${styles.actBtn} ${styles.actBtnDanger}`} onClick={() => onDeleteInvoice(inv.id)} title="Delete Ledger Record">
                        <Icon d={ICONS.trash} size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryTab({
  inventory,
  onReorder,
  onAdjustClick
}: {
  inventory: typeof INITIAL_INVENTORY;
  onReorder: (sku: string) => void;
  onAdjustClick: () => void;
}) {
  const [warehouse, setWarehouse] = useState("All");
  const filtered = inventory.filter(item => warehouse === "All" || item.warehouse === warehouse);

  const warehouses = ["All", "Main Warehouse", "West Coast Branch", "South Branch"];
  const outOfStockCount = inventory.filter(i => i.stock === 0).length;
  const lowStockCount = inventory.filter(i => i.stock > 0 && i.stock <= i.reorder).length;

  return (
    <div className="animate-pop">
      <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
        <div className={`${styles.statCard} ${styles.stat_blue}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total SKU Catalog</span>
          </div>
          <div className={styles.statValue}>{inventory.length}</div>
          <span className={styles.statPeriod}>Unique products monitored</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat_amber}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Low Stock Alerts</span>
          </div>
          <div className={styles.statValue}>{lowStockCount}</div>
          <span className={styles.statPeriod}>Below reorder thresholds</span>
        </div>
        <div className={`${styles.statCard} ${styles.stat_purple}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Out of Stock</span>
          </div>
          <div className={styles.statValue} style={{ color: outOfStockCount > 0 ? "#b91c1c" : "" }}>{outOfStockCount}</div>
          <span className={styles.statPeriod}>Requires replenishment</span>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>Warehouse:</span>
          <select
            className={styles.filterSelect}
            value={warehouse}
            onChange={e => setWarehouse(e.target.value)}
          >
            {warehouses.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className={styles.btnConfirm} style={{ height: 36, padding: "0 12px", display: "flex", alignItems: "center", gap: 6 }} onClick={onAdjustClick}>
            <Icon d={ICONS.plus} size={14} />
            <span>Manual Adjustment</span>
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Stock Replenishment Monitor</h3>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>SKU</th>
                <th className={styles.th}>Product Name</th>
                <th className={styles.th}>Warehouse Allocation</th>
                <th className={styles.th}>Stock Level</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Reorder Point</th>
                <th className={styles.th} style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const stockPercentage = Math.min(100, (item.stock / (item.reorder * 2)) * 100);
                const barColor = item.stock === 0 ? "#ef4444" : item.stock <= item.reorder ? "#f59e0b" : "#00c6a2";
                return (
                  <tr key={item.sku} className={styles.tr}>
                    <td className={styles.td} style={{ fontWeight: 600 }}>{item.sku}</td>
                    <td className={styles.td}>{item.name}</td>
                    <td className={styles.td}>{item.warehouse}</td>
                    <td className={styles.td}>
                      <div className={styles.stockBarBg}>
                        <div className={styles.stockBarFill} style={{ width: `${stockPercentage}%`, background: barColor }} />
                      </div>
                      <span className={styles.stockText}>{item.stock} units</span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${styles[`badge_${item.status}`]}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.td}>{item.reorder} units</td>
                    <td className={styles.td} style={{ textAlign: "center" }}>
                      {item.status !== "instock" ? (
                        <button className={styles.btnConfirm} style={{ height: 28, fontSize: 11, padding: "0 10px" }} onClick={() => onReorder(item.sku)}>
                          Auto-Reorder
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Optimal Stock ✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({
  selectedModel,
  onSelectModel
}: {
  selectedModel: 'prophet' | 'lstm' | 'regression';
  onSelectModel: (m: 'prophet' | 'lstm' | 'regression') => void;
}) {
  const modelInfo = FORECAST_MODELS[selectedModel];
  return (
    <div className="animate-pop" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
      {/* Dynamic Forecasting SVG Chart */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.tableTitle}>{modelInfo.name} — Forecast</h3>
            <span style={{ fontSize: 12, color: "#64748b" }}>Past (Jan-May) vs Predicted (Jun-Dec)</span>
          </div>
          <select
            className={styles.filterSelect}
            value={selectedModel}
            onChange={e => onSelectModel(e.target.value as any)}
            style={{ fontWeight: 600, color: "#1a56db", border: "1.5px solid #1a56db" }}
          >
            <option value="prophet">Prophet Model (Demand)</option>
            <option value="lstm">LSTM Network (Sales)</option>
            <option value="regression">Linear Regression (Trends)</option>
          </select>
        </div>

        <div className={styles.chartArea}>
          <svg viewBox="0 0 360 220" width="100%" height="100%">
            {/* Grid lines */}
            <line x1="20" y1="20" x2="350" y2="20" className={styles.chartGridLine} />
            <line x1="20" y1="65" x2="350" y2="65" className={styles.chartGridLine} />
            <line x1="20" y1="110" x2="350" y2="110" className={styles.chartGridLine} />
            <line x1="20" y1="155" x2="350" y2="155" className={styles.chartGridLine} />
            <line x1="20" y1="200" x2="350" y2="200" className={styles.chartGridLine} />

            {/* Separator line between historical and prediction */}
            <line x1="160" y1="10" x2="160" y2="200" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="164" y="22" fill="#64748b" fontSize="8" fontWeight="600">PREDICTION HORIZON</text>

            {/* Confidence Band Shaded Region */}
            <polygon
              key={`confidence-${selectedModel}`}
              points={modelInfo.confidence}
              fill="rgba(59, 130, 246, 0.08)"
              className={styles.chartAreaPath}
            />

            {/* Forecast Line */}
            <polyline
              key={`line-${selectedModel}`}
              points={modelInfo.points}
              fill="none"
              stroke="#1a56db"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.chartPath}
            />

            {/* Historical data dots */}
            <circle cx="10" cy="180" r="4" fill="#00c6a2" />
            <circle cx="40" cy="160" r="4" fill="#00c6a2" />
            <circle cx="70" cy="140" r="4" fill="#00c6a2" />
            <circle cx="100" cy="150" r="4" fill="#00c6a2" />
            <circle cx="130" cy="90" r="4" fill="#00c6a2" />
            <circle cx="160" cy="80" r="4" fill="#00c6a2" />

            {/* X Axis Labels */}
            <text x="10" y="215" textAnchor="middle" className={styles.chartGridText}>Jan</text>
            <text x="40" y="215" textAnchor="middle" className={styles.chartGridText}>Feb</text>
            <text x="70" y="215" textAnchor="middle" className={styles.chartGridText}>Mar</text>
            <text x="100" y="215" textAnchor="middle" className={styles.chartGridText}>Apr</text>
            <text x="130" y="215" textAnchor="middle" className={styles.chartGridText}>May</text>
            <text x="160" y="215" textAnchor="middle" className={styles.chartGridText}>Jun</text>
            <text x="190" y="215" textAnchor="middle" className={styles.chartGridText}>Jul</text>
            <text x="220" y="215" textAnchor="middle" className={styles.chartGridText}>Aug</text>
            <text x="250" y="215" textAnchor="middle" className={styles.chartGridText}>Sep</text>
            <text x="280" y="215" textAnchor="middle" className={styles.chartGridText}>Oct</text>
            <text x="310" y="215" textAnchor="middle" className={styles.chartGridText}>Nov</text>
            <text x="340" y="215" textAnchor="middle" className={styles.chartGridText}>Dec</text>
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
            <span style={{ width: 10, height: 10, background: "#00c6a2", borderRadius: "50%", display: "inline-block" }} /> Historical Actuals
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
            <span style={{ width: 14, height: 3, background: "#1a56db", display: "inline-block" }} /> AI Projection
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
            <span style={{ width: 14, height: 10, background: "rgba(59, 130, 246, 0.12)", border: "1px dashed rgba(59, 130, 246, 0.3)", display: "inline-block" }} /> 95% Confidence Band
          </span>
        </div>
      </div>

      {/* Forecasting Details Panel */}
      <div className={styles.settingsCard} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className={styles.aiOrb} style={{ width: 34, height: 34 }}>
              <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
                <path d="M12 18 Q18 8 24 18 Q18 28 12 18Z" fill="#00c6a2"/>
              </svg>
            </span>
            <h4 className={styles.aiTitle} style={{ color: "#0f172a", margin: 0 }}>Model Diagnostics</h4>
          </div>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{modelInfo.desc}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Forecast Accuracy (R²):</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0d9488" }}>{modelInfo.accuracy}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Training Speed:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{modelInfo.time}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Next Predicted Peak:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a56db" }}>{modelInfo.peak}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div className={`${styles.insightItem} ${styles.ins_warning_border}`} style={{ marginBottom: 14, background: "#fffbeb", color: "#b45309" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Risk Detection</div>
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>{modelInfo.risk}</div>
          </div>
          <button className={styles.btnConfirm} style={{ width: "100%" }}>
            Generate Forecast Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  profile,
  onSaveProfile,
  mfaEnabled,
  onToggleMfa,
  rbacRules,
  onTogglePermission
}: {
  profile: typeof INITIAL_PROFILE;
  onSaveProfile: (prof: typeof INITIAL_PROFILE) => void;
  mfaEnabled: boolean;
  onToggleMfa: (val: boolean) => void;
  rbacRules: Record<string, Record<string, boolean>>;
  onTogglePermission: (role: string, perm: string) => void;
}) {
  const [profileForm, setProfileForm] = useState(profile);
  const [mfaSetup, setMfaSetup] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  const handleSave = () => {
    onSaveProfile(profileForm);
  };

  const handleMfaSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setMfaSetup(true);
    } else {
      onToggleMfa(false);
      setMfaSetup(false);
    }
  };

  const handleVerifyMfa = () => {
    if (mfaCode === "123456" || mfaCode.length === 6) {
      onToggleMfa(true);
      setMfaSetup(false);
      setMfaCode("");
    } else {
      alert("Invalid verification code. Enter a 6-digit code (e.g. 123456)");
    }
  };

  const permissions = ["Read", "Write", "Create", "Delete", "Export"];
  const roles = Object.keys(rbacRules);

  return (
    <div className={`${styles.settingsGrid} animate-pop`}>
      {/* Left panel: Profile and RBAC */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Profile Card */}
        <div className={styles.settingsCard}>
          <h3 className={styles.settingsSecTitle}>Profile Information</h3>
          <div className={styles.profileAvatarSection}>
            <div className={styles.profileAvatar}>
              {profileForm.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{profileForm.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{profileForm.role}</div>
              <span className={styles.profileAvatarUpload}>Change Profile Image</span>
            </div>
          </div>

          <div className={styles.modalBody} style={{ padding: 0 }}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  className={styles.formInput}
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  className={styles.formInput}
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role</label>
                <input
                  className={styles.formInput}
                  value={profileForm.role}
                  disabled
                  style={{ background: "#f8fafc", color: "#64748b" }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tenant Company</label>
                <input
                  className={styles.formInput}
                  value={profileForm.company}
                  disabled
                  style={{ background: "#f8fafc", color: "#64748b" }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button className={styles.btnConfirm} onClick={handleSave}>Save Profile Details</button>
          </div>
        </div>

        {/* RBAC Grid */}
        <div className={styles.settingsCard}>
          <h3 className={styles.settingsSecTitle}>Role-Based Access Control (RBAC) Matrix</h3>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: -8, marginBottom: 12 }}>
            Adjust the permissions mapped to specific user roles across the NexaERP tenant environment.
          </p>
          <div className={styles.rbacTableWrap}>
            <table className={styles.rbacTable}>
              <thead>
                <tr>
                  <th className={styles.rbacTh}>Role</th>
                  {permissions.map(p => (
                    <th key={p} className={styles.rbacTh} style={{ textAlign: "center" }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role} className={styles.rbacTr}>
                    <td className={styles.rbacTd} style={{ fontWeight: 600, color: "#0f172a" }}>{role}</td>
                    {permissions.map(perm => (
                      <td key={perm} className={styles.rbacTd} style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className={styles.rbacCheckbox}
                          checked={rbacRules[role][perm]}
                          onChange={() => onTogglePermission(role, perm)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right panel: Security & MFA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className={styles.settingsCard}>
          <h3 className={styles.settingsSecTitle}>Security Settings</h3>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Multi-Factor Authentication (MFA)</span>
              <span className={styles.toggleDesc}>Secure account access with one-time verification codes.</span>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" checked={mfaEnabled || mfaSetup} onChange={handleMfaSwitch} />
              <span className={styles.slider} />
            </label>
          </div>

          {mfaSetup && (
            <div className={`${styles.mfaBox} animate-pop`}>
              <div className={styles.qrPlaceholder}>
                <svg width="80" height="80" viewBox="0 0 10 10">
                  <rect width="10" height="10" fill="none" />
                  <path d="M0,0 h3 v3 h-3 z M7,0 h3 v3 h-3 z M0,7 h3 v3 h-3 z M5,5 h1 v1 h-1 z" fill="#0f172a" />
                  <path d="M1,1 h1 v1 h-1 z M8,1 h1 v1 h-1 z M1,8 h1 v1 h-1 z" fill="white" />
                  <path d="M4,1 h1 v1 h-1 z M5,3 h2 v1 h-2 z M3,6 h1 v2 h-1 z M8,8 h1 v2 h-1 z M6,7 h2 v1 h-2 z" fill="#0f172a" />
                </svg>
              </div>
              <p style={{ fontSize: 11, color: "#475569", margin: "0 0 12px 0" }}>
                Scan the QR code in Google Authenticator or Microsoft Authenticator, then enter the 6-digit verification code below.
              </p>
              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <input
                  className={styles.formInput}
                  placeholder="Code (e.g. 123456)"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  maxLength={6}
                  style={{ flex: 1, textAlign: "center", fontSize: 16, letterSpacing: 4 }}
                />
                <button className={styles.btnConfirm} onClick={handleVerifyMfa}>Verify</button>
              </div>
            </div>
          )}

          {mfaEnabled && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%" }} />
              MFA Protection Active (SSO / Device Authenticated)
            </div>
          )}

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Session Timeout</span>
              <span className={styles.toggleDesc}>Automatically log out after 30 minutes of inactivity.</span>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>IP Whitelisting</span>
              <span className={styles.toggleDesc}>Restrict console access to company office IP addresses.</span>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" />
              <span className={styles.slider} />
            </label>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <h3 className={styles.settingsSecTitle}>Tenant Information</h3>
          <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <span style={{ color: "#64748b" }}>Tenant ID:</span>
              <span style={{ fontWeight: 600, float: "right" }}>tnt_nexa_tech_0921a</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Billing Tier:</span>
              <span style={{ fontWeight: 600, color: "#1a56db", float: "right" }}>Enterprise SaaS Plan</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Active Nodes:</span>
              <span style={{ fontWeight: 600, float: "right" }}>14 Local Clusters</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Database Sync:</span>
              <span style={{ fontWeight: 600, color: "#0d9488", float: "right" }}>Optimal (18ms delay)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}