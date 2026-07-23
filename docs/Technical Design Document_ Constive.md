# Technical Design Document (TDD)
> **Project Name:** Constive Construction Management Platform  
> **Document Status:** Approved  
> **Last Updated:** 2026-07-22  
> **Author / Tech Lead:** Tim Pengembang Constive & Senior System Architect  

---

## 1. Metadata Dokumen & High-Level Tech Stack Overview

### 1.1 Parameter Proyek & Tech Stack Summary

| Kategori | Teknologi / Tool | Versi / Spesifikasi | Catatan & Rationale |
| :--- | :--- | :--- | :--- |
| **Dokumen** | Versioning | `v1.0.0` | Baseline rilis arsitektur awal (Fase 1 Core MVP) |
| **Tech Lead** | Tim Pengembang Constive | `lead@constive.id` | Architect & Code Owner |
| **Target PRD** | Product Requirement Document: Constive | `v0.2` | Mengacu pada PRD Constive v0.2 (Approved) |
| **Frontend Framework**| Next.js App Router (TypeScript) | `v14.2+ / v15.x` | SSR, React Server Components, Mobile-Friendly UI |
| **UI & Styling** | Tailwind CSS + Shadcn UI | `v3.4+` | Design Tokens, Utility-first CSS, Custom Components |
| **Gantt Chart Engine** | `gantt-task-react` (Custom Wrapper) | `v0.3+` | Custom Abstraction Wrapper untuk Interaktivitas & WBS |
| **State Management** | TanStack Query + Zustand | `v5.x` (TanStack), `v4.x` (Zustand) | Server State + Optimistic UI (TanStack) & Global Client UI State (Zustand) |
| **Backend Framework** | NestJS (Modular Monolith) | `v10.x` | TypeScript, Dependency Injection, Strict Module Boundaries, Decoupled Architecture |
| **Database Primary** | PostgreSQL via Supabase | `v15+` | Relational Database, JSONB, Triggers, High Performance B-Tree/GIN Indexes |
| **BaaS / Realtime / Storage**| Supabase | `v2.x` | Supabase Auth (JWT & OAuth), Supabase Realtime (WebSockets), Supabase Storage (S3-compatible) |
| **Cache & In-Memory** | Redis / Upstash | `v7.x` | Session Cache, Rate Limiting, Pub/Sub |
| **Infrastruktur & CI/CD** | Docker + GCP / Vercel + GitHub Actions | Multi-stage Build, Linux x86_64 | Containerization & Cloud Deployment |

---

### 1.2 High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer [Frontend Client - Next.js 14+ App Router]
        WA[Desktop Web Client - PM & Admin]
        MS[Mobile Browser Client - Pengawas Lapangan]
    end

    subgraph Edge & Gateway Network Layer
        CDN[Vercel Edge Network / Cloudflare CDN]
        RL[Rate Limiter & Security Interceptor]
    end

    subgraph Backend Application Layer [NestJS Modular Monolith]
        AG[API Gateway Router & Global Validation Pipes]
        AM[Auth & Security Module - JWT / RTR]
        WM[Workspace & Tenant Isolation Module]
        PM[Project & Gantt Chart Task Module]
        DLM[Daily Log & Visual Media Module]
        NM[Realtime Broadcast & Presence Module]
        ALM[Audit Log & Security Module]
    end

    subgraph Persistence & BaaS Infrastructure Layer [Supabase Cloud & Redis]
        SA[Supabase Auth Engine]
        DB[(PostgreSQL 15+ Database)]
        RLS[Supabase Row Level Security Engine]
        RC[(Redis Cache & Rate Limiting)]
        WS[Supabase Realtime WebSockets Engine]
        S3[Supabase S3 Storage - daily-log-media]
    end

    WA -->|HTTPS / REST API| CDN
    MS -->|HTTPS / REST API / Multipart Photo| CDN
    CDN --> RL
    RL --> AG

    AG --> AM
    AG --> WM
    AG --> PM
    AG --> DLM
    AG --> NM
    AG --> ALM

    AM -->|Verify Credentials & Tokens| SA
    WM -->|Multi-Tenant Access Control| RLS
    PM -->|Query WBS & Task Mutations| RLS
    DLM -->|Save Log & Store Media Metadata| RLS
    DLM -->|Upload Binary Media Photos max 5MB| S3
    ALM -->|Write Audit Trail Logs| DB
    RLS --> DB

    PM -->|Cache Query Results| RC
    NM -->|Broadcast Gantt Sync & Presence Locks| WS

    WA <-->|WSS Realtime Connection| WS
    MS <-->|WSS Realtime Connection| WS
