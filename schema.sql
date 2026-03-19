-- =========================
-- StaSu Pizza Projekt 
-- =========================

-- admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    event_password TEXT,            -- neu: Passwort pro Event
    created_at TIMESTAMP DEFAULT now()
);

-- toppings table
CREATE TABLE toppings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    validated BOOLEAN DEFAULT false,
    fertig BOOLEAN DEFAULT false,
    note TEXT                       -- neu: Freitext für Wünsche
);

-- order_items table (verknüpft toppings mit orders)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    topping_id INTEGER REFERENCES toppings(id) ON DELETE CASCADE
);