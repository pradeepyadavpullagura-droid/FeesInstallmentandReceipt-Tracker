/**
 * Fees Installment & Receipt Tracker - Core Application Script
 * Managing State, LocalStorage, SVG Charting, Custom Receipt compilers, and Reminders
 */

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper for relative date formatting
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper to generate dynamic dates relative to today
const getRelativeDateString = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// --- INITIAL RICH MOCK DATA ---
const INITIAL_STUDENTS = [
  {
    id: "STU-2026-001",
    name: "Sophia Patel",
    class: "Playgroup",
    parentName: "Aarav Patel",
    parentPhone: "+91 98765 43210",
    parentEmail: "aarav.patel@example.com",
    admissionDate: getRelativeDateString(-90),
    admissionFee: 30000,
    termFee: 80000,
    daycareFee: 40000,
    totalFee: 150000,
    installments: [
      {
        description: "1st Installment (Upfront & Admission)",
        amount: 75000,
        paidAmount: 75000,
        dueDate: getRelativeDateString(-85),
        status: "Paid"
      },
      {
        description: "2nd Installment (Mid-term Dues)",
        amount: 75000,
        paidAmount: 0,
        dueDate: getRelativeDateString(15),
        status: "Pending"
      }
    ],
    payments: [
      {
        receiptId: "REC-2026-8001",
        installmentIdx: 0,
        amount: 75000,
        date: getRelativeDateString(-85),
        method: "UPI / QR",
        refNumber: "UPI8374910294",
        notes: "Paid on enrollment day. Fast clearance."
      }
    ],
    communicationHistory: [
      {
        type: "WhatsApp",
        templateType: "pre-due",
        date: getRelativeDateString(-88),
        preview: "Sent enrollment fee receipt confirmation."
      }
    ]
  },
  {
    id: "STU-2026-002",
    name: "Ethan Hunt",
    class: "Nursery",
    parentName: "Sarah Hunt",
    parentPhone: "+91 98765 43211",
    parentEmail: "sarah.hunt@example.com",
    admissionDate: getRelativeDateString(-120),
    admissionFee: 30000,
    termFee: 80000,
    daycareFee: 0,
    totalFee: 110000,
    installments: [
      {
        description: "Single Installment (Full Upfront)",
        amount: 110000,
        paidAmount: 110000,
        dueDate: getRelativeDateString(-115),
        status: "Paid"
      }
    ],
    payments: [
      {
        receiptId: "REC-2026-8002",
        installmentIdx: 0,
        amount: 110000,
        date: getRelativeDateString(-115),
        method: "Bank Transfer",
        refNumber: "IMPS-OK-983021",
        notes: "Paid full amount to receive early-bird discount."
      }
    ],
    communicationHistory: []
  },
  {
    id: "STU-2026-003",
    name: "Aisha Rahman",
    class: "UKG",
    parentName: "Tariq Rahman",
    parentPhone: "+91 98765 43212",
    parentEmail: "t.rahman@example.com",
    admissionDate: getRelativeDateString(-60),
    admissionFee: 30000,
    termFee: 100000,
    daycareFee: 50000,
    totalFee: 180000,
    installments: [
      {
        description: "1st Term Split",
        amount: 60000,
        paidAmount: 60000,
        dueDate: getRelativeDateString(-55),
        status: "Paid"
      },
      {
        description: "2nd Term Split",
        amount: 60000,
        paidAmount: 20000,
        dueDate: getRelativeDateString(-5), // Overdue by 5 days!
        status: "Overdue"
      },
      {
        description: "3rd Term Split",
        amount: 60000,
        paidAmount: 0,
        dueDate: getRelativeDateString(35),
        status: "Pending"
      }
    ],
    payments: [
      {
        receiptId: "REC-2026-8003",
        installmentIdx: 0,
        amount: 60000,
        date: getRelativeDateString(-55),
        method: "UPI / QR",
        refNumber: "UPI0984328402",
        notes: "First term clearance payment."
      },
      {
        receiptId: "REC-2026-8004",
        installmentIdx: 1,
        amount: 20000,
        date: getRelativeDateString(-4),
        method: "Cash",
        refNumber: "CASH-CHQ-102",
        notes: "Partial payment handed over at front desk."
      }
    ],
    communicationHistory: [
      {
        type: "WhatsApp",
        templateType: "due-today",
        date: getRelativeDateString(-5),
        preview: "Sent automated alert for 2nd installment split."
      }
    ]
  },
  {
    id: "STU-2026-004",
    name: "Lucas Miller",
    class: "LKG",
    parentName: "Emily Miller",
    parentPhone: "+91 98765 43213",
    parentEmail: "emily.miller@example.com",
    admissionDate: getRelativeDateString(-30),
    admissionFee: 30000,
    termFee: 80000,
    daycareFee: 0,
    totalFee: 110000,
    installments: [
      {
        description: "1st Installment Split",
        amount: 55000,
        paidAmount: 0,
        dueDate: getRelativeDateString(-15), // Overdue by 15 days!
        status: "Overdue"
      },
      {
        description: "2nd Installment Split",
        amount: 55000,
        paidAmount: 0,
        dueDate: getRelativeDateString(20),
        status: "Pending"
      }
    ],
    payments: [],
    communicationHistory: []
  },
  {
    id: "STU-2026-005",
    name: "Chloe Davis",
    class: "Daycare Regular",
    parentName: "John Davis",
    parentPhone: "+91 98765 43214",
    parentEmail: "john.davis@example.com",
    admissionDate: getRelativeDateString(-80),
    admissionFee: 10000,
    termFee: 0,
    daycareFee: 80000,
    totalFee: 90000,
    installments: [
      {
        description: "1st Installment",
        amount: 22500,
        paidAmount: 22500,
        dueDate: getRelativeDateString(-75),
        status: "Paid"
      },
      {
        description: "2nd Installment",
        amount: 22500,
        paidAmount: 22500,
        dueDate: getRelativeDateString(-45),
        status: "Paid"
      },
      {
        description: "3rd Installment",
        amount: 22500,
        paidAmount: 10000,
        dueDate: getRelativeDateString(10), // Pending split
        status: "Pending"
      },
      {
        description: "4th Installment",
        amount: 22500,
        paidAmount: 0,
        dueDate: getRelativeDateString(40),
        status: "Pending"
      }
    ],
    payments: [
      {
        receiptId: "REC-2026-8005",
        installmentIdx: 0,
        amount: 22500,
        date: getRelativeDateString(-75),
        method: "Credit / Debit Card",
        refNumber: "CARD-AUTH-92048",
        notes: "Automated recurring card processing."
      },
      {
        receiptId: "REC-2026-8006",
        installmentIdx: 1,
        amount: 22500,
        date: getRelativeDateString(-45),
        method: "Credit / Debit Card",
        refNumber: "CARD-AUTH-98302",
        notes: "Automated recurring card processing."
      },
      {
        receiptId: "REC-2026-8007",
        installmentIdx: 2,
        amount: 10000,
        date: getRelativeDateString(-2),
        method: "Cash",
        refNumber: "CASH-2204",
        notes: "Cash advance payment."
      }
    ],
    communicationHistory: []
  },
  {
    id: "STU-2026-006",
    name: "Mason Wilson",
    class: "Nursery",
    parentName: "Amanda Wilson",
    parentPhone: "+91 98765 43215",
    parentEmail: "amanda.wilson@example.com",
    admissionDate: getRelativeDateString(-10),
    admissionFee: 30000,
    termFee: 80000,
    daycareFee: 0,
    totalFee: 110000,
    installments: [
      {
        description: "Single Upfront Dues",
        amount: 110000,
        paidAmount: 0,
        dueDate: getRelativeDateString(10), // Due in 10 days
        status: "Pending"
      }
    ],
    payments: [],
    communicationHistory: []
  }
];

// --- STATE MANAGEMENT ---
class FeeTrackerState {
  constructor() {
    this.students = this.loadStudents();
    this.activeView = 'view-dashboard';
    this.selectedStudentId = null;
    this.theme = 'dark';
    this.adminSettings = this.loadAdminSettings();
    this.classes = this.loadClasses();
  }