```

---

## 2. Arsitektur Kode & Directory Structure

### 2.1 Struktur Folder Frontend (Next.js App Router)

```text
frontend/
├── .env.example
├── next.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── public/
│   ├── assets/
│   │   ├── logo.svg
│   │   └── icons/
│   └── favicon.ico
└── src/
    ├── app/                         # Next.js App Router Pages & Layouts
    │   ├── (auth)/                  # Route Group: Authentication & Onboarding
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── signup/
    │   │   │   └── page.tsx
    │   │   ├── forgot-password/
    │   │   │   └── page.tsx
    │   │   ├── reset-password/
    │   │   │   └── page.tsx
    │   │   ├── accept-invite/
    │   │   │   └── page.tsx
    │   │   └── layout.tsx
    │   ├── (dashboard)/             # Route Group: Authenticated Workspace & Project Dashboard
    │   │   ├── workspace/
    │   │   │   └── [workspaceId]/
    │   │   │       ├── projects/
    │   │   │       │   ├── page.tsx
    │   │   │       │   └── [projectId]/
    │   │   │       │       ├── gantt/
    │   │   │       │       │   └── page.tsx
    │   │   │       │       ├── daily-logs/
    │   │   │       │       │   ├── page.tsx
    │   │   │       │       │   └── new/page.tsx
    │   │   │       │       └── page.tsx
    │   │   │       ├── settings/
    │   │   │       │   ├── members/page.tsx
    │   │   │       │   └── page.tsx
    │   │   │       └── page.tsx
    │   │   └── layout.tsx
    │   ├── api/                     # Next.js Route Handlers (Edge API Proxy / Health Check)
    │   │   └── health/route.ts
    │   ├── layout.tsx               # Root Layout
    │   ├── page.tsx                 # Landing Page
    │   └── providers.tsx            # React Query, Theme, Auth & Toast Providers
    ├── components/                  # UI Component Library
    │   ├── ui/                      # Primitive Design System Components (Shadcn UI)
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── badge.tsx
    │   │   ├── card.tsx
    │   │   └── toast.tsx
    │   ├── shared/                  # Shared Layout Components
    │   │   ├── header.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── workspace-switcher.tsx
    │   │   └── user-nav.tsx
    │   └── features/                # Domain-Specific Business Feature Components
    │       ├── auth/
    │       │   ├── login-form.tsx
    │       │   ├── signup-form.tsx
    │       │   └── invite-gate-card.tsx
    │       ├── workspace/
    │       │   ├── workspace-card.tsx
    │       │   ├── invite-member-modal.tsx
    │       │   └── member-list-table.tsx
    │       ├── gantt/               # Interactive Gantt Chart Feature
    │       │   ├── gantt-wrapper.tsx
    │       │   ├── gantt-toolbar.tsx
    │       │   ├── task-editor-dialog.tsx
    │       │   └── presence-avatars.tsx
    │       └── daily-log/           # Mobile-Friendly Daily Log & Photo Documentation
    │           ├── daily-log-form.tsx
    │           ├── photo-uploader.tsx
    │           ├── weather-selector.tsx
    │           └── log-card-list.tsx
    ├── hooks/                       # Custom React Hooks
    │   ├── use-auth.ts
    │   ├── use-workspace.ts
    │   ├── use-gantt-realtime.ts
    │   ├── use-optimistic-gantt.ts
    │   ├── use-daily-log-draft.ts
    │   └── use-debounce.ts
    ├── services/                    # API Service Layer & Axios Client Abstractions
    │   ├── api-client.ts            # Central Axios HTTP Client with Interceptors
    │   ├── auth.service.ts
    │   ├── workspace.service.ts
    │   ├── project.service.ts
    │   ├── gantt.service.ts
    │   └── daily-log.service.ts
    ├── store/                       # Client Global State (Zustand)
    │   ├── use-ui-store.ts          # Sidebar, Modal, Theme States
    │   ├── use-workspace-store.ts   # Active Workspace Context
    │   └── use-gantt-presence-store.ts # Realtime Lock & Cursor States
    ├── types/                       # Shared TypeScript Types & Interfaces
    │   ├── index.ts
    │   ├── api-response.type.ts
    │   └── domain/
    │       ├── user.type.ts
    │       ├── workspace.type.ts
    │       ├── project.type.ts
    │       ├── task.type.ts
    │       └── daily-log.type.ts
    └── utils/                       # Utility Helpers & Constants
        ├── constants.ts
        ├── formatters.ts
        └── validators.ts
```

---

### 2.2 Struktur Folder Backend (NestJS Modular Monolith)

```text
backend/
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts                      # Application Entry Point & Global Configuration
│   ├── app.module.ts                # Root Application Module
│   ├── common/                      # Shared Cross-Cutting Concerns
│   │   ├── decorators/              # Custom Decorators (@CurrentUser, @Roles, @WorkspaceId)
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── workspace-id.decorator.ts
│   │   ├── dto/                     # Standard Response & Pagination DTOs
│   │   │   ├── api-response.dto.ts
│   │   │   └── pagination-query.dto.ts
│   │   ├── exceptions/              # Domain Exceptions & Custom HTTP Exception Filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── domain.exception.ts
│   │   ├── guards/                  # Application Guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── workspace-isolation.guard.ts
│   │   ├── interceptors/            # Global Response Transformation & Logging Interceptors
│   │   │   ├── response-transform.interceptor.ts
│   │   │   └── audit-logging.interceptor.ts
│   │   ├── pipes/                   # Global Validation & Transformation Pipes
│   │   │   └── validation.pipe.ts
│   │   └── wrappers/                # Decoupled Abstraction Wrappers (Adapter Pattern)
│   │       ├── storage/
│   │       │   ├── storage-service.interface.ts
│   │       │   └── supabase-storage.wrapper.ts
│   │       └── realtime/
│   │           ├── realtime-service.interface.ts
│   │           └── supabase-realtime.wrapper.ts
│   ├── config/                      # Environment Schema & Configuration Validation
│   │   └── env.config.ts
│   ├── database/                    # Supabase Client Provider & Migration Scripts
│   │   ├── database.module.ts
│   │   └── supabase-client.provider.ts
│   └── modules/                     # Business Domain Feature Modules
│       ├── auth/                    # Module [FT-004] Auth & User Identity
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   │   ├── register-request.dto.ts
│       │   │   ├── login-request.dto.ts
│       │   │   ├── reset-password.dto.ts
│       │   │   └── magic-link-request.dto.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       ├── workspace/               # Module [FT-001] Workspace & Member Management
│       │   ├── workspace.controller.ts
│       │   ├── workspace.module.ts
│       │   ├── workspace.service.ts
│       │   ├── workspace.repository.ts
│       │   ├── dto/
│       │   │   ├── create-workspace.dto.ts
│       │   │   ├── invite-member.dto.ts
│       │   │   └── update-member-role.dto.ts
│       │   └── entities/
│       │       ├── workspace.entity.ts
│       │       ├── workspace-member.entity.ts
│       │       └── workspace-invitation.entity.ts
│       ├── project/                 # Module Project Core
│       │   ├── project.controller.ts
│       │   ├── project.module.ts
│       │   ├── project.service.ts
│       │   ├── dto/
│       │   │   └── create-project.dto.ts
│       │   └── entities/
│       │       └── project.entity.ts
│       ├── task/                    # Module [FT-002] Interactive Gantt Chart & Tasks
│       │   ├── task.controller.ts
│       │   ├── task.module.ts
│       │   ├── task.service.ts
│       │   ├── dto/
│       │   │   ├── create-task.dto.ts
│       │   │   ├── update-task-gantt.dto.ts
│       │   │   └── batch-update-tasks.dto.ts
│       │   └── entities/
│       │       └── task.entity.ts
│       ├── daily-log/               # Module [FT-003] Smart Daily Log & Documentation
│       │   ├── daily-log.controller.ts
│       │   ├── daily-log.module.ts
│       │   ├── daily-log.service.ts
│       │   ├── dto/
│       │   │   ├── create-daily-log.dto.ts
│       │   │   ├── verify-daily-log.dto.ts
│       │   │   └── request-revision.dto.ts
│       │   └── entities/
│       │       ├── daily-log.entity.ts
│       │       └── daily-log-media.entity.ts
│       └── audit-log/               # Module Audit Trail & Security
│           ├── audit-log.module.ts
│           ├── audit-log.service.ts
│           └── entities/
│               └── audit-log.entity.ts
└── test/                            # End-to-End (E2E) Test Suite
    ├── auth.e2e-spec.ts
    ├── workspace.e2e-spec.ts
    ├── gantt.e2e-spec.ts
    ├── daily-log.e2e-spec.ts
    └── jest-e2e.json
