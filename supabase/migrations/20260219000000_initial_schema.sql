-- =============================================================================
-- eXemble Ontology Platform - Initial Schema + Seed Data
-- =============================================================================
-- Purpose: Create 8 tables for the semiconductor FAB graph DB monitoring
-- platform with Row Level Security policies and seed data for POC demo.
--
-- Tables: clusters, nodes, gpus, metrics, ontology_types, queries, alerts, users
-- Seed: SKS-FAB1-PROD cluster, 12 nodes, 4 GPUs, 6 ontology types, 5 users
--
-- Application: Run via Supabase Dashboard SQL Editor (paste and execute).
-- Convention: snake_case columns (PostgreSQL standard).
-- =============================================================================

-- ============================
-- Schema: 8 Tables
-- ============================

CREATE TABLE clusters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'healthy',
  version VARCHAR(50),
  node_count INTEGER DEFAULT 0,
  replication_factor INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE nodes (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER REFERENCES clusters(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'healthy',
  host VARCHAR(255),
  port INTEGER,
  cpu_usage REAL DEFAULT 0,
  memory_usage REAL DEFAULT 0,
  disk_usage REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE gpus (
  id SERIAL PRIMARY KEY,
  node_id INTEGER REFERENCES nodes(id),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  status VARCHAR(50) DEFAULT 'healthy',
  utilization REAL DEFAULT 0,
  memory_used REAL DEFAULT 0,
  memory_total REAL DEFAULT 0,
  temperature REAL DEFAULT 0,
  power_usage REAL DEFAULT 0,
  power_limit REAL DEFAULT 0
);

CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER REFERENCES clusters(id),
  node_id INTEGER REFERENCES nodes(id),
  gpu_id INTEGER REFERENCES gpus(id),
  type VARCHAR(100) NOT NULL,
  value REAL NOT NULL,
  unit VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ontology_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  node_count INTEGER DEFAULT 0,
  predicates JSONB DEFAULT '[]',
  relations JSONB DEFAULT '[]'
);

CREATE TABLE queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  query_text TEXT NOT NULL,
  query_type VARCHAR(50) DEFAULT 'graphql',
  status VARCHAR(50) DEFAULT 'pending',
  execution_time INTEGER,
  result_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER REFERENCES clusters(id),
  node_id INTEGER REFERENCES nodes(id),
  severity VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'data_analyst',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK for queries.user_id -> users.id (created after users table)
ALTER TABLE queries ADD CONSTRAINT fk_queries_user FOREIGN KEY (user_id) REFERENCES users(id);

-- ============================
-- RLS: Enable Row Level Security (POC)
-- ============================

ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ontology_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for all tables (POC - no real auth enforcement)
CREATE POLICY "Allow anon select" ON clusters FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON nodes FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON gpus FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON metrics FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON ontology_types FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON queries FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON users FOR SELECT USING (true);

-- ============================
-- Seed Data
-- ============================

-- Cluster (1)
INSERT INTO clusters (name, status, version, node_count, replication_factor)
VALUES ('SKS-FAB1-PROD', 'healthy', '23.1.0', 12, 3);

-- Nodes (12)
-- sks-zero-01~03 (zero), sks-alpha-01~06 (alpha), sks-compute-01~03 (alpha)
-- sks-alpha-03: warning, sks-compute-03: error
INSERT INTO nodes (cluster_id, name, type, status, host, port, cpu_usage, memory_usage, disk_usage) VALUES
  (1, 'sks-zero-01', 'zero', 'healthy', '10.0.1.1', 5080, 15.2, 32.1, 28.5),
  (1, 'sks-zero-02', 'zero', 'healthy', '10.0.1.2', 5080, 12.8, 28.9, 25.3),
  (1, 'sks-zero-03', 'zero', 'healthy', '10.0.1.3', 5080, 18.1, 35.4, 30.1),
  (1, 'sks-alpha-01', 'alpha', 'healthy', '10.0.2.1', 7080, 45.3, 62.1, 55.8),
  (1, 'sks-alpha-02', 'alpha', 'healthy', '10.0.2.2', 7080, 52.1, 58.4, 48.2),
  (1, 'sks-alpha-03', 'alpha', 'warning', '10.0.2.3', 7080, 78.9, 85.2, 72.1),
  (1, 'sks-alpha-04', 'alpha', 'healthy', '10.0.2.4', 7080, 38.7, 54.3, 42.6),
  (1, 'sks-alpha-05', 'alpha', 'healthy', '10.0.2.5', 7080, 41.2, 49.8, 38.9),
  (1, 'sks-alpha-06', 'alpha', 'healthy', '10.0.2.6', 7080, 35.6, 52.7, 45.3),
  (1, 'sks-compute-01', 'alpha', 'healthy', '10.0.3.1', 7080, 65.4, 71.2, 58.4),
  (1, 'sks-compute-02', 'alpha', 'healthy', '10.0.3.2', 7080, 58.9, 68.5, 52.1),
  (1, 'sks-compute-03', 'alpha', 'error', '10.0.3.3', 7080, 92.1, 94.8, 88.5);

-- GPUs (4)
-- GPU-0, GPU-1: A100 80GB on node 10 (sks-compute-01)
-- GPU-2, GPU-3: A100 40GB on node 11 (sks-compute-02)
-- GPU-2: warning status
INSERT INTO gpus (node_id, name, model, status, utilization, memory_used, memory_total, temperature, power_usage, power_limit) VALUES
  (10, 'GPU-0', 'NVIDIA A100 80GB', 'healthy', 72.5, 48.2, 80.0, 67.0, 285.0, 400.0),
  (10, 'GPU-1', 'NVIDIA A100 80GB', 'healthy', 68.3, 45.1, 80.0, 64.0, 270.0, 400.0),
  (11, 'GPU-2', 'NVIDIA A100 40GB', 'warning', 85.1, 35.8, 40.0, 78.0, 245.0, 300.0),
  (11, 'GPU-3', 'NVIDIA A100 40GB', 'healthy', 55.7, 22.4, 40.0, 58.0, 180.0, 300.0);

-- Ontology Types (6)
-- Equipment(832), Process(24500), Wafer(156000), Recipe(310), Defect(48800), MaintenanceRecord(3820)
INSERT INTO ontology_types (name, description, node_count, predicates, relations) VALUES
  (
    'Equipment',
    'Semiconductor manufacturing equipment',
    832,
    '["equipment_id", "name", "type", "manufacturer", "location", "status", "install_date"]',
    '[{"name": "runs", "target": "Process", "direction": "outbound"}, {"name": "located_at", "target": "Equipment", "direction": "outbound"}, {"name": "triggers", "target": "Alert", "direction": "outbound"}]'
  ),
  (
    'Process',
    'Manufacturing process steps',
    24500,
    '["process_id", "name", "step_number", "duration", "temperature", "pressure"]',
    '[{"name": "produces", "target": "Wafer", "direction": "outbound"}, {"name": "uses", "target": "Recipe", "direction": "outbound"}]'
  ),
  (
    'Wafer',
    'Silicon wafer tracking',
    156000,
    '["wafer_id", "lot_id", "diameter", "thickness", "grade", "status"]',
    '[{"name": "has_defect", "target": "Defect", "direction": "outbound"}]'
  ),
  (
    'Recipe',
    'Process recipes and parameters',
    310,
    '["recipe_id", "name", "version", "parameters", "created_by"]',
    '[{"name": "applied_to", "target": "Process", "direction": "outbound"}]'
  ),
  (
    'Defect',
    'Wafer defect records',
    48800,
    '["defect_id", "type", "location_x", "location_y", "size", "severity"]',
    '[{"name": "found_by", "target": "Equipment", "direction": "outbound"}]'
  ),
  (
    'MaintenanceRecord',
    'Equipment maintenance history',
    3820,
    '["record_id", "type", "scheduled_date", "completed_date", "technician", "notes"]',
    '[{"name": "performed_on", "target": "Equipment", "direction": "outbound"}]'
  );

-- Users (5)
-- admin(super_admin), api-server(service_app), analyst1(data_analyst),
-- auditor1(auditor), operator1(service_app)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@exem.com', '$2b$10$placeholder_hash_admin', 'super_admin'),
  ('api-server', 'api@sksiltron.com', '$2b$10$placeholder_hash_api', 'service_app'),
  ('analyst1', 'analyst1@sksiltron.com', '$2b$10$placeholder_hash_analyst', 'data_analyst'),
  ('auditor1', 'auditor1@sksiltron.com', '$2b$10$placeholder_hash_auditor', 'auditor'),
  ('operator1', 'op1@sksiltron.com', '$2b$10$placeholder_hash_operator', 'service_app');
