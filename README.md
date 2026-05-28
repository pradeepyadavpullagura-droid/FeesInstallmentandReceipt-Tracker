# 🎓 Fees Installment & Receipt Tracker — Admin Portal

A high-end, premium administrative dashboard built with native technologies (**HTML, CSS, Vanilla JS**) to track daycare, preschool, and learning academy enrollments, split tuition fees, log payments, print professional receipts, and automate family follow-ups.

This portal is locked to a **Premium Glassmorphic Dark Theme** designed to coordinate sleek, harmonious color schemes with zero-compile speed and full offline availability.

---

## ✨ Features

### 📊 1. Comprehensive Financial Dashboard
* **Dynamic KPI Metrics**: Real-time stats on *Total Fees Expected*, *Total Collected*, *Pending Outstanding Balance*, and *Overdue Dues*.
* **Urgent Action Center**: Automatically tracks unpaid installments relative to today's date and alerts the admin of overdue amounts.
* **Interactive SVG Analytics**: 
  * **Donut Chart**: Live proportions of Admission Fees, Tuition Fees, and Daycare splits across the database.
  * **Monthly Trend Bar Chart**: Sums up monthly revenues dynamically (February, March, April, May).

### 👥 2. Student Registry & Smart Admission
* **Streamlined Admission**: Register students quickly by entering their **Total Course Fee** and **Total Installments** (e.g. 2, 3, 5 splits).
* **Live Installment Preview**: Renders a scheduled monthly preview directly inside the modal before saving.
* **Optional Itemized Breakdown**: Toggle a checkbox for itemized Admission, Tuition, and Daycare fee distributions.
* **Interactive Slider Profile Drawer**: Slide out a student profile to see standard contacts, timeline statuses, payment history, and itemized splits.

### 🧾 3. Payment Logging & Receipts
* **Quick Installment Payment Logs**: Record checkouts with custom payment methods (UPI/QR, Card, Wire Transfer, Cash), reference IDs, and internal notes.
* **Pixel-Perfect Invoice Receipts**: Generates computer-completed receipts featuring brand watermarks, official stamp designs, signature blocks, and payment parameters.
* **Print-Isolated Layouts**: Integrated print rules hide the sidebars, headers, dashboards, and action buttons during printing, outputting only a pristine transaction document.

### ✉️ 4. Follow-Up Workspace
* **Automated Text Templates**: Instantly constructs personalized pre-due, due-today, and urgent overdue notifications containing custom parent/student names, values, dates, and UPI details.
* **One-Click Dispatch Channels**: Native integration with WhatsApp Web, local mail clients (`mailto:` parameters), and one-click Clipboard copy utilities.

### ⚙️ 5. Global Admin Settings & Danger Zone
* **Brand Identity Controls**: Modify Institution Name, Tagline, Phone, Email, and UPI payment address globally across the system in real time.
* **Dynamic Class Registry**: Add or delete custom class categories dynamically, updating filter selectors instantly across student forms.
* **Transaction Deletion Log**: Delete individual transaction logs to dynamically reconcile backward fee deductions and installment timeline statuses.
* **System Danger Zone**: Instantly wipe transaction records to reset collections, or perform a complete factory wipe database reload.

---

## 🛠️ Technology Stack

* **Structure**: Semantic HTML5 markup.
* **Design & Styling**: CSS3 (Vanilla design tokens, Custom HSL Hues, Premium Glassmorphism, Print `@media` queries).
* **Logic**: Vanilla ES6+ Javascript State Engine.
* **Data Persistence**: Offline browser `localStorage` integration (`fee_tracker_students_inr`, `fee_tracker_classes_list`, `fee_tracker_admin_settings`).

---

## 📁 Repository Structure

```bash
├── index.html       # Single Page Application HTML frame
├── styles.css       # Premium custom CSS stylesheets and print configs
├── app.js           # Core state controller, charts generator, and calculators
├── package.json     # Configuration file for hot-reloading dev server
└── .gitignore       # Git exclusion rules
```

---

## 🚀 How to Run Locally

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/pradeepyadavpullagura-droid/FeesInstallmentandReceipt-Tracker.git
   ```
2. Navigate into the project folder:
   ```bash
   cd FeesInstallmentandReceipt-Tracker
   ```
3. Install development tools:
   ```bash
   npm install
   ```

### Running the App
1. Start the live-reload local development server:
   ```bash
   npm run dev
   ```
2. Open your web browser and navigate to **`http://localhost:3000`**.