```

---

### 2.3 Desain Komponen Abstraksi / Wrapper Design Pattern

Untuk mematuhi prinsip *Decoupled Architecture* dan *Negative Constraints* PRD, aplikasi dilarang melakukan *tight coupling* terhadap pustaka pihak ketiga. Komponen abstraksi di bawah ini dibuat menggunakan **Adapter Pattern**.

#### 2.3.1 Interface Abstraksi Storage Service (`storage-service.interface.ts`)

```typescript
// src/common/wrappers/storage/storage-service.interface.ts

export interface UploadFileOptions {
  bucket: string;
  path: string;
  fileBuffer: Buffer;
  contentType: string;
  maxSizeBytes?: number;
}

export interface UploadFileResult {
  fileKey: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
}

export interface IStorageService {
  uploadFile(options: UploadFileOptions): Promise<UploadFileResult>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string>;
}
```

#### 2.3.2 Concrete Implementation Supabase Storage Wrapper (`supabase-storage.wrapper.ts`)

```typescript
// src/common/wrappers/storage/supabase-storage.wrapper.ts

import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { IStorageService, UploadFileOptions, UploadFileResult } from './storage-service.interface';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageWrapper implements IStorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const { bucket, path, fileBuffer, contentType, maxSizeBytes = 5242880 } = options;

    // 1. Validate File Size (Default Max 5 MB per PRD FT-003)
    if (fileBuffer.byteLength > maxSizeBytes) {
      throw new BadRequestException(
        `File size (${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed limit of ${maxSizeBytes / 1024 / 1024} MB`
      );
    }

    // 2. Validate Image MIME Types (per PRD FT-003: JPG, JPEG, PNG)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(contentType.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file type (${contentType}). Only JPG, JPEG, and PNG images are allowed.`
      );
    }

    // 3. Upload File to Supabase Storage Bucket
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to upload file to storage bucket: ${error.message}`);
    }

    // 4. Extract Public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      fileKey: data.path,
      publicUrl: publicUrlData.publicUrl,
      sizeBytes: fileBuffer.byteLength,
      mimeType: contentType,
    };
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new InternalServerErrorException(`Failed to delete file from storage: ${error.message}`);
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresInSeconds: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new InternalServerErrorException(`Failed to generate signed storage URL: ${error?.message}`);
    }

    return data.signedUrl;
  }
}
```

#### 2.3.3 Interface Abstraksi Realtime Broadcast Service (`realtime-service.interface.ts`)

```typescript
// src/common/wrappers/realtime/realtime-service.interface.ts

export interface BroadcastEventPayload<T = any> {
  channel: string;
  event: string;
  payload: T;
}

export interface IRealtimeService {
  broadcastEvent<T>(eventData: BroadcastEventPayload<T>): Promise<void>;
}
```

---

## 3. Detailed Database Design & Security (PostgreSQL & Supabase)

### 3.1 Skema Database DDL SQL Lengkap

Skema di bawah ini telah disesuaikan sepenuhnya dengan entitas PRD Bab 7 (`users`, `workspaces`, `workspace_members`, `workspace_invitations`, `projects`, `tasks`, `daily_logs`, `daily_log_media`, dan `audit_logs`).

