# Product Requirements Document (PRD)
## Micro CRM for Merchandising Orders

**Document Status:** Draft
**Date:** February 25, 2026

---

## 1. Product Overview

### 1.1 Purpose
The Micro CRM is a specialized order management system designed specifically for handling merchandising orders (e.g., Korean merchandise imports). It streamlines the complex workflow of aggregating individual customer requests into bulk orders placed with various providers, tracking those orders through fulfillment, and providing transparency to the end customers.

### 1.2 Target Audience
The system serves two distinct user groups:
1. **Administrators (Business Owners/Managers):** Need a powerful, data-dense interface to manage suppliers, aggregate bulk orders, track individual customer sub-orders, and manage financial details (extra charges, totals).
2. **Clients (End Customers):** Need a simple, mobile-friendly portal with two key views: a high-level summary of all their active orders, and a detailed breakdown of their individual purchases, deadlines, and payment totals.

---

## 2. User Personas

### 2.1 The Administrator
- **Goals:** Efficiently process hundreds of sub-orders, update statuses in bulk, track which clients owe money, and monitor upcoming deadlines.
- **Pain Points:** Manually updating spreadsheets, losing track of custom extra charges per client, communicating status updates individually to clients.

### 2.2 The Client
- **Goals:** Know exactly where their items are in the fulfillment process, understand how much they owe (including extra charges), and see when payments or actions are due.
- **Pain Points:** Anxiety over unconfirmed orders, confusion about total costs, missing deadlines for payments or size confirmations.

---

## 3. Functional Requirements

### 3.1 Admin Portal

#### 3.1.1 Dashboard & Analytics
- **High-Level Metrics:** Display total revenue, total active clients, and counts of orders in various states (Pending, Confirmed, Shipped, Delivered).
- **Deadlines Overview:** Highlight upcoming or overdue deadlines across all active orders.

#### 3.1.2 Order & Sub-Order Management
- **Professional Data Table:** A dense, high-performance table view displaying Orders and Sub-Orders. Should support resizable columns, sorting, and pagination.
- **Actionable Buttons:** Each row must have quick-action buttons for common tasks (e.g., "Mark Shipped", "Print Label") directly within the table interface.
- **Hierarchical Viewing:** Master-detail rows to view top-level Orders (from a provider) and expand them to see all associated Sub-Orders (individual client purchases).
- **Inline Editing:** Admins must be able to click and immediately edit sub-order statuses, extra charges, and total values directly in the table cells.
- **Bulk Actions:** Admins must be able to select multiple sub-orders simultaneously and apply a status change via a prominent toolbar.
- **Advanced Filtering & Search:** 
  - Search by client name or order ID.
  - Filter by status (Pending, Confirmed, Shipped, Delivered).
  - Filter by Provider.
  - Sort by date, value, or status.

#### 3.1.3 Entity Management
- **Providers:** Manage supplier details (name, contact info, address).
- **Clients:** View client directory, contact information, and their complete order history.

### 3.2 Client Portal

#### 3.2.1 My Orders (Summary View)
- **High-Level Dashboard:** A mobile-optimized list of all orders the client is participating in, similar to the admin's list but simplified.  
- **Key Information:** Displays the Provider, overall status (e.g., "Ordering", "Shipped"), and total estimated cost at a glance.
- **Visual Status:** Simple color-coded badges indicating the general progress of the group order.

#### 3.2.2 Order Details (Detailed View)
- **Individual Purchase Breakdown:** Clicking into an order reveals the specific items purchased by this client (Sub-Order details).
- **Itemized List:** Full details of products, quantities, options (size/color), and individual prices.
- **Financial Breakdown:** Clear line items for base costs, plus specific extra charges (e.g., domestic shipping, tax) and the final total due.
- **Timeline & Deadlines:** A visual timeline of *this specific* sub-order's journey and any client-specific deadlines (e.g., "Payment Due by Friday").

#### 3.2.3 Profile Management
- View and update basic contact information (Name, Email, Phone).

---

## 4. Conceptual Data Model

The system relies on a strict hierarchical data structure:

1. **Provider:** A supplier.
2. **Order:** A bulk purchase placed with a Provider.
3. **Sub-Order:** An individual Client's portion of a bulk Order.
   - *Contains:* Products (items purchased).
   - *Contains:* Deadlines (dates for payments/actions).
   - *Contains:* Extra Charges (custom fees applied to this specific client).
4. **Client:** The end customer who owns the Sub-Orders.

---

## 5. Non-Functional Requirements

### 5.1 User Experience (UX) & Design
- **Aesthetic:** Soft, friendly, and approachable. Use rounded corners, generous whitespace, and a cool pastel color palette.
- **Mobile-First:** The Client Portal must be fully optimized for mobile devices with large tap targets (minimum 44px). The Admin Portal must be responsive, though complex data tables may be optimized for desktop/tablet.
- **Theming:** The system must support both Light and Dark modes, toggleable by the user.
- **Progressive Disclosure:** Complex data (like sub-order details) should be hidden by default and revealed upon user interaction (e.g., expanding a row) to prevent cognitive overload.

### 5.2 Performance & Interaction
- **Optimistic UI:** When an admin changes a status or value, the interface should update immediately to reflect the change while processing the request in the background, ensuring a snappy experience.
- **Debounced Inputs:** Search bars and filters should wait for the user to pause typing before executing the search to prevent interface lag.

### 5.3 Accessibility
- **Keyboard Navigation:** All interactive elements (inline editors, bulk checkboxes, dropdowns) must be fully navigable via keyboard.
- **Screen Readers:** Proper ARIA labels must be applied to all custom UI components, especially status badges and interactive table rows.
- **Color Contrast:** Status colors (Warning/Yellow, Info/Blue, Primary/Purple, Success/Green) must maintain readable contrast ratios in both light and dark themes.

### 5.4 Data Integrity & Concurrency
- **Conflict Resolution:** The system must robustly handle scenarios where multiple administrators attempt to edit the same record (Order, Sub-Order, Client) simultaneously.
- **Optimistic Locking:** To prevent accidental data overwrites, the system should implement optimistic locking (checking `updated_at` or version numbers). If a conflict is detected, the user must be alerted that the record has been modified by another user and prompted to refresh before saving.

---

## 6. Out of Scope (For MVP)
- Automated email/SMS notifications to clients.
- Integrated payment processing (Stripe/PayPal).
- Inventory management (tracking stock levels of providers).
- Multi-admin role-based access control (RBAC).