-- =============================================
-- Migration: Workspace, Data Modeler, Use Cases
-- =============================================

-- Data Model Entities
CREATE TABLE IF NOT EXISTS data_model_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  description TEXT,
  "positionX" FLOAT DEFAULT 0,
  "positionY" FLOAT DEFAULT 0,
  width FLOAT DEFAULT 200,
  height FLOAT DEFAULT 100,
  color VARCHAR(32),
  "tableName" VARCHAR(128),
  status VARCHAR(32) DEFAULT 'active',
  "orgId" VARCHAR NOT NULL,
  "projId" VARCHAR NOT NULL,
  "appId" VARCHAR NOT NULL,
  "moduleId" VARCHAR NOT NULL,
  "servId" VARCHAR NOT NULL,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Data Model Columns
CREATE TABLE IF NOT EXISTS data_model_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "entityId" UUID NOT NULL REFERENCES data_model_entities(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  "dataType" VARCHAR(64) NOT NULL,
  "isPrimaryKey" BOOLEAN DEFAULT false,
  "isForeignKey" BOOLEAN DEFAULT false,
  "isUnique" BOOLEAN DEFAULT false,
  "isNotNull" BOOLEAN DEFAULT false,
  "isArray" BOOLEAN DEFAULT false,
  "defaultValue" VARCHAR(255),
  "checkConstraint" VARCHAR(500),
  length INT,
  precision INT,
  scale INT,
  comment TEXT,
  ordinal INT DEFAULT 0,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Data Model Relationships
CREATE TABLE IF NOT EXISTS data_model_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fromEntityId" UUID NOT NULL REFERENCES data_model_entities(id) ON DELETE CASCADE,
  "toEntityId" UUID NOT NULL REFERENCES data_model_entities(id) ON DELETE CASCADE,
  type VARCHAR(8) NOT NULL,
  name VARCHAR(160),
  color VARCHAR(32),
  "fkColumnId" UUID REFERENCES data_model_columns(id) ON DELETE SET NULL,
  "onDelete" VARCHAR(16) DEFAULT 'RESTRICT',
  "onUpdate" VARCHAR(16) DEFAULT 'RESTRICT',
  description TEXT,
  "orgId" VARCHAR NOT NULL,
  "projId" VARCHAR NOT NULL,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Use Case Actors
CREATE TABLE IF NOT EXISTS use_case_actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  type VARCHAR(32) DEFAULT 'human',
  description TEXT,
  "positionX" FLOAT DEFAULT 0,
  "positionY" FLOAT DEFAULT 0,
  color VARCHAR(32),
  status VARCHAR(32) DEFAULT 'active',
  "orgId" VARCHAR NOT NULL,
  "projId" VARCHAR NOT NULL,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Use Cases
CREATE TABLE IF NOT EXISTS use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  action TEXT,
  benefit TEXT,
  description TEXT,
  "positionX" FLOAT DEFAULT 0,
  "positionY" FLOAT DEFAULT 0,
  color VARCHAR(32),
  priority VARCHAR(16) DEFAULT 'medium',
  status VARCHAR(32) DEFAULT 'active',
  "orgId" VARCHAR NOT NULL,
  "projId" VARCHAR NOT NULL,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Use Case Scenarios
CREATE TABLE IF NOT EXISTS use_case_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "useCaseId" UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(32) DEFAULT 'nominal',
  ordinal INT DEFAULT 0,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Use Case Relationships
CREATE TABLE IF NOT EXISTS use_case_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fromId" UUID NOT NULL,
  "fromType" VARCHAR(16) NOT NULL,
  "toId" UUID NOT NULL,
  "toType" VARCHAR(16) NOT NULL,
  type VARCHAR(32) DEFAULT 'association',
  label VARCHAR(160),
  "orgId" VARCHAR NOT NULL,
  "projId" VARCHAR NOT NULL,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Project Access Control
CREATE TABLE IF NOT EXISTS project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "userId" VARCHAR(64) NOT NULL,
  "groupId" VARCHAR(64),
  "accessLevel" VARCHAR(16) DEFAULT 'read' CHECK ("accessLevel" IN ('read', 'write', 'admin')),
  "grantedBy" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMPTZ,
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE("projectId", "userId")
);

-- Module Access Overrides
CREATE TABLE IF NOT EXISTS module_access_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectAccessId" UUID NOT NULL REFERENCES project_access(id) ON DELETE CASCADE,
  "moduleType" VARCHAR(16) NOT NULL CHECK ("moduleType" IN ('data', 'usecase', 'c4', 'code')),
  "accessLevel" VARCHAR(16) DEFAULT 'read' CHECK ("accessLevel" IN ('none', 'read', 'write', 'admin')),
  created_by VARCHAR,
  updated_by VARCHAR,
  deleted_by VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dm_entities_org_proj ON data_model_entities("orgId", "projId");
CREATE INDEX IF NOT EXISTS idx_dm_columns_entity ON data_model_columns("entityId");
CREATE INDEX IF NOT EXISTS idx_dm_rels_org_proj ON data_model_relationships("orgId", "projId");
CREATE INDEX IF NOT EXISTS idx_uc_actors_org_proj ON use_case_actors("orgId", "projId");
CREATE INDEX IF NOT EXISTS idx_uc_cases_org_proj ON use_cases("orgId", "projId");
CREATE INDEX IF NOT EXISTS idx_uc_scenarios_case ON use_case_scenarios("useCaseId");
CREATE INDEX IF NOT EXISTS idx_uc_rels_org_proj ON use_case_relationships("orgId", "projId");
CREATE INDEX IF NOT EXISTS idx_proj_access_project ON project_access("projectId");
CREATE INDEX IF NOT EXISTS idx_proj_access_user ON project_access("userId");
CREATE INDEX IF NOT EXISTS idx_mod_override_access ON module_access_overrides("projectAccessId");