```sql
-- ==========================================
-- EXTENSIONS SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TABLE 1: users (User Profiles & Identity)
-- Syncs with Supabase Auth auth.users
-- ==========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'microsoft')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 2: workspaces (Tenant Root & Subscription)
-- ==========================================
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'STANDARD', 'PREMIUM', 'ENTERPRISE')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_free_seats INTEGER NOT NULL DEFAULT 10,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 3: workspace_members (RBAC Membership)
-- ==========================================
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workspace_user UNIQUE (workspace_id, user_id)
);

-- ==========================================
-- TABLE 4: workspace_invitations (Invite Activation Gate)
-- ==========================================
CREATE TABLE public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    invitee_email VARCHAR(255) NOT NULL,
    assigned_role VARCHAR(50) NOT NULL CHECK (assigned_role IN ('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')),
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 5: projects (Construction Projects)
-- ==========================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    start_date DATE,
    end_date DATE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 6: tasks (WBS Gantt Chart Engine)
-- ==========================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days >= 1),
    parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    predecessor_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_task_dates CHECK (end_date >= start_date)
);

-- ==========================================
-- TABLE 7: daily_logs (Field Operational Logs)
-- ==========================================
CREATE TABLE public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weather VARCHAR(50) NOT NULL CHECK (weather IN ('CERAH', 'HUJAN', 'BERAWAN', 'GERIMIS')),
    labor_count INTEGER NOT NULL CHECK (labor_count >= 0),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_LOG' CHECK (status IN ('DRAFT_LOG', 'SUBMITTED', 'VERIFIED_PM', 'REVISION_REQUESTED', 'ARCHIVED')),
    revision_notes TEXT,
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_date_supervisor UNIQUE (project_id, log_date, supervisor_id)
);

-- ==========================================
-- TABLE 8: daily_log_media (Visual Photos Metadata)
-- ==========================================
CREATE TABLE public.daily_log_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes <= 5242880), -- Max 5 MB
    mime_type VARCHAR(50) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE 9: audit_logs (Security Audit Trail)
-- ==========================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES DEFINITION
-- ==========================================
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_workspaces_slug ON public.workspaces USING btree (slug);
CREATE INDEX idx_workspace_members_user ON public.workspace_members USING btree (user_id);
CREATE INDEX idx_workspace_members_ws ON public.workspace_members USING btree (workspace_id);
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations USING btree (token);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations USING btree (invitee_email);

CREATE INDEX idx_projects_workspace ON public.projects USING btree (workspace_id);
CREATE INDEX idx_projects_status ON public.projects USING btree (status);

CREATE INDEX idx_tasks_project ON public.tasks USING btree (project_id);
CREATE INDEX idx_tasks_workspace ON public.tasks USING btree (workspace_id);
CREATE INDEX idx_tasks_parent ON public.tasks USING btree (parent_id);

CREATE INDEX idx_daily_logs_project ON public.daily_logs USING btree (project_id);
CREATE INDEX idx_daily_logs_workspace ON public.daily_logs USING btree (workspace_id);
CREATE INDEX idx_daily_logs_supervisor ON public.daily_logs USING btree (supervisor_id);
CREATE INDEX idx_daily_logs_date ON public.daily_logs USING btree (log_date);

CREATE INDEX idx_daily_log_media_log ON public.daily_log_media USING btree (daily_log_id);
CREATE INDEX idx_audit_logs_workspace ON public.audit_logs USING btree (workspace_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);

-- ==========================================
-- TRIGGERS SETUP FOR UPDATED_AT
-- ==========================================
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_workspace_invitations_updated_at BEFORE UPDATE ON public.workspace_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 3.2 Supabase Row Level Security (RLS) Policies

Setiap tabel di bawah ini dilindungi secara ketat oleh Supabase Row Level Security (RLS) untuk menjamin isolasi data multi-tenant berdasarkan `workspace_id`.

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR: users
-- ==========================================
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ==========================================
-- RLS POLICIES FOR: workspaces
-- ==========================================
CREATE POLICY "Tenant Isolation: View Workspaces"
    ON public.workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspaces.id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Update Workspace"
    ON public.workspaces FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspaces.id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: workspace_members
-- ==========================================
CREATE POLICY "Tenant Isolation: View Members"
    ON public.workspace_members FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Manage Members"
    ON public.workspace_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: projects
-- ==========================================
CREATE POLICY "Tenant Isolation: View Projects"
    ON public.projects FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Create/Update Projects"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.projects.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: tasks (Gantt Chart Engine)
-- ==========================================
CREATE POLICY "Tenant Isolation: View Tasks"
    ON public.tasks FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Manage Tasks"
    ON public.tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.tasks.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: daily_logs & daily_log_media
-- ==========================================
CREATE POLICY "Tenant Isolation: View Daily Logs"
    ON public.daily_logs FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Create/Update Daily Logs"
    ON public.daily_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.daily_logs.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')
        )
    );

CREATE POLICY "Tenant Isolation: View Daily Log Media"
    ON public.daily_log_media FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant Isolation: Manage Daily Log Media"
    ON public.daily_log_media FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.daily_log_media.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR')
        )
    );

-- ==========================================
-- RLS POLICIES FOR: audit_logs
-- ==========================================
CREATE POLICY "Tenant Isolation: View Audit Logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = public.audit_logs.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('OWNER', 'ADMIN')
        )
    );
```

---

## 4. API Specifications & Error Contracts (RESTful APIs)

### 4.1 Tabel Pemetaan API Endpoints

