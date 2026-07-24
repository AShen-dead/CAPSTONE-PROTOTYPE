-- =====================================
-- U.C.A.R.E DATABASE
-- =====================================

PRAGMA foreign_keys = ON;

-- =====================================
-- USERS
-- =====================================

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','faculty')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- FACULTY MEMBERS
-- =====================================

CREATE TABLE faculty_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    employee_no TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department TEXT,
    contact_no TEXT,
    status TEXT DEFAULT 'Active',

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================
-- BENEFIT TYPES
-- =====================================

CREATE TABLE benefit_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    benefit_name TEXT NOT NULL,
    description TEXT,
    maximum_amount DECIMAL(10,2),
    status TEXT DEFAULT 'Active'
);

-- =====================================
-- CONTRIBUTIONS
-- =====================================

CREATE TABLE contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    contribution_month DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'Unpaid',
    remarks TEXT,

    FOREIGN KEY(faculty_id)
        REFERENCES faculty_members(id)
        ON DELETE CASCADE
);

-- =====================================
-- PAYMENTS
-- =====================================

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    contribution_id INTEGER NOT NULL,

    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    payment_method TEXT,
    reference_no TEXT,

    status TEXT DEFAULT 'Pending',

    recorded_by INTEGER,

    FOREIGN KEY(faculty_id)
        REFERENCES faculty_members(id)
        ON DELETE CASCADE,

    FOREIGN KEY(contribution_id)
        REFERENCES contributions(id)
        ON DELETE CASCADE,

    FOREIGN KEY(recorded_by)
        REFERENCES users(id)
);

-- =====================================
-- PAYMENT PROOFS
-- =====================================

CREATE TABLE payment_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    proof_image TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(payment_id)
        REFERENCES payments(id)
        ON DELETE CASCADE
);

-- =====================================
-- BENEFIT REQUESTS
-- =====================================

CREATE TABLE benefit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    faculty_id INTEGER NOT NULL,
    benefit_type_id INTEGER NOT NULL,

    request_date DATE DEFAULT CURRENT_DATE,

    amount_requested DECIMAL(10,2),

    reason TEXT,

    status TEXT DEFAULT 'Pending',

    approved_by INTEGER,
    approved_date DATETIME,

    FOREIGN KEY(faculty_id)
        REFERENCES faculty_members(id)
        ON DELETE CASCADE,

    FOREIGN KEY(benefit_type_id)
        REFERENCES benefit_types(id),

    FOREIGN KEY(approved_by)
        REFERENCES users(id)
);

-- =====================================
-- BENEFIT DOCUMENTS
-- =====================================

CREATE TABLE benefit_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    request_id INTEGER NOT NULL,

    document_path TEXT NOT NULL,

    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(request_id)
        REFERENCES benefit_requests(id)
        ON DELETE CASCADE
);