  loadClasses() {
    const saved = localStorage.getItem('fee_tracker_classes_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved classes", e);
      }
    }
    const defaultClasses = ["Playgroup", "Nursery", "LKG", "UKG", "Daycare Regular"];
    localStorage.setItem('fee_tracker_classes_list', JSON.stringify(defaultClasses));
    return defaultClasses;
  }

  addClass(className) {
    const cleaned = className.trim();
    if (!cleaned) return false;
    if (!this.classes.includes(cleaned)) {
      this.classes.push(cleaned);
      localStorage.setItem('fee_tracker_classes_list', JSON.stringify(this.classes));
      this.applyClassesToUI();
      return true;
    }
    return false;
  }

  deleteClass(className) {
    this.classes = this.classes.filter(c => c !== className);
    localStorage.setItem('fee_tracker_classes_list', JSON.stringify(this.classes));
    this.applyClassesToUI();
  }

  applyClassesToUI() {
    // Populate Registry Select Class dropdown
    const formClass = document.getElementById('form-class');
    if (formClass) {
      formClass.innerHTML = this.classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    // Populate Directory Filter Class selector
    const filterClass = document.getElementById('filter-class');
    if (filterClass) {
      filterClass.innerHTML = `<option value="all">All Classes</option>` + this.classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    // Render dynamic Class Manager widget list inside Settings View
    renderClassManager();
  }

  loadAdminSettings() {
    const saved = localStorage.getItem('fee_tracker_admin_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing admin settings, using default", e);
      }
    }
    const defaultSettings = {
      schoolName: "LITTLE ANCHORS",
      schoolTagline: "PRESCHOOL & DAYCARE",
      schoolUpi: "clearfee@upi",
      schoolPhone: "+91 98765 43210",
      schoolEmail: "office@littleanchors.edu",
      defaultFee: 150000,
      defaultSplits: 3
    };
    localStorage.setItem('fee_tracker_admin_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  saveAdminSettings(settings) {
    this.adminSettings = settings;
    localStorage.setItem('fee_tracker_admin_settings', JSON.stringify(settings));
    this.applyAdminSettings();
  }

  applyAdminSettings() {
    const s = this.adminSettings;
    
    // Update sidebar brand
    const sidebarBrand = document.getElementById('sidebar-brand-container');
    if (sidebarBrand) {
      sidebarBrand.innerHTML = `${s.schoolName.toUpperCase()} <span id="sidebar-brand-tagline">${s.schoolTagline.toUpperCase()}</span>`;
    }

    // Update receipt brands
    const recTitle = document.getElementById('receipt-brand-title');
    if (recTitle) {
      recTitle.innerHTML = `${s.schoolName.toUpperCase()} <span>${s.schoolTagline.toUpperCase()}</span>`;
    }

    // Update settings form input values if in settings view
    const setName = document.getElementById('set-school-name');
    if (setName) setName.value = s.schoolName;
    const setTagline = document.getElementById('set-school-tagline');
    if (setTagline) setTagline.value = s.schoolTagline;
    const setUpi = document.getElementById('set-school-upi');
    if (setUpi) setUpi.value = s.schoolUpi;
    const setPhone = document.getElementById('set-school-phone');
    if (setPhone) setPhone.value = s.schoolPhone;
    const setEmail = document.getElementById('set-school-email');
    if (setEmail) setEmail.value = s.schoolEmail;
    const setFee = document.getElementById('set-default-fee');
    if (setFee) setFee.value = s.defaultFee;
    const setSplits = document.getElementById('set-default-splits');
    if (setSplits) setSplits.value = s.defaultSplits;
  }

  loadStudents() {
    const saved = localStorage.getItem('fee_tracker_students_inr');
    if (saved) {
      try {
        const students = JSON.parse(saved);
        // Refresh statuses relative to current system time dynamically!
        this.verifyAndAutoUpdateStatuses(students);
        return students;
      } catch (e) {
        console.error("Error parsing saved students, resetting to mock data", e);
      }
    }
    // Initialize mock data relative to current time
    localStorage.setItem('fee_tracker_students_inr', JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }

  saveStudents() {
    localStorage.setItem('fee_tracker_students_inr', JSON.stringify(this.students));
  }

  // Automatically update statuses based on system date
  verifyAndAutoUpdateStatuses(students) {
    const today = new Date().toISOString().split('T')[0];
    students.forEach(student => {
      student.installments.forEach(inst => {
        if (inst.paidAmount >= inst.amount) {
          inst.status = "Paid";
        } else if (inst.dueDate < today && inst.paidAmount < inst.amount) {
          inst.status = "Overdue";
        } else if (inst.paidAmount > 0 && inst.paidAmount < inst.amount) {
          inst.status = "Pending"; // Partially paid but not past due
        } else {
          inst.status = "Pending";
        }
      });
    });
  }

  // Get student by ID
  getStudent(id) {
    return this.students.find(s => s.id === id);
  }

  // Calculations for Stats Card
  getFinancialSummary() {
    let totalExpected = 0;
    let totalCollected = 0;
    let totalOverdue = 0;
    let overdueCount = 0;
    const today = new Date().toISOString().split('T')[0];

    this.students.forEach(student => {
      totalExpected += student.totalFee;
      
      // Collected sum from payment array
      student.payments.forEach(p => {
        totalCollected += p.amount;
      });

      // Overdue sum based on individual installment schedule
      student.installments.forEach(inst => {
        const unpaid = inst.amount - inst.paidAmount;
        if (unpaid > 0) {
          if (inst.dueDate < today) {
            totalOverdue += unpaid;
            overdueCount++;
          }
        }
      });
    });

    const outstanding = totalExpected - totalCollected;
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
    const outstandingRate = totalExpected > 0 ? (outstanding / totalExpected) * 100 : 0;

    return {
      totalExpected,
      totalCollected,
      outstanding,
      totalOverdue,
      overdueCount,
      collectionRate: collectionRate.toFixed(1),
      outstandingRate: outstandingRate.toFixed(1)
    };
  }

  // Get list of students with overdue fees for follow-ups
  getOverdueStudentsList() {
    const today = new Date().toISOString().split('T')[0];
    const overdueList = [];

    this.students.forEach(student => {
      let studentOverdueAmt = 0;
      let worstDueDays = 0;
      let earliestOverdueDate = null;

      student.installments.forEach(inst => {
        const unpaid = inst.amount - inst.paidAmount;
        if (unpaid > 0 && inst.dueDate < today) {
          studentOverdueAmt += unpaid;
          
          const diffTime = Math.abs(new Date(today) - new Date(inst.dueDate));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > worstDueDays) {
            worstDueDays = diffDays;
            earliestOverdueDate = inst.dueDate;
          }
        }
      });

      if (studentOverdueAmt > 0) {
        overdueList.push({
          studentId: student.id,
          name: student.name,
          class: student.class,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
          overdueAmount: studentOverdueAmt,
          daysOverdue: worstDueDays,
          dueDate: earliestOverdueDate
        });
      }
    });

    // Sort by days overdue descending
    return overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  // Add new student
  addStudent(studentData) {
    const totalFee = parseFloat(studentData.totalFee);
    const id = `STU-2026-0${this.students.length + 1}`;
    
    // Generate installments split
    const installments = [];
    const splitCount = parseInt(studentData.splitCount);
    const splitAmount = Math.round(totalFee / splitCount);
    
    for (let i = 0; i < splitCount; i++) {
      const dueDate = getRelativeDateString(i * 30 + 10); // Spaced monthly
      const description = splitCount === 1 
        ? "Single Complete Tuition payment" 
        : `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Installment Split`;
      
      installments.push({
        description,
        amount: splitAmount,
        paidAmount: 0,
        dueDate,
        status: "Pending"
      });
    }

    const newStudent = {
      id,
      name: studentData.name,
      class: studentData.class,
      parentName: studentData.parentName,
      parentPhone: studentData.parentPhone,
      parentEmail: studentData.parentEmail,
      admissionDate: studentData.admissionDate,
      admissionFee: studentData.admissionFee || 0,
      termFee: studentData.termFee || 0,
      daycareFee: studentData.daycareFee || 0,
      totalFee,
      installments,
      payments: [],
      communicationHistory: []
    };

    this.students.push(newStudent);
    this.saveStudents();
    return newStudent;
  }

  // Log single payment against installment index
  logPayment(studentId, installmentIdx, paymentDetails) {
    const student = this.getStudent(studentId);
    if (!student) return false;

    const installment = student.installments[installmentIdx];
    if (!installment) return false;

    const amountPaid = parseFloat(paymentDetails.amount);
    installment.paidAmount += amountPaid;

    // Check status
    if (installment.paidAmount >= installment.amount) {
      installment.status = "Paid";
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (installment.dueDate < today) {
        installment.status = "Overdue";
      } else {
        installment.status = "Pending";
      }
    }

    // Generate unique Receipt ID
    const receiptId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      receiptId,
      installmentIdx,
      amount: amountPaid,
      date: paymentDetails.date,
      method: paymentDetails.method,
      refNumber: paymentDetails.refNumber,
      notes: paymentDetails.notes
    };

    student.payments.push(newPayment);
    this.saveStudents();
    return newPayment;
  }

  // Delete student record
  deleteStudent(id) {
    this.students = this.students.filter(s => s.id !== id);
    this.saveStudents();
  }

  // Delete dynamic transaction payment log by index
  deletePayment(studentId, paymentIdx) {
    const student = this.getStudent(studentId);
    if (!student) return false;

    const payment = student.payments[paymentIdx];
    if (!payment) return false;

    // Retrieve corresponding installment schedule split
    const installment = student.installments[payment.installmentIdx];
    if (installment) {
      // Deduct payment sum
      installment.paidAmount = Math.max(0, installment.paidAmount - payment.amount);
      
      // Update installment status
      const today = new Date().toISOString().split('T')[0];
      if (installment.paidAmount >= installment.amount) {
        installment.status = "Paid";
      } else if (installment.paidAmount > 0) {
        installment.status = "Pending";
      } else if (installment.dueDate < today) {
        installment.status = "Overdue";
      } else {
        installment.status = "Pending";
      }
    }

    // Remove item from payment log array
    student.payments.splice(paymentIdx, 1);
    this.saveStudents();
    return true;
  }

  // Clear all payments dynamically across all students
  clearAllPayments() {
    const today = new Date().toISOString().split('T')[0];
    this.students.forEach(student => {
      student.payments = [];
      student.installments.forEach(inst => {
        inst.paidAmount = 0;
        inst.status = inst.dueDate < today ? "Overdue" : "Pending";
      });
    });
    this.saveStudents();
  }
}

// Instantiate state
const AppState = new FeeTrackerState();

// Render Class Manager list inside Settings View
const renderClassManager = () => {
  const container = document.getElementById('settings-classes-list');
  if (!container) return;

  if (AppState.classes.length === 0) {
    container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-light); text-align:center; padding:10px 0;">No active classes listed</div>`;
    return;
  }

  container.innerHTML = AppState.classes.map(cName => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-app); border:1px solid var(--border-color); padding:6px 12px; border-radius:var(--radius-sm); font-size:0.85rem; margin-bottom:4px;">
      <span style="font-weight:600;">${cName}</span>
      <button class="btn btn-danger btn-sm" style="padding:4px 8px; display:flex; align-items:center; justify-content:center;" onclick="triggerDeleteClass('${cName}')" title="Delete class from register">
        <!-- Close icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
};