| HTTP Method | API Path Endpoint | Deskripsi Fungsi | Auth Required | Guards & Roles Allowed |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Pendaftaran akun baru (Sign Up) | ❌ Public | Public Endpoint |
| `POST` | `/api/v1/auth/login` | Login email/password (Sign In) | ❌ Public | Public Endpoint |
| `POST` | `/api/v1/auth/oauth` | Login/Signup via OAuth Google/Microsoft | ❌ Public | Public Endpoint |
| `POST` | `/api/v1/auth/refresh` | Refresh Access Token via HTTP Cookie | 🔄 Refresh | `JwtRefreshGuard` |
| `POST` | `/api/v1/auth/logout` | Revoke active session & clear cookies | ✅ Yes | `JwtAuthGuard` |
| `POST` | `/api/v1/auth/forgot-password` | Request tautan Reset Password | ❌ Public | Public Endpoint |
| `POST` | `/api/v1/auth/reset-password` | Reset password dengan token email | ❌ Public | Public Endpoint (One-Time Token) |
| `POST` | `/api/v1/auth/magic-link` | Request Magic Link login passwordless | ❌ Public | Public Endpoint |
| `GET` | `/api/v1/workspaces` | Get list workspace milik user aktif | ✅ Yes | `JwtAuthGuard` |
| `POST` | `/api/v1/workspaces` | Buat workspace perusahaan / pribadi baru | ✅ Yes | `JwtAuthGuard` |
| `GET` | `/api/v1/workspaces/:wId/members` | Get daftar anggota & peran di workspace | ✅ Yes | `WorkspaceIsolationGuard` |
| `POST` | `/api/v1/workspaces/:wId/invitations` | Mengundang anggota baru (Hybrid Seats) | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN'])` |
| `GET` | `/api/v1/workspaces/invitations/:token` | Validasi token undangan (Invite Gate) | ❌ Public | Public Endpoint |
| `POST` | `/api/v1/workspaces/invitations/:token/accept` | Menerima undangan workspace | ✅ Yes | `JwtAuthGuard` |
| `PATCH` | `/api/v1/workspaces/:wId/members/:uId` | Mengubah peran (role) anggota | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN'])` |
| `DELETE` | `/api/v1/workspaces/:wId/members/:uId` | Mencegah/menghapus anggota workspace | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN'])` |
| `GET` | `/api/v1/workspaces/:wId/projects` | Get daftar proyek di workspace | ✅ Yes | `WorkspaceIsolationGuard` |
| `POST` | `/api/v1/workspaces/:wId/projects` | Membuat proyek konstruksi baru | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN', 'PROJECT_MANAGER'])` |
| `GET` | `/api/v1/workspaces/:wId/projects/:pId/tasks` | Fetch tasks WBS untuk Gantt Chart | ✅ Yes | `WorkspaceIsolationGuard` |
| `POST` | `/api/v1/workspaces/:wId/projects/:pId/tasks` | Membuat task baru di Gantt Chart | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN', 'PROJECT_MANAGER'])` |
| `PATCH` | `/api/v1/workspaces/:wId/projects/:pId/tasks/:tId` | Update durasi/tanggal task (Drag & Drop) | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN', 'PROJECT_MANAGER'])` |
| `PATCH` | `/api/v1/workspaces/:wId/projects/:pId/tasks/batch-order` | Reorder & update hirarki WBS batch | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN', 'PROJECT_MANAGER'])` |
| `DELETE` | `/api/v1/workspaces/:wId/projects/:pId/tasks/:tId` | Hapus task dari Gantt Chart | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN', 'PROJECT_MANAGER'])` |
| `GET` | `/api/v1/workspaces/:wId/projects/:pId/daily-logs` | Fetch laporan harian proyek | ✅ Yes | `WorkspaceIsolationGuard` |
| `POST` | `/api/v1/workspaces/:wId/projects/:pId/daily-logs` | Submit laporan harian dari lapangan | ✅ Yes | `WorkspaceIsolationGuard(['SUPERVISOR', 'PROJECT_MANAGER', 'ADMIN', 'OWNER'])` |
| `POST` | `/api/v1/workspaces/:wId/projects/:pId/daily-logs/:logId/media` | Upload foto bukti progres (max 5MB) | ✅ Yes | `WorkspaceIsolationGuard(['SUPERVISOR', 'PROJECT_MANAGER', 'ADMIN', 'OWNER'])` |
| `PATCH` | `/api/v1/workspaces/:wId/projects/:pId/daily-logs/:logId/verify` | PM memverifikasi laporan harian | ✅ Yes | `WorkspaceIsolationGuard(['PROJECT_MANAGER', 'ADMIN', 'OWNER'])` |
| `PATCH` | `/api/v1/workspaces/:wId/projects/:pId/daily-logs/:logId/revision` | PM meminta revisi laporan harian | ✅ Yes | `WorkspaceIsolationGuard(['PROJECT_MANAGER', 'ADMIN', 'OWNER'])` |
| `GET` | `/api/v1/workspaces/:wId/audit-logs` | View log jejak audit keamanan | ✅ Yes | `WorkspaceIsolationGuard(['OWNER', 'ADMIN'])` |

---

### 4.2 Standard Response Payload Formats

#### Success Response Standard (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project Gantt Chart tasks fetched successfully",
  "data": [
    {
      "id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
      "projectId": "p9a8b7c6-5432-10fe-dcba-0987654321ba",
      "workspaceId": "w1234567-89ab-cdef-0123-456789abcdef",
      "name": "Pekerjaan Pondasi Tiang Pancang",
      "status": "IN_PROGRESS",
      "startDate": "2026-08-01",
      "endDate": "2026-08-15",
      "durationDays": 15,
      "progressPercent": 60,
      "parentId": null,
      "predecessorId": null,
      "orderIndex": 1
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "totalItems": 1,
    "totalPages": 1
  },
  "timestamp": "2026-07-22T13:45:00.000Z"
}
```

#### Error Response Standard (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed for request payload",
  "details": [
    {
      "field": "endDate",
      "issue": "endDate (2026-08-01) cannot be earlier than startDate (2026-08-05)"
    },
    {
      "field": "laborCount",
      "issue": "laborCount must be a non-negative integer (>= 0)"
    }
  ],
  "path": "/api/v1/workspaces/w1234567/projects/p9a8b7c6/tasks",
  "timestamp": "2026-07-22T13:45:00.000Z"
}
```

---

### 4.3 DTO Input Validation Schema (NestJS `class-validator`)

#### 4.3.1 Create Workspace DTO (`create-workspace.dto.ts`)
```typescript
// src/modules/workspace/dto/create-workspace.dto.ts
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'PT Konstruksi Jaya Utama', description: 'Nama ruang kerja / perusahaan' })
  @IsString()
  @IsNotEmpty({ message: 'Nama workspace wajib diisi' })
  @MinLength(3, { message: 'Nama workspace minimal 3 karakter' })
  @MaxLength(100, { message: 'Nama workspace maksimal 100 karakter' })
  name: string;

  @ApiProperty({ example: 'pt-konstruksi-jaya-utama', description: 'Slug unik URL workspace' })
  @IsString()
  @IsNotEmpty({ message: 'Slug workspace wajib diisi' })
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)' })
  slug: string;

  @ApiPropertyOptional({ example: { industry: 'General Contractor' } })
  @IsOptional()
  metadata?: Record<string, any>;
}
```

#### 4.3.2 Invite Member DTO (`invite-member.dto.ts`)
```typescript
// src/modules/workspace/dto/invite-member.dto.ts
import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkspaceRoleEnum {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SUPERVISOR = 'SUPERVISOR',
}

export class InviteMemberDto {
  @ApiProperty({ example: 'pengawas@kontraktor.id', description: 'Email calon anggota' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email penerima undangan wajib diisi' })
  inviteeEmail: string;

  @ApiProperty({ enum: WorkspaceRoleEnum, example: WorkspaceRoleEnum.SUPERVISOR })
  @IsEnum(WorkspaceRoleEnum, { message: 'Peran yang ditugaskan tidak valid' })
  @IsNotEmpty({ message: 'Peran anggota wajib ditentukan' })
  assignedRole: WorkspaceRoleEnum;
}
```

