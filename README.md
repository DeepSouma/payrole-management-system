# PayrollPro Cloud - Payroll Management System

A full-stack, enterprise-ready Payroll Management and Direct Bank Disbursement System built with Next.js 14 (App Router), PostgreSQL, Prisma ORM, and Tailwind CSS.

---

## 🚀 Quick Start (Instant Run with Docker)

You can run the entire application (PostgreSQL + Next.js Web App) with a single command after cloning:

```bash
# 1. Clone repository
git clone https://github.com/DeepSouma/payrole-management-system.git
cd payrole-management-system

# 2. Build and start containers
docker compose up --build
```

That's it! 
- The database schema will automatically migrate and seed.
- The web app will be available immediately at: **`http://localhost:3000`**

---

## 🔑 Default Login Credentials

The database is seeded with ready-to-use role accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@apex-innovations.io` | `password123` |
| **Payroll Admin** | `payroll.admin@apex-innovations.io` | `password123` |
| **Manager / Approver** | `manager@apex-innovations.io` | `password123` |
| **Employee** | `rahul.verma@apex-innovations.io` | `password123` |

---

## 💻 Alternative: Running Locally (Node.js + Local Docker Postgres)

If you prefer running Next.js in local development mode (`npm run dev`):

1. **Start Postgres database**:
   ```bash
   docker compose up postgres -d
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Push Prisma schema & seed data**:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Key Features
- **Role-Based Access Control (RBAC)**: Super Admin, Payroll Admin, Manager, and Employee dashboards.
- **Automated Payroll Engine**: Dynamic component-based salary calculations (Basic, HRA, DA, PF, ESIC, Professional Tax, TDS).
- **Direct Banking & Host-to-Host (H2H)**: HDFC H2H format & ICICI CIB adapter generator.
- **Approvals & Disbursements**: Multi-stage approval workflow with automated payment batching.
- **Payslip Generator & Reports**: Automated downloadable payslips, monthly tax summaries, and audit trail logs.