const triggerDeleteClass = (cName) => {
  if (confirm(`⚠️ WARNING: Are you sure you want to delete the class "${cName}"? This will remove it from the drop-downs immediately!`)) {
    AppState.deleteClass(cName);
    showToast(`Class "${cName}" was deleted successfully`, 'info');
  }
};

// --- RENDERING MODULES ---

// Toast controller
const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-wrapper');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon} ${message}`;
  container.appendChild(toast);

  // Remove toast after duration
  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// 1. Dashboard Metrics and Charts Render
const renderDashboard = () => {
  const sum = AppState.getFinancialSummary();

  // Populate numeric dashboard stats
  document.getElementById('stat-total-fees').textContent = formatCurrency(sum.totalExpected);
  document.getElementById('stat-collected').textContent = formatCurrency(sum.totalCollected);
  document.getElementById('stat-pending').textContent = formatCurrency(sum.outstanding);
  document.getElementById('stat-overdue').textContent = formatCurrency(sum.totalOverdue);

  // Stats trends
  document.getElementById('stat-collection-rate').innerHTML = `<span class="trend-up">${sum.collectionRate}% rate</span> of collections`;
  document.getElementById('stat-pending-percentage').innerHTML = `<span class="trend-down">${sum.outstandingRate}% remaining</span> outstanding`;
  document.getElementById('stat-overdue-count').innerHTML = `<span class="trend-down">${sum.overdueCount} installment(s)</span> past due`;

  // Render Overdue Alerts Panel
  renderUrgentAlertsList();

  // Render Visual Charts
  renderDonutChart(sum);
  renderBarChart();
};