#### 4.3.3 Update Task Gantt DTO (`update-task-gantt.dto.ts`)
```typescript
// src/modules/task/dto/update-task-gantt.dto.ts
import { IsOptional, IsString, IsDateString, IsInt, Min, Max, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskGanttDto {
  @ApiPropertyOptional({ example: 'Pengecoran Slab Lantai 2' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '2026-08-10' })
  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-20' })
  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 75 })
  @IsInt()
  @Min(0, { message: 'Progress persentase minimal 0%' })
  @Max(100, { message: 'Progress persentase maksimal 100%' })
  @IsOptional()
  progressPercent?: number;

  @ApiPropertyOptional({ example: 'a9b8c7d6-e5f4-4a3b-8c2d-1e0f9a8b7c6d' })
  @IsUUID('4', { message: 'ID task parent harus berupa UUID v4' })
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 'b8c7d6e5-f4a3-4b8c-2d1e-0f9a8b7c6d5e' })
  @IsUUID('4', { message: 'ID task predecessor harus berupa UUID v4' })
  @IsOptional()
  predecessorId?: string;
}
```

#### 4.3.4 Create Daily Log DTO (`create-daily-log.dto.ts`)
```typescript
// src/modules/daily-log/dto/create-daily-log.dto.ts
import { IsNotEmpty, IsEnum, IsInt, Min, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WeatherEnum {
  CERAH = 'CERAH',
  HUJAN = 'HUJAN',
  BERAWAN = 'BERAWAN',
  GERIMIS = 'GERIMIS',
}

export class CreateDailyLogDto {
  @ApiProperty({ example: '2026-07-22', description: 'Tanggal laporan harian' })
  @IsDateString({}, { message: 'Format tanggal laporan tidak valid (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Tanggal laporan wajib diisi' })
  logDate: string;

  @ApiProperty({ enum: WeatherEnum, example: WeatherEnum.CERAH })
  @IsEnum(WeatherEnum, { message: 'Kondisi cuaca tidak valid' })
  @IsNotEmpty({ message: 'Kondisi cuaca wajib dipilih' })
  weather: WeatherEnum;

  @ApiProperty({ example: 14, description: 'Jumlah pekerja di lapangan (>= 0)' })
  @IsInt({ message: 'Jumlah pekerja harus berupa angka bulat' })
  @Min(0, { message: 'Jumlah pekerja tidak boleh negatif' })
  @IsNotEmpty({ message: 'Jumlah pekerja wajib diisi' })
  laborCount: number;

  @ApiPropertyOptional({ example: 'Pekerjaan galian tanah area A selesai 100%. Cuaca mendung sore hari.' })
  @IsString()
  @IsOptional()
  notes?: string;
}
```

---

## 5. Realtime WebSocket & Event Architecture

### 5.1 Realtime Channel & Topics Architecture

| Channel Name Pattern | Scope / Target Room | Keperluan Fitur | Auth Requirement |
| :--- | :--- | :--- | :--- |
| `workspace:{workspaceId}` | Workspace Level Broadcast | Notifikasi mutasi anggota & alert laporan harian | Active Member Only |
| `project:{projectId}:gantt` | Project Gantt Level Room | Sinkronisasi mutasi WBS / Gantt Chart real-time | Active Member Only |
| `project:{projectId}:presence` | Project Editor Room | Indicator active user & presence editing lock | Editor Access Only (PM/Admin) |

---

### 5.2 Event Specifications & JSON Schemas

#### Event 1: Gantt Task Mutation Broadcast (`gantt:task_updated`)
* **Trigger:** Ketika PM mengubah tanggal, durasi, atau status task pada Gantt Chart.
* **Payload JSON Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "event": { "type": "string", "enum": ["gantt:task_updated"] },
    "workspaceId": { "type": "string", "format": "uuid" },
    "projectId": { "type": "string", "format": "uuid" },
    "taskId": { "type": "string", "format": "uuid" },
    "actor": {
      "type": "object",
      "properties": {
        "userId": { "type": "string", "format": "uuid" },
        "name": { "type": "string" }
      },
      "required": ["userId", "name"]
    },
    "changes": {
      "type": "object",
      "properties": {
        "startDate": { "type": "string", "format": "date" },
        "endDate": { "type": "string", "format": "date" },
        "durationDays": { "type": "integer" },
        "progressPercent": { "type": "integer" }
      }
    }
  },
  "required": ["event", "workspaceId", "projectId", "taskId", "actor", "changes"]
}
```

#### Event 2: User Presence & Editing Lock (`presence:state_change`)
* **Trigger:** Ketika PM mulai mengklik/menggeser node task tertentu di Gantt Chart.
* **Payload Example:**

```json
{
  "event": "presence:state_change",
  "channel": "project:p9a8b7c6-5432-10fe-dcba-0987654321ba:presence",
  "payload": {
    "userId": "u1234567-89ab-cdef-0123-456789abcdef",
    "userName": "Ridzuan Lead PM",
    "lockedTaskId": "task-c1d2e3f4",
    "status": "EDITING",
    "timestamp": "2026-07-22T13:45:10.000Z"
  }
}
```

#### Event 3: Daily Log Submission Alert (`dailylog:submitted`)
* **Trigger:** Ketika Pengawas Lapangan berhasil mengirimkan laporan harian baru.
* **Payload Example:**

```json
{
  "event": "dailylog:submitted",
  "channel": "workspace:w1234567-89ab-cdef-0123-456789abcdef",
  "payload": {
    "logId": "dl-78901234-abcd-ef56",
    "projectId": "p9a8b7c6-5432-10fe-dcba-0987654321ba",
    "projectName": "Proyek Pembangunan Gedung A",
    "supervisorName": "Budi Pengawas",
    "logDate": "2026-07-22",
    "laborCount": 14,
    "submittedAt": "2026-07-22T13:45:12.000Z"
  }
}
```

---

## 6. Implementasi Autentikasi, Otorisasi, & Keamanan

### 6.1 JWT Access Token & HTTP-Only Refresh Token Cookie

#### Access Token Payload (Stateless JWT - Short Lived: 15 Minutes In-Memory)
```json
{
  "sub": "u1234567-89ab-cdef-0123-456789abcdef",
  "email": "user@constive.id",
  "fullName": "Ahmad PM",
  "activeWorkspaceId": "w1234567-89ab-cdef-0123-456789abcdef",
  "role": "PROJECT_MANAGER",
  "iat": 1784726586,
  "exp": 1784727486,
  "iss": "api.constive.id"
}
```

#### Refresh Token HTTP-Only Secure Cookie Configuration (Long Lived: 7 Days)
```text
Set-Cookie: refresh_token={{token_value}}; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/refresh; Max-Age=604800;
```

---

### 6.2 NestJS Guards & Interceptors Specification

```typescript
// src/common/guards/workspace-isolation.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class WorkspaceIsolationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Appended by JwtAuthGuard
    const workspaceId = request.params.wId || request.headers['x-workspace-id'];

    if (!user) {
      throw new UnauthorizedException('User context is missing');
    }

    if (!workspaceId) {
      throw new ForbiddenException('Missing Workspace ID context header or parameter');
    }

    // Verify workspace membership & active state from DB / Redis session
    const isMember = user.workspaces?.find(
      (w: any) => w.workspaceId === workspaceId && w.isActive === true
    );

    if (!isMember) {
      throw new ForbiddenException('Access Denied: You are not an active member of this workspace');
    }

    // Attach workspace & role to request context
    request.currentWorkspaceId = workspaceId;
    request.currentUserRole = isMember.role;

    // Check Role-Based Access Control (RBAC) metadata if defined
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (requiredRoles && !requiredRoles.includes(isMember.role)) {
      throw new ForbiddenException(`Access Denied: Required role [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
```

---

### 6.3 Refresh Token Rotation (RTR) & Theft Detection Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend App (Browser)
    participant Auth as NestJS Auth Module
    participant DB as Redis / Supabase Auth DB

    Client->>Auth: POST /api/v1/auth/refresh (Cookie: RT-v1)
    Auth->>DB: Lookup RT-v1 Hash & Rotation Parent Status
    alt Token Revoked / Reused (Token Theft Detected!)
        DB-->>Auth: Flagged as Reused Token
        Auth->>DB: Revoke ALL Refresh Tokens for User (Emergency Lockout)
        Auth-->>Client: HTTP 401 Unauthorized (Force Re-login on All Devices)
    else Token Valid & Unused
        Auth->>DB: Mark RT-v1 as USED
        Auth->>DB: Issue RT-v2 (Linked to RT-v1 Parent)
        Auth-->>Client: Return New Access Token + Set-Cookie: RT-v2
    end
```

---

### 6.4 Invite Activation Gate Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor Invitee as User Receiver
    participant Frontend as Next.js Frontend App
    participant Session as Browser Session Storage
    participant Backend as NestJS API Gateway
    participant Supabase as Supabase Auth / DB

    Invitee->>Frontend: Klik Tautan Undangan Email (/accept-invite?token=XYZ)
    Frontend->>Backend: GET /api/v1/workspaces/invitations/XYZ
    Backend->>Supabase: Query Token Invitation Status & Invitee Email
    alt Token Invalid / Expired / Revoked
        Backend-->>Frontend: Return Error 400 "Tautan undangan tidak berlaku"
        Frontend-->>Invitee: Tampilkan Pesan Error & Redirect Ke Landing Page
    else Token Valid
        Backend-->>Frontend: Return Invite Metadata (Workspace Name, Invitee Email, Role)
        Frontend->>Session: Store Invite Token "XYZ" in Session Storage
        alt Email Sudah Terdaftar di Constive
            Frontend-->>Invitee: Redirect ke Halaman Login (/login)
            Invitee->>Frontend: Submit Kredensial Login
            Frontend->>Backend: POST /api/v1/auth/login
            Backend-->>Frontend: Login Success + Return JWT
            Frontend->>Backend: POST /api/v1/workspaces/invitations/XYZ/accept (Bearer JWT)
            Backend->>Supabase: Insert User ke workspace_members & Update Token Status ACCEPTED
            Frontend-->>Invitee: Redirect ke Dashboard Workspace Baru
        else Email Belum Terdaftar
            Frontend-->>Invitee: Redirect ke Sign Up (/signup) (Email Read-only)
            Invitee->>Frontend: Submit Nama & Password Baru
            Frontend->>Backend: POST /api/v1/auth/register
            Backend->>Supabase: Create Account & Send Email Verification
            Invitee->>Frontend: Klik Verifikasi Email & System Reads Session Storage Token XYZ
            Frontend->>Backend: POST /api/v1/workspaces/invitations/XYZ/accept
            Backend->>Supabase: Add to workspace_members & Activate Account
            Frontend-->>Invitee: Redirect ke Onboarding Dashboard Workspace
        end
    end
```

---

## 7. Frontend State Management & Optimistic UI Strategy

### 7.1 Separation of Concerns Matrix

* **TanStack Query (Server State):** Menangani fetching data API proyek/tasks/daily logs, caching server, revalidation otomatis, background refetching, serta mutasi dengan **Optimistic UI update & automatic rollback**.
* **Zustand (Global Client UI State):** Menangani status modal (open/close), theme toggle (dark/light mode), preferensi sidebar collapse, active workspace ID, dan cursor presence state pada Gantt Chart.

---

### 7.2 Standard Query Keys Structure

```typescript
// src/services/query-keys.ts

export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
  },
  workspaces: {
    all: ['workspaces'] as const,
    detail: (workspaceId: string) => ['workspaces', workspaceId] as const,
    members: (workspaceId: string) => ['workspaces', workspaceId, 'members'] as const,
  },
  projects: {
    all: (workspaceId: string) => ['workspaces', workspaceId, 'projects'] as const,
    detail: (workspaceId: string, projectId: string) => 
      ['workspaces', workspaceId, 'projects', projectId] as const,
  },
  gantt: {
    tasks: (workspaceId: string, projectId: string) => 
      ['workspaces', workspaceId, 'projects', projectId, 'gantt-tasks'] as const,
  },
  dailyLogs: {
    list: (workspaceId: string, projectId: string, filters: Record<string, any>) => 
      ['workspaces', workspaceId, 'projects', projectId, 'daily-logs', filters] as const,
    detail: (workspaceId: string, projectId: string, logId: string) => 
      ['workspaces', workspaceId, 'projects', projectId, 'daily-logs', logId] as const,
  },
};
```

---

### 7.3 Optimistic UI Mutation with Rollback Code Example (`use-optimistic-gantt.ts`)

```typescript
// src/hooks/use-optimistic-gantt.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query-keys';
import { ganttService } from '@/services/gantt.service';
import { Task, UpdateTaskGanttDto } from '@/types/domain/task.type';
import { useToast } from '@/components/ui/toast';

export function useUpdateGanttTaskOptimistic(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const cacheKey = queryKeys.gantt.tasks(workspaceId, projectId);

  return useMutation({
    mutationFn: ({ taskId, dto }: { taskId: string; dto: UpdateTaskGanttDto }) =>
      ganttService.updateTaskGantt(workspaceId, projectId, taskId, dto),

    // 1. Before Mutation Execution: Cancel Outgoing Queries & Apply Local Optimistic Update
    onMutate: async ({ taskId, dto }) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });

      // Snapshot previous tasks cache state for rollback
      const previousTasks = queryClient.getQueryData<Task[]>(cacheKey) || [];

      // Optimistically update task in client cache
      queryClient.setQueryData<Task[]>(cacheKey, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...dto,
                updatedAt: new Date().toISOString(),
              }
            : task
        )
      );

      return { previousTasks };
    },

    // 2. If Server Responds with Error -> ROLLBACK AUTOMATICALLY!
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(cacheKey, context.previousTasks);
      }
      toast({
        title: 'Gagal Menyinkronkan Gantt Chart',
        description: 'Perubahan gagal disimpan ke server. Tampilan dikembalikan ke kondisi semula.',
        variant: 'destructive',
      });
    },

    // 3. Always Revalidate Server State After Error or Success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}
```

---

## 8. DevOps, CI/CD, & Infrastruktur Deployment

### 8.1 Multi-Stage Production Dockerfile (Backend NestJS)

```dockerfile
# ==========================================
# STAGE 1: Dependencies Installation
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# STAGE 2: Code Compilation & Build
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

# ==========================================
# STAGE 3: Production Lightweight Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs
EXPOSE 4000
ENV PORT=4000

CMD ["node", "dist/main.js"]
```

---

### 8.2 Local Docker Compose Specification (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  backend-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
      - DATABASE_URL=postgres://postgres:postgrespassword@postgres-db:5432/constive_db
      - REDIS_URL=redis://redis-cache:6379
    depends_on:
      - postgres-db
      - redis-cache
    restart: unless-stopped

  postgres-db:
    image: postgres:15-alpine
    container_name: constive_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: constive_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  redis-cache:
    image: redis:7-alpine
    container_name: constive_redis
    ports:
      - "6379:6379"
    restart: always

volumes:
  pgdata:
```

---

### 8.3 CI/CD Pipeline Workflow (GitHub Actions `.github/workflows/deploy.yml`)

```yaml
name: Constive CI/CD Pipeline Build & Deploy

on:
  push:
    branches: [ "main", "staging" ]
  pull_request:
    branches: [ "main" ]

jobs:
  lint-and-test:
    name: Code Verification, Linting & E2E Testing
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Execute Linter Check
        run: npm run lint

      - name: Run Automated Unit & E2E Tests
        run: npm run test -- --passWithNoTests

  docker-build-and-push:
    name: Container Build & Push to GHCR Registry
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/backend-api:latest
            ghcr.io/${{ github.repository }}/backend-api:${{ github.sha }}
```

---

### 8.4 Environment Variables Specification (`.env.example`)

```ini
# ==============================================================================
# CONSTIVE PLATFORM - ENVIRONMENT VARIABLES SPECIFICATION
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. APPLICATION CORE CONFIGURATION
# ------------------------------------------------------------------------------
NODE_ENV=development                       # Options: development | staging | production
PORT=4000                                  # Internal Backend HTTP Port
APP_ORIGIN=http://localhost:3000           # Allowed CORS Frontend Domain Origin

# ------------------------------------------------------------------------------
# 2. SUPABASE DATABASE & AUTHENTICATION CONFIGURATION
# ------------------------------------------------------------------------------
SUPABASE_URL=https://{{project_id}}.supabase.co
SUPABASE_ANON_KEY={{supabase_anon_public_key}}
SUPABASE_SERVICE_ROLE_KEY={{supabase_service_role_secret_key}}
DATABASE_URL=postgresql://postgres:{{password}}@db.{{project_id}}.supabase.co:5432/postgres

# ------------------------------------------------------------------------------
# 3. SECURITY & JWT TOKEN CONFIGURATION
# ------------------------------------------------------------------------------
JWT_ACCESS_SECRET={{random_hex_string_64_chars}}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET={{random_hex_string_64_chars}}
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET={{cookie_signature_secret}}

# ------------------------------------------------------------------------------
# 4. REDIS CACHE CONFIGURATION
# ------------------------------------------------------------------------------
REDIS_URL=redis://default:{{redis_password}}@localhost:6379
REDIS_TTL_SECONDS=3600

# ------------------------------------------------------------------------------
# 5. THIRD-PARTY SERVICES & STORAGE
# ------------------------------------------------------------------------------
STORAGE_BUCKET_NAME=daily-log-media
MAX_FILE_SIZE_BYTES=5242880                # 5 MB Max File Size per PRD FT-003
```