const renderUrgentAlertsList = () => {
  const container = document.getElementById('dashboard-alerts-list');
  const overdueList = AppState.getOverdueStudentsList();
  
  document.getElementById('urgent-followups-badge').textContent = overdueList.length;

  if (overdueList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px; font-size: 0.8rem;">
        <p>🎉 All active installments are completely up-to-date!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = overdueList.map(item => `
    <div class="alert-item urgent">
      <div class="alert-icon-box" style="background-color: var(--danger-light); color: var(--danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        </svg>
      </div>
      <div class="alert-content">
        <div class="alert-title">${item.name} (${item.class})</div>
        <div class="alert-desc">${formatCurrency(item.overdueAmount)} Overdue by ${item.daysOverdue} days</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="triggerDirectFollowup('${item.studentId}')">
        Follow Up
      </button>
    </div>
  `).join('');
};

// Custom SVG Donut Chart Renders
const renderDonutChart = (summary) => {
  const svg = document.getElementById('donut-chart-svg');
  const legend = document.getElementById('donut-chart-legend');

  // Compute breakdown ratios of Admission vs Term vs Daycare
  let totalAdmission = 0;
  let totalTerm = 0;
  let totalDaycare = 0;

  AppState.students.forEach(s => {
    totalAdmission += s.admissionFee;
    totalTerm += s.termFee;
    totalDaycare += s.daycareFee;
  });

  const grandTotal = totalAdmission + totalTerm + totalDaycare;
  
  if (grandTotal === 0) {
    svg.innerHTML = '<text x="50" y="50" text-anchor="middle" dominant-baseline="middle">No data</text>';
    return;
  }

  const pAdmission = (totalAdmission / grandTotal) * 100;
  const pTerm = (totalTerm / grandTotal) * 100;
  const pDaycare = (totalDaycare / grandTotal) * 100;

  // Render SVG segments with dasharrays
  // Circumference of radius 35 = 2 * PI * 35 = 219.91
  const c = 219.91;
  const strokeWidth = 14;
  const r = 35;
  const cx = 50;
  const cy = 50;

  let currentOffset = 0;

  const segments = [
    { name: "Term Tuition Fee", value: totalTerm, percent: pTerm, color: "hsl(243, 75%, 59%)" },
    { name: "Admission Fee", value: totalAdmission, percent: pAdmission, color: "hsl(175, 84%, 32%)" },
    { name: "Daycare Fee", value: totalDaycare, percent: pDaycare, color: "hsl(38, 92%, 50%)" }
  ];

  svg.innerHTML = `
    <!-- Background Circle -->
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="transparent" stroke="var(--border-light)" stroke-width="${strokeWidth}" />
    
    <!-- Segment loops -->
    ${segments.map(seg => {
      if (seg.value === 0) return '';
      const dash = (seg.percent / 100) * c;
      const offset = currentOffset;
      currentOffset -= dash;
      return `
        <circle class="donut-segment" cx="${cx}" cy="${cy}" r="${r}" 
                fill="transparent" 
                stroke="${seg.color}" 
                stroke-width="${strokeWidth}" 
                stroke-dasharray="${dash} ${c - dash}" 
                stroke-dashoffset="${offset}" />
      `;
    }).join('')}
    
    <!-- Center Stats -->
    <text x="50" y="47" text-anchor="middle" font-size="6" font-weight="700" fill="var(--text-muted)">EXPECTED FEES</text>
    <text x="50" y="56" text-anchor="middle" font-size="10" font-weight="800" fill="var(--text-main)">${formatCurrency(summary.totalExpected)}</text>
  `;

  // Draw Legend items
  legend.innerHTML = segments.map(seg => `
    <div class="legend-item">
      <div class="legend-color" style="background-color: ${seg.color};"></div>
      <span>${seg.name}: <strong>${formatCurrency(seg.value)}</strong> (${seg.percent.toFixed(1)}%)</span>
    </div>
  `).join('');
};

// Custom SVG Bar Chart Render - Cumulative Revenue collected monthly
const renderBarChart = () => {
  const svg = document.getElementById('bar-chart-svg');
  
  // Dynamic collection bucket over past months
  // Standard billing months: Feb, Mar, Apr, May
  const months = ['February', 'March', 'April', 'May'];
  const monthBuckets = { 1: 0, 2: 0, 3: 0, 4: 0 }; // JavaScript months (Feb=1, Mar=2...)
  
  AppState.students.forEach(student => {
    student.payments.forEach(p => {
      const pDate = new Date(p.date);
      const mIdx = pDate.getMonth();
      if (monthBuckets[mIdx] !== undefined) {
        monthBuckets[mIdx] += p.amount;
      }
    });
  });

  const values = [monthBuckets[1], monthBuckets[2], monthBuckets[3], monthBuckets[4]];
  const maxVal = Math.max(...values, 1000);
  const graphMax = Math.ceil(maxVal / 1000) * 1000;

  // Layout boundaries inside SVG (width="600" height="240")
  const paddingX = 60;
  const paddingY = 30;
  const chartWidth = 500;
  const chartHeight = 170;

  // Draw coordinate axis lines & labels
  let svgContent = `
    <!-- Grid helper lines -->
    <line x1="${paddingX}" y1="${paddingY}" x2="${paddingX + chartWidth}" y2="${paddingY}" stroke="var(--border-light)" stroke-width="1" />
    <line x1="${paddingX}" y1="${paddingY + chartHeight / 2}" x2="${paddingX + chartWidth}" y2="${paddingY + chartHeight / 2}" stroke="var(--border-light)" stroke-width="1" />
    <line x1="${paddingX}" y1="${paddingY + chartHeight}" x2="${paddingX + chartWidth}" y2="${paddingY + chartHeight}" stroke="var(--border-color)" stroke-width="1.5" />
    
    <!-- Y-Axis Labels -->
    <text x="${paddingX - 10}" y="${paddingY + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">${formatCurrency(graphMax)}</text>
    <text x="${paddingX - 10}" y="${paddingY + chartHeight / 2 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">${formatCurrency(graphMax / 2)}</text>
    <text x="${paddingX - 10}" y="${paddingY + chartHeight + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">₹0</text>
  `;

  // Draw Bars
  const barSpacing = chartWidth / months.length;
  const barWidth = 40;

  months.forEach((mName, idx) => {
    const val = values[idx];
    const pct = val / graphMax;
    const barHeight = chartHeight * pct;
    const barX = paddingX + idx * barSpacing + (barSpacing - barWidth) / 2;
    const barY = paddingY + chartHeight - barHeight;

    svgContent += `
      <!-- Solid rounded bars -->
      <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" 
            fill="url(#barGradient)" rx="4" ry="4" 
            style="transition: all 0.3s ease; cursor: pointer;">
        <title>${mName}: ${formatCurrency(val)}</title>
      </rect>
      
      <!-- Amount tag directly above bar -->
      <text x="${barX + barWidth / 2}" y="${barY - 8}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text-main)">
        ${val > 0 ? formatCurrency(val) : ''}
      </text>

      <!-- Month X-Axis Label -->
      <text x="${barX + barWidth / 2}" y="${paddingY + chartHeight + 20}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">
        ${mName}
      </text>
    `;
  });

  // Inject gradient definition
  svg.innerHTML = `
    <defs>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--primary)" />
        <stop offset="100%" stop-color="var(--secondary)" />
      </linearGradient>
    </defs>
    ${svgContent}
  `;
};

// 2. Student Registry Directory Render
const renderStudentsTable = (searchQuery = "", classFilter = "all", statusFilter = "all") => {
  const tbody = document.getElementById('students-table-body');
  
  const query = searchQuery.toLowerCase().trim();

  // Filter students array
  const filtered = AppState.students.filter(student => {
    // Search match
    const nameMatch = student.name.toLowerCase().includes(query) || student.parentName.toLowerCase().includes(query);
    
    // Class filter match
    const classMatch = classFilter === 'all' || student.class === classFilter;

    // Status filter match
    const summary = getStudentSummaryStatus(student);
    const statusMatch = statusFilter === 'all' || summary.toLowerCase() === statusFilter.toLowerCase();

    return nameMatch && classMatch && statusMatch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <h3>No registry records matched</h3>
            <p>Try resetting filters or adjusting search queries to locate files.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(student => {
    const stats = getStudentFinancials(student);
    const sumStatus = getStudentSummaryStatus(student);
    
    let badgeClass = "badge-pending";
    if (sumStatus === "Paid") badgeClass = "badge-paid";
    if (sumStatus === "Partially Paid") badgeClass = "badge-partial";
    if (sumStatus === "Overdue") badgeClass = "badge-overdue";

    return `
      <tr>
        <td>
          <div class="table-student-cell">
            <div class="student-avatar">${student.name.split(' ').map(n=>n[0]).join('')}</div>
            <div class="student-meta">
              <div class="student-name-text">${student.name}</div>
              <div class="parent-name-text">Parent: ${student.parentName}</div>
            </div>
          </div>
        </td>
        <td><span style="font-weight: 500;">${student.class}</span></td>
        <td><span class="table-fee-summary">${formatCurrency(student.totalFee)}</span></td>
        <td><span class="table-fee-summary" style="color: var(--secondary);">${formatCurrency(stats.collected)}</span></td>
        <td><span class="table-fee-summary" style="color: ${stats.pending > 0 ? 'var(--text-muted)' : 'var(--secondary)'};">${formatCurrency(stats.pending)}</span></td>
        <td><span class="badge ${badgeClass}">${sumStatus}</span></td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-secondary btn-sm" onclick="openStudentDrawer('${student.id}')" title="Detailed Profile Drawer">
              View Profile
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudentRecord('${student.id}')" title="Delete record from registry">
              <!-- Trash Icon -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

// Calculate metrics for single student
const getStudentFinancials = (student) => {
  let collected = 0;
  student.payments.forEach(p => collected += p.amount);
  const pending = student.totalFee - collected;
  return { collected, pending };
};

// Determine total status for single student
const getStudentSummaryStatus = (student) => {
  const stats = getStudentFinancials(student);
  
  if (stats.pending <= 0) return "Paid";

  // Check if any installment is overdue
  const today = new Date().toISOString().split('T')[0];
  let hasOverdue = false;
  
  student.installments.forEach(inst => {
    if (inst.paidAmount < inst.amount && inst.dueDate < today) {
      hasOverdue = true;
    }
  });

  if (hasOverdue) return "Overdue";
  if (stats.collected > 0) return "Partially Paid";
  return "Pending";
};

// 3. Student Sliding Drawer Profile Panel Render
const openStudentDrawer = (id) => {
  const student = AppState.getStudent(id);
  if (!student) return;

  AppState.selectedStudentId = id;

  // Header Details
  document.getElementById('drawer-avatar-tag').textContent = student.name.split(' ').map(n=>n[0]).join('');
  document.getElementById('drawer-student-name').textContent = student.name;
  document.getElementById('drawer-student-class-label').textContent = `${student.class} - Reg ID: ${student.id}`;
  
  // Card metrics
  const stats = getStudentFinancials(student);
  document.getElementById('drawer-stat-total').textContent = formatCurrency(student.totalFee);
  document.getElementById('drawer-stat-paid').textContent = formatCurrency(stats.collected);
  document.getElementById('drawer-stat-pending').textContent = formatCurrency(stats.pending);

  // Quick Info Rows
  document.getElementById('drawer-info-parent').textContent = student.parentName;
  document.getElementById('drawer-info-phone').textContent = student.parentPhone;
  document.getElementById('drawer-info-email').textContent = student.parentEmail;
  document.getElementById('drawer-info-date').textContent = formatDate(student.admissionDate);

  // Fee splits tab values
  document.getElementById('breakdown-admission').textContent = formatCurrency(student.admissionFee);
  document.getElementById('breakdown-term').textContent = formatCurrency(student.termFee);
  document.getElementById('breakdown-daycare').textContent = formatCurrency(student.daycareFee);
  document.getElementById('breakdown-total').textContent = formatCurrency(student.totalFee);

  // Active drawer UI state
  document.getElementById('drawer-overlay-element').classList.add('active');
  document.getElementById('student-profile-drawer').classList.add('active');

  // Render internal sub-tabs
  renderDrawerInstallments(student);
  renderDrawerReceipts(student);

  // Reset tabs to installments defaults
  switchDrawerTab('tab-btn-installments', 'pane-installments');
};

const closeStudentDrawer = () => {
  document.getElementById('drawer-overlay-element').classList.remove('active');
  document.getElementById('student-profile-drawer').classList.remove('active');
  AppState.selectedStudentId = null;
};

// Render Installments timeline tab
const renderDrawerInstallments = (student) => {
  const container = document.getElementById('drawer-installments-list');
  const today = new Date().toISOString().split('T')[0];

  if (student.installments.length === 0) {
    container.innerHTML = `<div class="empty-state">No payment schedules exist</div>`;
    return;
  }

  container.innerHTML = student.installments.map((inst, index) => {
    let badgeClass = "badge-pending";
    let statusText = "Pending";
    
    if (inst.paidAmount >= inst.amount) {
      badgeClass = "badge-paid";
      statusText = "Paid";
    } else if (inst.paidAmount > 0) {
      badgeClass = "badge-partial";
      statusText = "Partial Paid";
    } else if (inst.dueDate < today) {
      badgeClass = "badge-overdue";
      statusText = "Overdue";
    }

    const unpaid = inst.amount - inst.paidAmount;
    
    // Log payment button if there is outstanding amount
    const payButton = unpaid > 0 
      ? `<button class="btn btn-primary btn-sm" onclick="triggerLogPaymentModal('${student.id}', ${index})">Log Payment</button>`
      : '';

    return `
      <div class="timeline-item">
        <div class="timeline-left">
          <div class="timeline-title">${inst.description}</div>
          <div class="timeline-subtitle">Due by: <strong>${formatDate(inst.dueDate)}</strong></div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top:2px;">
            Collected: ${formatCurrency(inst.paidAmount)} | Remaining: <strong style="color: ${unpaid > 0 ? 'var(--danger)' : 'var(--secondary)'};">${formatCurrency(unpaid)}</strong>
          </div>
        </div>
        <div class="timeline-right">
          <span class="badge ${badgeClass}" style="margin-right: 4px;">${statusText}</span>
          ${payButton}
        </div>
      </div>
    `;
  }).join('');
};

// Render Receipts Tab list
const renderDrawerReceipts = (student) => {
  const container = document.getElementById('drawer-receipts-list');
  
  if (student.payments.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 30px 10px;">
        <p>No transaction receipts logged yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = student.payments.map((p, idx) => `
    <div class="timeline-item">
      <div class="timeline-left">
        <div class="timeline-title" style="font-weight: 700;">Receipt ID: ${p.receiptId}</div>
        <div class="timeline-subtitle">${formatDate(p.date)} via <strong>${p.method}</strong></div>
        <div class="timeline-subtitle" style="font-size:0.7rem;">Ref No: ${p.refNumber}</div>
      </div>
      <div class="timeline-right" style="display:flex; gap:6px;">
        <span class="timeline-amount" style="color: var(--secondary); margin-right: 4px; display:flex; align-items:center;">${formatCurrency(p.amount)}</span>
        <button class="btn btn-secondary btn-sm" onclick="viewLoggedReceipt('${student.id}', ${idx})" title="Print / View Receipt">
          Print
        </button>
        <button class="btn btn-danger btn-sm" style="padding:6px; display:flex; align-items:center; justify-content:center;" onclick="triggerDeletePayment('${student.id}', ${idx})" title="Delete Payment Log">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
};

const triggerDeletePayment = (studentId, idx) => {
  const student = AppState.getStudent(studentId);
  if (!student) return;
  const p = student.payments[idx];
  if (!p) return;

  if (confirm(`⚠️ WARNING: Are you absolutely sure you want to delete payment receipt ID ${p.receiptId} of ${formatCurrency(p.amount)}? This will subtract the payment from the student's installments schedule and is irreversible!`)) {
    const success = AppState.deletePayment(studentId, idx);
    if (success) {
      showToast(`Transaction receipt ${p.receiptId} has been successfully deleted.`, 'info');
      
      // Dynamic DOM refreshes
      const stats = getStudentFinancials(student);
      document.getElementById('drawer-stat-paid').textContent = formatCurrency(stats.collected);
      document.getElementById('drawer-stat-pending').textContent = formatCurrency(stats.pending);
      
      renderDrawerInstallments(student);
      renderDrawerReceipts(student);
      
      if (AppState.activeView === 'view-dashboard') renderDashboard();
      if (AppState.activeView === 'view-students') renderStudentsTable();
    } else {
      showToast(`Failed to clear payment logs.`, 'error');
    }
  }
};

// Tab Switching logic inside drawer
const switchDrawerTab = (btnId, paneId) => {
  document.querySelectorAll('.drawer-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  document.getElementById(btnId).classList.add('active');
  document.getElementById(paneId).classList.add('active');
};

// Delete record with dynamic confirmations
const deleteStudentRecord = (id) => {
  const student = AppState.getStudent(id);
  if (!student) return;

  if (confirm(`⚠️ WARNING: Are you completely sure you want to delete ${student.name}? This will permanently wipe all payment histories and generated receipts!`)) {
    AppState.deleteStudent(id);
    showToast(`${student.name} was successfully removed from the active student registry`, 'info');
    
    // Refresh active panel
    if (AppState.activeView === 'view-dashboard') renderDashboard();
    if (AppState.activeView === 'view-students') renderStudentsTable();
  }
};


// 4. Log Payment Modal Workspace
const triggerLogPaymentModal = (studentId, installmentIndex) => {
  const student = AppState.getStudent(studentId);
  if (!student) return;

  const installment = student.installments[installmentIndex];
  if (!installment) return;

  // Populate static read-only modal fields
  document.getElementById('payment-student-id').value = studentId;
  document.getElementById('payment-installment-index').value = installmentIndex;
  document.getElementById('payment-display-student').value = student.name;
  document.getElementById('payment-display-installment').value = installment.description;
  document.getElementById('payment-display-scheduled').value = formatCurrency(installment.amount);
  
  const dueAmt = installment.amount - installment.paidAmount;
  document.getElementById('payment-display-due').value = formatCurrency(dueAmt);
  
  // Set default values inside log form inputs
  document.getElementById('form-payment-amount').value = dueAmt;
  document.getElementById('form-payment-amount').max = dueAmt;
  document.getElementById('form-payment-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('form-payment-reference').value = "";
  document.getElementById('form-payment-notes').value = "";

  // Show generic overlay backdrop & active log module
  closeStudentDrawer();
  document.getElementById('modal-backdrop-container').classList.add('active');
  document.getElementById('modal-payment-form').style.display = 'block';
};

const closePaymentModal = () => {
  document.getElementById('modal-backdrop-container').classList.remove('active');
  document.getElementById('modal-payment-form').style.display = 'none';
};


// 5. Printable Invoice Receipt Viewer
const viewLoggedReceipt = (studentId, paymentIndex) => {
  const student = AppState.getStudent(studentId);
  if (!student) return;

  const payment = student.payments[paymentIndex];
  if (!payment) return;

  const installment = student.installments[payment.installmentIdx];
  const stats = getStudentFinancials(student);

  // Populate dynamic receipts metadata
  document.getElementById('receipt-num').textContent = payment.receiptId;
  document.getElementById('receipt-date').textContent = formatDate(payment.date);
  
  document.getElementById('receipt-student-name').textContent = student.name;
  document.getElementById('receipt-student-class').textContent = student.class;
  document.getElementById('receipt-parent-name').textContent = student.parentName;

  // Financial summary
  document.getElementById('receipt-total-sch').textContent = formatCurrency(student.totalFee);
  document.getElementById('receipt-total-coll').textContent = formatCurrency(stats.collected);
  document.getElementById('receipt-total-bal').textContent = formatCurrency(stats.pending);

  // Table transaction details
  document.getElementById('receipt-item-desc').textContent = `${installment ? installment.description : 'Installment fee split payment'}`;
  document.getElementById('receipt-item-sub').textContent = `Mode: ${payment.method} | Trans Ref No: ${payment.refNumber}`;
  document.getElementById('receipt-item-amt').textContent = formatCurrency(payment.amount);
  
  document.getElementById('receipt-subtotal').textContent = formatCurrency(payment.amount);
  document.getElementById('receipt-grandtotal').textContent = formatCurrency(payment.amount);

  // Internal Notes check
  const noteBox = document.querySelector('.receipt-notes p');
  if (payment.notes) {
    noteBox.innerHTML = `<strong>Note:</strong> ${payment.notes}`;
  } else {
    noteBox.innerHTML = `Thank you for your payment!`;
  }

  // Active overlay view receipt
  closeStudentDrawer();
  document.getElementById('modal-backdrop-container').classList.add('active');
  document.getElementById('modal-receipt-view').style.display = 'block';
};

const closeReceiptModal = () => {
  document.getElementById('modal-backdrop-container').classList.remove('active');
  document.getElementById('modal-receipt-view').style.display = 'none';
};


// 6. Follow-Up Reminder Center Workspace
const renderFollowUpCenter = () => {
  const listContainer = document.getElementById('reminder-students-list');
  const unpaidStudents = AppState.students.filter(student => getStudentFinancials(student).pending > 0);
  const query = document.getElementById('reminder-search').value.toLowerCase().trim();

  const filtered = unpaidStudents.filter(s => s.name.toLowerCase().includes(query) || s.parentName.toLowerCase().includes(query));

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="padding:20px; font-size:0.8rem;">
        <p>No unpaid schedules found.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(student => {
    const stats = getStudentFinancials(student);
    const totalDue = stats.pending;
    
    // Check if overdue
    const sumStatus = getStudentSummaryStatus(student);
    const isOverdue = sumStatus === "Overdue";

    return `
      <div class="alert-item" style="cursor:pointer; border-left-color: ${isOverdue ? 'var(--danger)' : 'var(--primary)'}; background-color: var(--bg-card); border: 1px solid var(--border-color); border-left-width: 4px;" onclick="selectStudentForReminder('${student.id}')">
        <div class="alert-content">
          <div class="alert-title">${student.name}</div>
          <div class="alert-desc">${student.class} | Pending: <strong>${formatCurrency(totalDue)}</strong></div>
          <div style="font-size:0.7rem; color:var(--text-light); margin-top:2px;">Parent: ${student.parentName}</div>
        </div>
        <span class="badge ${isOverdue ? 'badge-overdue' : 'badge-pending'}">${sumStatus}</span>
      </div>
    `;
  }).join('');
};

// Select student to preview follow-up messages
const selectStudentForReminder = (id) => {
  const student = AppState.getStudent(id);
  if (!student) return;

  AppState.selectedStudentId = id;

  // Toggle Workspace visibility
  document.getElementById('reminder-workspace-empty').style.display = 'none';
  document.getElementById('reminder-workspace-content').style.display = 'block';

  // Apply default selection classes
  document.querySelectorAll('#reminder-students-list .alert-item').forEach(el => {
    el.style.borderColor = 'var(--border-color)';
    el.style.boxShadow = 'none';
  });

  updateReminderText();
};

const updateReminderText = () => {
  const student = AppState.getStudent(AppState.selectedStudentId);
  if (!student) return;

  const templateType = document.getElementById('reminder-template-select').value;
  const stats = getStudentFinancials(student);
  
  // Find next unpaid installment
  const nextUnpaid = student.installments.find(inst => inst.amount > inst.paidAmount);
  const dueAmt = nextUnpaid ? (nextUnpaid.amount - nextUnpaid.paidAmount) : stats.pending;
  const dueDateStr = nextUnpaid ? formatDate(nextUnpaid.dueDate) : 'Immediate';

  let message = "";

  if (templateType === 'pre-due') {
    message = `Dear Parent (${student.parentName}),\n\nThis is a friendly reminder that the upcoming fee installment of ${formatCurrency(dueAmt)} for your child, ${student.name} (${student.class}), is due on ${dueDateStr}.\n\nYou can complete the transaction online at our portal (portal.littleanchors.edu) or visit the front desk.\n\nThank you for your prompt cooperation!\n\nBest Regards,\nLittle Anchors Preschool Admin.`;
  } else if (templateType === 'due-today') {
    message = `Dear Parent (${student.parentName}),\n\nThis is to notify you that the scheduled installment fee of ${formatCurrency(dueAmt)} for ${student.name} is due TODAY (${dueDateStr}).\n\nPlease process this payment by wire or UPI at your earliest convenience to maintain an active schedule. Ignore this if already processed.\n\nBest Regards,\nLittle Anchors Preschool Admin.`;
  } else if (templateType === 'overdue-urgent') {
    message = `⚠️ URGENT FEE DUE NOTICE\n\nDear Parent (${student.parentName}),\n\nOur accounts show that the installment fee of ${formatCurrency(dueAmt)} for ${student.name} is now OVERDUE (Original due date: ${dueDateStr}).\n\nWe kindly request you to clear the pending amount of ${formatCurrency(stats.pending)} immediately to avoid administrative follow-ups.\n\nUPI ID: clearfee@upi | Port: portal.littleanchors.edu\n\nThank you,\nAdministration Portal.`;
  }

  document.getElementById('reminder-message-preview').textContent = message;
};

// Navigation controller
const switchView = (targetId) => {
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeSection = document.getElementById(targetId);
  if (activeSection) activeSection.classList.add('active');

  const menuItem = document.querySelector(`.sidebar-menu .menu-item[data-target="${targetId}"]`);
  if (menuItem) menuItem.classList.add('active');

  AppState.activeView = targetId;

  // Context rendering
  if (targetId === 'view-dashboard') renderDashboard();
  if (targetId === 'view-students') renderStudentsTable();
  if (targetId === 'view-reminders') {
    renderFollowUpCenter();
    document.getElementById('reminder-workspace-empty').style.display = 'block';
    document.getElementById('reminder-workspace-content').style.display = 'none';
  }
  if (targetId === 'view-settings') {
    AppState.applyAdminSettings();
  }
};

// Global Entry trigger for Follow-up center shortcuts
const triggerDirectFollowup = (studentId) => {
  switchView('view-reminders');
  setTimeout(() => {
    selectStudentForReminder(studentId);
  }, 100);
};


// --- INITIALIZE EVENT LISTENERS & HOOKS ---
document.addEventListener('DOMContentLoaded', () => {

  // Apply current global brand and billing presets
  AppState.applyAdminSettings();
  
  // Populate all classes selectors on startup
  AppState.applyClassesToUI();

  // Initialize view displays
  switchView('view-dashboard');

  // Theme Lock Mode System (Permanently Dark Mode)
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    AppState.theme = 'dark';
  };

  // Set default initial theme on load
  applyTheme('dark');

  // Global Navigation clicks
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      switchView(target);
    });
  });

  // Global search redirect to directory
  document.getElementById('global-search').addEventListener('input', (e) => {
    const query = e.target.value;
    switchView('view-students');
    document.getElementById('registry-search').value = query;
    renderStudentsTable(query);
  });

  // Directory actions: filter change inputs
  document.getElementById('registry-search').addEventListener('input', (e) => {
    const query = e.target.value;
    const classVal = document.getElementById('filter-class').value;
    const statusVal = document.getElementById('filter-status').value;
    renderStudentsTable(query, classVal, statusVal);
  });

  document.getElementById('filter-class').addEventListener('change', () => {
    const query = document.getElementById('registry-search').value;
    const classVal = document.getElementById('filter-class').value;
    const statusVal = document.getElementById('filter-status').value;
    renderStudentsTable(query, classVal, statusVal);
  });

  document.getElementById('filter-status').addEventListener('change', () => {
    const query = document.getElementById('registry-search').value;
    const classVal = document.getElementById('filter-class').value;
    const statusVal = document.getElementById('filter-status').value;
    renderStudentsTable(query, classVal, statusVal);
  });

  // Student drawer subtabs switcher
  document.getElementById('tab-btn-installments').addEventListener('click', () => {
    switchDrawerTab('tab-btn-installments', 'pane-installments');
  });
  document.getElementById('tab-btn-receipts').addEventListener('click', () => {
    switchDrawerTab('tab-btn-receipts', 'pane-receipts');
  });
  document.getElementById('tab-btn-breakdown').addEventListener('click', () => {
    switchDrawerTab('tab-btn-breakdown', 'pane-breakdown');
  });

  // Student drawer overlay close hook
  document.getElementById('btn-close-drawer').addEventListener('click', closeStudentDrawer);
  document.getElementById('drawer-overlay-element').addEventListener('click', closeStudentDrawer);

  // --- MODAL: ADD STUDENT TRIGGER & FORM SUBMIT ---
  const studentModal = document.getElementById('modal-student-form');
  const addStudentBtn = document.getElementById('btn-add-student-modal');
  const closeStudentModalBtn = document.getElementById('btn-close-student-modal');
  const cancelStudentModalBtn = document.getElementById('btn-cancel-student-modal');

  // Live dynamic installments preview inside Register Modal
  const updateModalInstallmentsPreview = () => {
    const previewList = document.getElementById('modal-installments-preview-list');
    if (!previewList) return;

    const isAdvanced = document.getElementById('form-toggle-advanced-breakdown').checked;
    let totalFee = 0;
    
    if (isAdvanced) {
      const admission = parseFloat(document.getElementById('form-admission-fee').value) || 0;
      const term = parseFloat(document.getElementById('form-term-fee').value) || 0;
      const daycare = parseFloat(document.getElementById('form-daycare-fee').value) || 0;
      totalFee = admission + term + daycare;
      document.getElementById('form-total-calculated').textContent = formatCurrency(totalFee);
    } else {
      totalFee = parseFloat(document.getElementById('form-total-fee-direct').value) || 0;
    }

    const splitCount = parseInt(document.getElementById('form-installments-count-direct').value) || 1;
    const splitAmount = Math.round(totalFee / splitCount);

    if (totalFee <= 0) {
      previewList.innerHTML = `<div style="color:var(--text-light); text-align:center; padding:10px 0;">Enter total fee to preview schedule</div>`;
      return;
    }

    let html = '';
    for (let i = 0; i < splitCount; i++) {
      const dueDate = getRelativeDateString(i * 30 + 10); // Spaced monthly
      html += `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-light); padding:4px 0;">
          <span>Installment #${i + 1}: <strong>${formatCurrency(splitAmount)}</strong></span>
          <span style="color:var(--text-muted);">Due: ${formatDate(dueDate)}</span>
        </div>
      `;
    }
    previewList.innerHTML = html;
  };

  // Toggle dynamic advanced checklist fields
  document.getElementById('form-toggle-advanced-breakdown').addEventListener('change', (e) => {
    const advancedBox = document.getElementById('advanced-breakdown-inputs');
    const coreInputs = document.getElementById('core-billing-inputs');
    if (e.target.checked) {
      advancedBox.style.display = 'grid';
      coreInputs.style.display = 'none';
      
      // Seed advanced with default splits
      const directTotal = parseFloat(document.getElementById('form-total-fee-direct').value) || 150000;
      document.getElementById('form-admission-fee').value = Math.round(directTotal * 0.2); // 20%
      document.getElementById('form-term-fee').value = Math.round(directTotal * 0.5); // 50%
      document.getElementById('form-daycare-fee').value = Math.round(directTotal * 0.3); // 30%
    } else {
      advancedBox.style.display = 'none';
      coreInputs.style.display = 'grid';
      
      // Seed core with summed advanced fee
      const admission = parseFloat(document.getElementById('form-admission-fee').value) || 0;
      const term = parseFloat(document.getElementById('form-term-fee').value) || 0;
      const daycare = parseFloat(document.getElementById('form-daycare-fee').value) || 0;
      document.getElementById('form-total-fee-direct').value = admission + term + daycare;
    }
    updateModalInstallmentsPreview();
  });
  
  const toggleStudentModal = (show) => {
    const backdrop = document.getElementById('modal-backdrop-container');
    if (show) {
      // Setup default form state
      document.getElementById('student-entry-form').reset();
      document.getElementById('form-admission-date').value = new Date().toISOString().split('T')[0];
      
      // Load current admin settings defaults
      const settings = AppState.adminSettings;
      document.getElementById('form-total-fee-direct').value = settings.defaultFee;
      document.getElementById('form-installments-count-direct').value = settings.defaultSplits;
      
      // Hide advanced by default, show core inputs
      document.getElementById('form-toggle-advanced-breakdown').checked = false;
      document.getElementById('advanced-breakdown-inputs').style.display = 'none';
      document.getElementById('core-billing-inputs').style.display = 'grid';

      updateModalInstallmentsPreview();
      
      backdrop.classList.add('active');
      studentModal.style.display = 'block';
    } else {
      backdrop.classList.remove('active');
      studentModal.style.display = 'none';
    }
  };

  addStudentBtn.addEventListener('click', () => toggleStudentModal(true));
  closeStudentModalBtn.addEventListener('click', () => toggleStudentModal(false));
  cancelStudentModalBtn.addEventListener('click', () => toggleStudentModal(false));

  // Dynamic input triggers to rebuild schedule preview
  document.getElementById('form-total-fee-direct').addEventListener('input', updateModalInstallmentsPreview);
  document.getElementById('form-installments-count-direct').addEventListener('change', updateModalInstallmentsPreview);
  document.querySelectorAll('.advanced-fee-input').forEach(input => {
    input.addEventListener('input', updateModalInstallmentsPreview);
  });

  // Handle student entry submit
  document.getElementById('student-entry-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const isAdvanced = document.getElementById('form-toggle-advanced-breakdown').checked;
    let totalFee = 0;
    let admissionFee = 0;
    let termFee = 0;
    let daycareFee = 0;

    if (isAdvanced) {
      admissionFee = parseFloat(document.getElementById('form-admission-fee').value) || 0;
      termFee = parseFloat(document.getElementById('form-term-fee').value) || 0;
      daycareFee = parseFloat(document.getElementById('form-daycare-fee').value) || 0;
      totalFee = admissionFee + termFee + daycareFee;
    } else {
      totalFee = parseFloat(document.getElementById('form-total-fee-direct').value) || 0;
      // Pre-fill itemized allocations with standard split
      admissionFee = Math.round(totalFee * 0.2);
      termFee = Math.round(totalFee * 0.5);
      daycareFee = Math.round(totalFee * 0.3);
    }
    
    const studentData = {
      name: document.getElementById('form-student-name').value,
      class: document.getElementById('form-class').value,
      parentName: document.getElementById('form-parent-name').value,
      parentPhone: document.getElementById('form-parent-phone').value,
      parentEmail: document.getElementById('form-parent-email').value,
      admissionDate: document.getElementById('form-admission-date').value,
      admissionFee,
      termFee,
      daycareFee,
      totalFee,
      splitCount: document.getElementById('form-installments-count-direct').value
    };

    const newStudent = AppState.addStudent(studentData);
    showToast(`Registered successfully: ${newStudent.name} is enrolled under ${newStudent.class}`, 'success');
    toggleStudentModal(false);

    // Refresh display
    if (AppState.activeView === 'view-dashboard') renderDashboard();
    if (AppState.activeView === 'view-students') renderStudentsTable();
  });

  // --- MODAL: PAYMENT LOG TRIGGERS ---
  document.getElementById('btn-close-payment-modal').addEventListener('click', closePaymentModal);
  document.getElementById('btn-cancel-payment-modal').addEventListener('click', closePaymentModal);

  document.getElementById('payment-entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const studentId = document.getElementById('payment-student-id').value;
    const installmentIdx = parseInt(document.getElementById('payment-installment-index').value);

    const paymentDetails = {
      amount: parseFloat(document.getElementById('form-payment-amount').value),
      date: document.getElementById('form-payment-date').value,
      method: document.getElementById('form-payment-method').value,
      refNumber: document.getElementById('form-payment-reference').value,
      notes: document.getElementById('form-payment-notes').value
    };

    const result = AppState.logPayment(studentId, installmentIdx, paymentDetails);
    
    if (result) {
      showToast(`Transaction successful! Logged receipt ID ${result.receiptId}`, 'success');
      closePaymentModal();
      
      // Auto open dynamic printable receipt details immediately!
      const student = AppState.getStudent(studentId);
      const payIdx = student.payments.findIndex(p => p.receiptId === result.receiptId);
      
      if (payIdx !== -1) {
        viewLoggedReceipt(studentId, payIdx);
      }

      // Refresh layout views
      if (AppState.activeView === 'view-dashboard') renderDashboard();
      if (AppState.activeView === 'view-students') renderStudentsTable();
    } else {
      showToast(`Transaction failed. Check active schedules`, 'error');
    }
  });

  // --- MODAL: RECEIPT VIEW TRIGGERS ---
  document.getElementById('btn-close-receipt-modal').addEventListener('click', closeReceiptModal);
  document.getElementById('btn-close-receipt-bottom').addEventListener('click', closeReceiptModal);

  // Trigger Print system window print isolation
  document.getElementById('btn-print-receipt-trigger').addEventListener('click', () => {
    window.print();
  });

  // --- REMINDERS TEMPLATE SWITCH HOOKS ---
  document.getElementById('reminder-template-select').addEventListener('change', updateReminderText);
  document.getElementById('reminder-search').addEventListener('input', renderFollowUpCenter);

  // --- ONE CLICK MESSAGING DISPATCH CHANNELS ---
  document.getElementById('btn-share-whatsapp').addEventListener('click', () => {
    const student = AppState.getStudent(AppState.selectedStudentId);
    if (!student) return;

    const message = document.getElementById('reminder-message-preview').textContent;
    // Format sanitized phone numbers for WhatsApp api standard
    const cleanPhone = student.parentPhone.replace(/[^0-9+]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Log communication entry in student history
    student.communicationHistory.push({
      type: "WhatsApp",
      templateType: document.getElementById('reminder-template-select').value,
      date: new Date().toISOString().split('T')[0],
      preview: message.substring(0, 50) + "..."
    });
    AppState.saveStudents();

    window.open(waUrl, '_blank');
    showToast(`Dispatched follow-up text channel formatting to WhatsApp Web`, 'success');
  });

  document.getElementById('btn-share-email').addEventListener('click', () => {
    const student = AppState.getStudent(AppState.selectedStudentId);
    if (!student) return;

    const message = document.getElementById('reminder-message-preview').textContent;
    const subject = `Fee Payment Notification - Little Anchors Preschool (${student.name})`;
    const mailtoUrl = `mailto:${student.parentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    // Log communication entry in student history
    student.communicationHistory.push({
      type: "Email",
      templateType: document.getElementById('reminder-template-select').value,
      date: new Date().toISOString().split('T')[0],
      preview: message.substring(0, 50) + "..."
    });
    AppState.saveStudents();

    window.location.href = mailtoUrl;
    showToast(`Initialized default local system mail composer client`, 'info');
  });

  document.getElementById('btn-share-copy').addEventListener('click', () => {
    const message = document.getElementById('reminder-message-preview').textContent;
    
    navigator.clipboard.writeText(message).then(() => {
      showToast(`Copy successful! Pre-drafted notification text saved to clipboard`, 'success');
      
      const student = AppState.getStudent(AppState.selectedStudentId);
      if (student) {
        student.communicationHistory.push({
          type: "Copy Clipboard",
          templateType: document.getElementById('reminder-template-select').value,
          date: new Date().toISOString().split('T')[0],
          preview: message.substring(0, 50) + "..."
        });
        AppState.saveStudents();
      }
    }).catch(err => {
      console.error("Failed to copy clipboard", err);
      showToast(`Clipboard access rejected by operating system`, 'error');
    });
  });

  // Mock Export CSV action
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student ID,Student Name,Class,Parent Name,Parent Phone,Parent Email,Admission Date,Total expected,Total Paid,Total Pending,Status\n";
    
    AppState.students.forEach(s => {
      const stats = getStudentFinancials(s);
      const status = getStudentSummaryStatus(s);
      const row = `"${s.id}","${s.name}","${s.class}","${s.parentName}","${s.parentPhone}","${s.parentEmail}","${s.admissionDate}",${s.totalFee},${stats.collected},${stats.pending},"${status}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fees_Installment_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Downloaded detailed student fees directory report as CSV", "success");
  });

  // Admin Configuration Form Submit Handler
  const adminSettingsForm = document.getElementById('admin-settings-form');
  if (adminSettingsForm) {
    adminSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newSettings = {
        schoolName: document.getElementById('set-school-name').value,
        schoolTagline: document.getElementById('set-school-tagline').value,
        schoolUpi: document.getElementById('set-school-upi').value,
        schoolPhone: document.getElementById('set-school-phone').value,
        schoolEmail: document.getElementById('set-school-email').value,
        defaultFee: parseFloat(document.getElementById('set-default-fee').value) || 150000,
        defaultSplits: parseInt(document.getElementById('set-default-splits').value) || 3
      };

      AppState.saveAdminSettings(newSettings);
      showToast("Institution branding and administrative defaults updated globally!", "success");
      
      // Auto-return to dashboard
      switchView('view-dashboard');
    });
  }

  // --- CLASS REGISTRY EVENT LISTENERS ---
  const addClassBtn = document.getElementById('btn-add-class-trigger');
  if (addClassBtn) {
    addClassBtn.addEventListener('click', () => {
      const input = document.getElementById('new-class-input');
      const className = input.value.trim();
      if (!className) {
        showToast("Please enter a valid class name.", "error");
        return;
      }
      const success = AppState.addClass(className);
      if (success) {
        showToast(`Class "${className}" has been added to active courses!`, "success");
        input.value = "";
      } else {
        showToast(`Class "${className}" already exists in courses registry.`, "error");
      }
    });
  }

  // --- DANGER ZONE EVENT LISTENERS ---
  const clearPaymentsBtn = document.getElementById('btn-clear-all-payments-trigger');
  if (clearPaymentsBtn) {
    clearPaymentsBtn.addEventListener('click', () => {
      if (confirm("⚠️ WARNING: Are you absolutely sure you want to clear ALL logged payments for ALL students? This will wipe out all transaction histories and receipts, resetting student accounts to unpaid. This action is permanent and irreversible!")) {
        AppState.clearAllPayments();
        showToast("All student transaction records and receipts have been successfully wiped.", "info");
        
        // Refresh layout views
        if (AppState.activeView === 'view-dashboard') renderDashboard();
        if (AppState.activeView === 'view-students') renderStudentsTable();
      }
    });
  }

  const resetFactoryBtn = document.getElementById('btn-reset-to-factory-trigger');
  if (resetFactoryBtn) {
    resetFactoryBtn.addEventListener('click', () => {
      if (confirm("⚠️ WIPE AND RESET SYSTEM: This will completely wipe out your custom branding, dynamic classes, student list, and payment records, restoring the portal to initial factory mock data. Are you sure you want to trigger this complete database reset?")) {
        localStorage.clear();
        showToast("System database cleared. Restoring factory defaults...", "info");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }

});
