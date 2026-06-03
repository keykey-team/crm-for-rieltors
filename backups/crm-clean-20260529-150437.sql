--
-- PostgreSQL database dump
--

\restrict pFkN8VOMhX4IMRWzmVWfplVdXOarijYsSl7njS3HTokPYji1JrkpB0ZcDeb5kf7

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivityLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ActivityLog" (
    id text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    action text NOT NULL,
    details text,
    "userId" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ActivityLog" OWNER TO postgres;

--
-- Name: AftercarePlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AftercarePlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "agencyId" text NOT NULL
);


ALTER TABLE public."AftercarePlan" OWNER TO postgres;

--
-- Name: AftercareStep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AftercareStep" (
    id text NOT NULL,
    "planId" text NOT NULL,
    "dayOffset" integer NOT NULL,
    type text DEFAULT 'message'::text NOT NULL,
    title text NOT NULL,
    content text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AftercareStep" OWNER TO postgres;

--
-- Name: Agency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Agency" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    "ownerId" text NOT NULL,
    "brandLogo" text,
    "brandName" text,
    "primaryColor" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Agency" OWNER TO postgres;

--
-- Name: AgencyMembership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AgencyMembership" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'agent'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "invitedBy" text,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AgencyMembership" OWNER TO postgres;

--
-- Name: Automation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Automation" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    trigger text NOT NULL,
    "triggerValue" text,
    action text NOT NULL,
    "actionValue" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdById" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastRunAt" timestamp(3) without time zone,
    "lastRunResult" text
);


ALTER TABLE public."Automation" OWNER TO postgres;

--
-- Name: ChatMention; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatMention" (
    id text NOT NULL,
    "messageId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatMention" OWNER TO postgres;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    text text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "roomId" text,
    "threadId" text
);


ALTER TABLE public."ChatMessage" OWNER TO postgres;

--
-- Name: ChatRoom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatRoom" (
    id text NOT NULL,
    name text,
    type text DEFAULT 'direct'::text NOT NULL,
    "createdById" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatRoom" OWNER TO postgres;

--
-- Name: ChatRoomMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatRoomMember" (
    id text NOT NULL,
    "roomId" text NOT NULL,
    "userId" text NOT NULL,
    "lastReadAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatRoomMember" OWNER TO postgres;

--
-- Name: ClientSelection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientSelection" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    "createdById" text NOT NULL,
    "agencyId" text NOT NULL,
    "publicSlug" text NOT NULL,
    title text,
    message text,
    "expiresAt" timestamp(3) without time zone,
    "viewsCount" integer DEFAULT 0 NOT NULL,
    "lastViewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClientSelection" OWNER TO postgres;

--
-- Name: Communication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Communication" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type text DEFAULT 'note'::text NOT NULL,
    direction text,
    content text NOT NULL,
    "userId" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Communication" OWNER TO postgres;

--
-- Name: Deal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Deal" (
    id text NOT NULL,
    title text NOT NULL,
    stage text DEFAULT 'new_lead'::text NOT NULL,
    "dealType" text,
    "funnelId" text,
    amount double precision,
    commission double precision,
    "leadId" text,
    "propertyId" text,
    "assignedToId" text,
    "agencyId" text NOT NULL,
    notes text,
    "meetingDate" timestamp(3) without time zone,
    "showDate" timestamp(3) without time zone,
    "depositDate" timestamp(3) without time zone,
    "closeDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL
);


ALTER TABLE public."Deal" OWNER TO postgres;

--
-- Name: DealChecklist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealChecklist" (
    id text NOT NULL,
    "dealId" text NOT NULL,
    title text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DealChecklist" OWNER TO postgres;

--
-- Name: DealComment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealComment" (
    id text NOT NULL,
    "dealId" text NOT NULL,
    "authorId" text,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DealComment" OWNER TO postgres;

--
-- Name: DealCustomField; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealCustomField" (
    id text NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    "fieldType" text DEFAULT 'text'::text NOT NULL,
    options text,
    required boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DealCustomField" OWNER TO postgres;

--
-- Name: DealCustomFieldValue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealCustomFieldValue" (
    id text NOT NULL,
    "dealId" text NOT NULL,
    "fieldId" text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DealCustomFieldValue" OWNER TO postgres;

--
-- Name: Dictionary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Dictionary" (
    id text NOT NULL,
    category text NOT NULL,
    value text NOT NULL,
    label text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Dictionary" OWNER TO postgres;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    type text DEFAULT 'meeting'::text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "allDay" boolean DEFAULT false NOT NULL,
    "userId" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: Funnel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Funnel" (
    id text NOT NULL,
    name text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Funnel" OWNER TO postgres;

--
-- Name: FunnelStage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FunnelStage" (
    id text NOT NULL,
    "funnelId" text,
    value text NOT NULL,
    label text NOT NULL,
    color text DEFAULT '#60B5FF'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FunnelStage" OWNER TO postgres;

--
-- Name: HelperMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HelperMessage" (
    id text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."HelperMessage" OWNER TO postgres;

--
-- Name: KnowledgeArticle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KnowledgeArticle" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    "authorId" text,
    "agencyId" text NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KnowledgeArticle" OWNER TO postgres;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text,
    email text,
    phone text NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    status text DEFAULT 'new_lead'::text NOT NULL,
    "needType" text DEFAULT 'buy'::text NOT NULL,
    budget double precision,
    "budgetMax" double precision,
    districts text,
    "propertyType" text,
    notes text,
    priority text DEFAULT 'medium'::text NOT NULL,
    "assignedToId" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastContact" timestamp(3) without time zone
);


ALTER TABLE public."Lead" OWNER TO postgres;

--
-- Name: LeadDistributionRule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LeadDistributionRule" (
    id text NOT NULL,
    name text NOT NULL,
    source text,
    district text,
    "propertyType" text,
    "needType" text,
    "assignToId" text NOT NULL,
    "agencyId" text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LeadDistributionRule" OWNER TO postgres;

--
-- Name: Property; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    title text NOT NULL,
    type text DEFAULT 'apartment'::text NOT NULL,
    address text NOT NULL,
    district text,
    city text DEFAULT 'Киев'::text NOT NULL,
    rooms integer,
    area double precision,
    floor integer,
    "totalFloors" integer,
    price double precision NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "dealTypes" text[] DEFAULT ARRAY[]::text[],
    description text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Property" OWNER TO postgres;

--
-- Name: PropertyPhoto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PropertyPhoto" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "cloudStoragePath" text NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PropertyPhoto" OWNER TO postgres;

--
-- Name: PropertyPriceHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PropertyPriceHistory" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "agencyId" text NOT NULL,
    price double precision NOT NULL,
    currency text NOT NULL,
    "changedBy" text,
    reason text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PropertyPriceHistory" OWNER TO postgres;

--
-- Name: PropertyUnit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PropertyUnit" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "unitNumber" text NOT NULL,
    floor integer NOT NULL,
    section integer DEFAULT 1 NOT NULL,
    rooms integer,
    area double precision,
    price double precision,
    status text DEFAULT 'available'::text NOT NULL,
    "dealId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PropertyUnit" OWNER TO postgres;

--
-- Name: SelectionItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SelectionItem" (
    id text NOT NULL,
    "selectionId" text NOT NULL,
    "propertyId" text NOT NULL,
    "agencyId" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "agentComment" text,
    "clientReaction" text,
    "clientNote" text,
    "reactedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SelectionItem" OWNER TO postgres;

--
-- Name: Showing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Showing" (
    id text NOT NULL,
    "dealId" text,
    "propertyId" text NOT NULL,
    "leadId" text,
    "agentId" text,
    "agencyId" text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "durationMin" integer DEFAULT 30 NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    feedback text,
    "clientRating" integer,
    "agentNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Showing" OWNER TO postgres;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    type text DEFAULT 'call'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "leadId" text,
    "assignedToId" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Task" OWNER TO postgres;

--
-- Name: Template; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Template" (
    id text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'message'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    content text NOT NULL,
    variables text,
    "createdById" text,
    "agencyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Template" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'agent'::text NOT NULL,
    phone text,
    avatar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accountType" text DEFAULT 'agent'::text NOT NULL,
    plan text DEFAULT 'free'::text NOT NULL,
    "brandLogo" text,
    "brandName" text,
    "primaryColor" text,
    "calendarToken" text,
    "gradientBg" boolean DEFAULT false,
    "sidebarGlass" boolean DEFAULT false,
    "sidebarOpacity" double precision DEFAULT 1,
    "themeMode" text DEFAULT 'light'::text,
    permissions text,
    "lastAgencyId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ActivityLog" (id, "entityType", "entityId", action, details, "userId", "agencyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: AftercarePlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AftercarePlan" (id, name, description, "isActive", "createdAt", "updatedAt", "order", "agencyId") FROM stdin;
\.


--
-- Data for Name: AftercareStep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AftercareStep" (id, "planId", "dayOffset", type, title, content, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: Agency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Agency" (id, name, slug, plan, "ownerId", "brandLogo", "brandName", "primaryColor", "createdAt", "updatedAt") FROM stdin;
default-agency	Default Agency	default	free	local-super-admin	\N	\N	\N	2026-05-29 11:59:04.151	2026-05-29 11:59:04.151
\.


--
-- Data for Name: AgencyMembership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AgencyMembership" (id, "agencyId", "userId", role, "isActive", "invitedBy", "joinedAt") FROM stdin;
cmpqvckx90001rq3v6gwtd0aq	default-agency	local-super-admin	owner	t	\N	2026-05-29 11:59:04.173
\.


--
-- Data for Name: Automation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Automation" (id, name, description, trigger, "triggerValue", action, "actionValue", "isActive", "createdById", "agencyId", "createdAt", "updatedAt", "lastRunAt", "lastRunResult") FROM stdin;
\.


--
-- Data for Name: ChatMention; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatMention" (id, "messageId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatMessage" (id, "senderId", "receiverId", text, "isRead", "createdAt", "roomId", "threadId") FROM stdin;
\.


--
-- Data for Name: ChatRoom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatRoom" (id, name, type, "createdById", "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatRoomMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatRoomMember" (id, "roomId", "userId", "lastReadAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: ClientSelection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientSelection" (id, "leadId", "createdById", "agencyId", "publicSlug", title, message, "expiresAt", "viewsCount", "lastViewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Communication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Communication" (id, "leadId", type, direction, content, "userId", "agencyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Deal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Deal" (id, title, stage, "dealType", "funnelId", amount, commission, "leadId", "propertyId", "assignedToId", "agencyId", notes, "meetingDate", "showDate", "depositDate", "closeDate", "createdAt", "updatedAt", currency) FROM stdin;
\.


--
-- Data for Name: DealChecklist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealChecklist" (id, "dealId", title, completed, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: DealComment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealComment" (id, "dealId", "authorId", text, "createdAt") FROM stdin;
\.


--
-- Data for Name: DealCustomField; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealCustomField" (id, name, label, "fieldType", options, required, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DealCustomFieldValue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealCustomFieldValue" (id, "dealId", "fieldId", value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Dictionary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Dictionary" (id, category, value, label, "order", "isActive", "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, title, description, type, "startDate", "endDate", "allDay", "userId", "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Funnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Funnel" (id, name, "isDefault", "isActive", "order", "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FunnelStage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FunnelStage" (id, "funnelId", value, label, color, "order", "isDefault", "isActive", "createdAt", "updatedAt") FROM stdin;
cmpqvckxx0003rq3vytquj6ah	\N	new_lead	Новий лід	#5AC8FA	0	t	t	2026-05-29 11:59:04.197	2026-05-29 11:59:04.197
cmpqvcky80005rq3vnlbf52fd	\N	success	Успішно	#30D158	997	t	t	2026-05-29 11:59:04.209	2026-05-29 11:59:04.209
cmpqvckyh0007rq3vwudru804	\N	rejected	Відмова	#FF453A	998	t	t	2026-05-29 11:59:04.217	2026-05-29 11:59:04.217
cmpqvckyp0009rq3v9gzv5gps	\N	object_cancelled	Об'єкт скасовано	#8E8E93	999	t	t	2026-05-29 11:59:04.225	2026-05-29 11:59:04.225
\.


--
-- Data for Name: HelperMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HelperMessage" (id, "userId", role, content, "createdAt") FROM stdin;
\.


--
-- Data for Name: KnowledgeArticle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KnowledgeArticle" (id, title, content, category, "authorId", "agencyId", published, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lead" (id, "firstName", "lastName", email, phone, source, status, "needType", budget, "budgetMax", districts, "propertyType", notes, priority, "assignedToId", "agencyId", "createdAt", "updatedAt", "lastContact") FROM stdin;
\.


--
-- Data for Name: LeadDistributionRule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LeadDistributionRule" (id, name, source, district, "propertyType", "needType", "assignToId", "agencyId", priority, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Property" (id, title, type, address, district, city, rooms, area, floor, "totalFloors", price, currency, status, "dealTypes", description, "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PropertyPhoto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PropertyPhoto" (id, "propertyId", "cloudStoragePath", "isPublic", "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: PropertyPriceHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PropertyPriceHistory" (id, "propertyId", "agencyId", price, currency, "changedBy", reason, note, "createdAt") FROM stdin;
\.


--
-- Data for Name: PropertyUnit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PropertyUnit" (id, "propertyId", "unitNumber", floor, section, rooms, area, price, status, "dealId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SelectionItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SelectionItem" (id, "selectionId", "propertyId", "agencyId", "order", "agentComment", "clientReaction", "clientNote", "reactedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Showing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Showing" (id, "dealId", "propertyId", "leadId", "agentId", "agencyId", "scheduledAt", "durationMin", status, feedback, "clientRating", "agentNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" (id, title, description, type, priority, status, "dueDate", "completedAt", "leadId", "assignedToId", "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Template; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Template" (id, name, type, category, content, variables, "createdById", "agencyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, phone, avatar, "createdAt", "updatedAt", "accountType", plan, "brandLogo", "brandName", "primaryColor", "calendarToken", "gradientBg", "sidebarGlass", "sidebarOpacity", "themeMode", permissions, "lastAgencyId") FROM stdin;
local-super-admin	Super Admin	superadmin@local.crm	$2a$12$Uf8x7EvHfa3r6x5D5vZAzOm8rPpmxVinVumsNV2VCjHAGZR/OFWEy	admin	\N	\N	2026-05-29 11:59:04.132	2026-05-29 11:59:04.184	agency	business	\N	\N	\N	\N	f	f	1	light	\N	default-agency
\.


--
-- Name: ActivityLog ActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY (id);


--
-- Name: AftercarePlan AftercarePlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AftercarePlan"
    ADD CONSTRAINT "AftercarePlan_pkey" PRIMARY KEY (id);


--
-- Name: AftercareStep AftercareStep_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AftercareStep"
    ADD CONSTRAINT "AftercareStep_pkey" PRIMARY KEY (id);


--
-- Name: AgencyMembership AgencyMembership_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgencyMembership"
    ADD CONSTRAINT "AgencyMembership_pkey" PRIMARY KEY (id);


--
-- Name: Agency Agency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Agency"
    ADD CONSTRAINT "Agency_pkey" PRIMARY KEY (id);


--
-- Name: Automation Automation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Automation"
    ADD CONSTRAINT "Automation_pkey" PRIMARY KEY (id);


--
-- Name: ChatMention ChatMention_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMention"
    ADD CONSTRAINT "ChatMention_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ChatRoomMember ChatRoomMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatRoomMember"
    ADD CONSTRAINT "ChatRoomMember_pkey" PRIMARY KEY (id);


--
-- Name: ChatRoom ChatRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatRoom"
    ADD CONSTRAINT "ChatRoom_pkey" PRIMARY KEY (id);


--
-- Name: ClientSelection ClientSelection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSelection"
    ADD CONSTRAINT "ClientSelection_pkey" PRIMARY KEY (id);


--
-- Name: Communication Communication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_pkey" PRIMARY KEY (id);


--
-- Name: DealChecklist DealChecklist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealChecklist"
    ADD CONSTRAINT "DealChecklist_pkey" PRIMARY KEY (id);


--
-- Name: DealComment DealComment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealComment"
    ADD CONSTRAINT "DealComment_pkey" PRIMARY KEY (id);


--
-- Name: DealCustomFieldValue DealCustomFieldValue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealCustomFieldValue"
    ADD CONSTRAINT "DealCustomFieldValue_pkey" PRIMARY KEY (id);


--
-- Name: DealCustomField DealCustomField_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealCustomField"
    ADD CONSTRAINT "DealCustomField_pkey" PRIMARY KEY (id);


--
-- Name: Deal Deal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_pkey" PRIMARY KEY (id);


--
-- Name: Dictionary Dictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dictionary"
    ADD CONSTRAINT "Dictionary_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: FunnelStage FunnelStage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FunnelStage"
    ADD CONSTRAINT "FunnelStage_pkey" PRIMARY KEY (id);


--
-- Name: Funnel Funnel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Funnel"
    ADD CONSTRAINT "Funnel_pkey" PRIMARY KEY (id);


--
-- Name: HelperMessage HelperMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HelperMessage"
    ADD CONSTRAINT "HelperMessage_pkey" PRIMARY KEY (id);


--
-- Name: KnowledgeArticle KnowledgeArticle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KnowledgeArticle"
    ADD CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY (id);


--
-- Name: LeadDistributionRule LeadDistributionRule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadDistributionRule"
    ADD CONSTRAINT "LeadDistributionRule_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: PropertyPhoto PropertyPhoto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyPhoto"
    ADD CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY (id);


--
-- Name: PropertyPriceHistory PropertyPriceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyPriceHistory"
    ADD CONSTRAINT "PropertyPriceHistory_pkey" PRIMARY KEY (id);


--
-- Name: PropertyUnit PropertyUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyUnit"
    ADD CONSTRAINT "PropertyUnit_pkey" PRIMARY KEY (id);


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: SelectionItem SelectionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SelectionItem"
    ADD CONSTRAINT "SelectionItem_pkey" PRIMARY KEY (id);


--
-- Name: Showing Showing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Showing"
    ADD CONSTRAINT "Showing_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: Template Template_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Template"
    ADD CONSTRAINT "Template_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: ActivityLog_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ActivityLog_agencyId_idx" ON public."ActivityLog" USING btree ("agencyId");


--
-- Name: ActivityLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ActivityLog_createdAt_idx" ON public."ActivityLog" USING btree ("createdAt");


--
-- Name: ActivityLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ActivityLog_entityType_entityId_idx" ON public."ActivityLog" USING btree ("entityType", "entityId");


--
-- Name: ActivityLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ActivityLog_userId_idx" ON public."ActivityLog" USING btree ("userId");


--
-- Name: AftercarePlan_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AftercarePlan_agencyId_idx" ON public."AftercarePlan" USING btree ("agencyId");


--
-- Name: AftercareStep_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AftercareStep_planId_idx" ON public."AftercareStep" USING btree ("planId");


--
-- Name: AgencyMembership_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AgencyMembership_agencyId_idx" ON public."AgencyMembership" USING btree ("agencyId");


--
-- Name: AgencyMembership_agencyId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AgencyMembership_agencyId_userId_key" ON public."AgencyMembership" USING btree ("agencyId", "userId");


--
-- Name: AgencyMembership_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AgencyMembership_userId_idx" ON public."AgencyMembership" USING btree ("userId");


--
-- Name: Agency_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Agency_ownerId_idx" ON public."Agency" USING btree ("ownerId");


--
-- Name: Agency_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Agency_slug_key" ON public."Agency" USING btree (slug);


--
-- Name: Automation_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Automation_agencyId_idx" ON public."Automation" USING btree ("agencyId");


--
-- Name: ChatMention_messageId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMention_messageId_idx" ON public."ChatMention" USING btree ("messageId");


--
-- Name: ChatMention_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMention_userId_idx" ON public."ChatMention" USING btree ("userId");


--
-- Name: ChatMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_createdAt_idx" ON public."ChatMessage" USING btree ("createdAt");


--
-- Name: ChatMessage_receiverId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_receiverId_isRead_idx" ON public."ChatMessage" USING btree ("receiverId", "isRead");


--
-- Name: ChatMessage_roomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_roomId_idx" ON public."ChatMessage" USING btree ("roomId");


--
-- Name: ChatMessage_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_senderId_receiverId_idx" ON public."ChatMessage" USING btree ("senderId", "receiverId");


--
-- Name: ChatMessage_threadId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_threadId_idx" ON public."ChatMessage" USING btree ("threadId");


--
-- Name: ChatRoomMember_roomId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChatRoomMember_roomId_userId_key" ON public."ChatRoomMember" USING btree ("roomId", "userId");


--
-- Name: ChatRoomMember_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatRoomMember_userId_idx" ON public."ChatRoomMember" USING btree ("userId");


--
-- Name: ChatRoom_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatRoom_agencyId_idx" ON public."ChatRoom" USING btree ("agencyId");


--
-- Name: ChatRoom_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatRoom_type_idx" ON public."ChatRoom" USING btree (type);


--
-- Name: ClientSelection_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClientSelection_agencyId_idx" ON public."ClientSelection" USING btree ("agencyId");


--
-- Name: ClientSelection_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClientSelection_createdById_idx" ON public."ClientSelection" USING btree ("createdById");


--
-- Name: ClientSelection_leadId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClientSelection_leadId_idx" ON public."ClientSelection" USING btree ("leadId");


--
-- Name: ClientSelection_publicSlug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClientSelection_publicSlug_idx" ON public."ClientSelection" USING btree ("publicSlug");


--
-- Name: ClientSelection_publicSlug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ClientSelection_publicSlug_key" ON public."ClientSelection" USING btree ("publicSlug");


--
-- Name: Communication_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Communication_agencyId_idx" ON public."Communication" USING btree ("agencyId");


--
-- Name: Communication_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Communication_createdAt_idx" ON public."Communication" USING btree ("createdAt");


--
-- Name: Communication_leadId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Communication_leadId_idx" ON public."Communication" USING btree ("leadId");


--
-- Name: DealChecklist_dealId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealChecklist_dealId_idx" ON public."DealChecklist" USING btree ("dealId");


--
-- Name: DealComment_dealId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealComment_dealId_idx" ON public."DealComment" USING btree ("dealId");


--
-- Name: DealCustomFieldValue_dealId_fieldId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DealCustomFieldValue_dealId_fieldId_key" ON public."DealCustomFieldValue" USING btree ("dealId", "fieldId");


--
-- Name: DealCustomFieldValue_dealId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealCustomFieldValue_dealId_idx" ON public."DealCustomFieldValue" USING btree ("dealId");


--
-- Name: DealCustomFieldValue_fieldId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealCustomFieldValue_fieldId_idx" ON public."DealCustomFieldValue" USING btree ("fieldId");


--
-- Name: Deal_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deal_agencyId_idx" ON public."Deal" USING btree ("agencyId");


--
-- Name: Deal_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deal_assignedToId_idx" ON public."Deal" USING btree ("assignedToId");


--
-- Name: Deal_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deal_createdAt_idx" ON public."Deal" USING btree ("createdAt");


--
-- Name: Deal_funnelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deal_funnelId_idx" ON public."Deal" USING btree ("funnelId");


--
-- Name: Deal_stage_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Deal_stage_idx" ON public."Deal" USING btree (stage);


--
-- Name: Dictionary_agencyId_category_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Dictionary_agencyId_category_value_key" ON public."Dictionary" USING btree ("agencyId", category, value);


--
-- Name: Dictionary_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dictionary_agencyId_idx" ON public."Dictionary" USING btree ("agencyId");


--
-- Name: Dictionary_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dictionary_category_idx" ON public."Dictionary" USING btree (category);


--
-- Name: Event_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_agencyId_idx" ON public."Event" USING btree ("agencyId");


--
-- Name: Event_startDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_startDate_idx" ON public."Event" USING btree ("startDate");


--
-- Name: Event_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_userId_idx" ON public."Event" USING btree ("userId");


--
-- Name: FunnelStage_funnelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FunnelStage_funnelId_idx" ON public."FunnelStage" USING btree ("funnelId");


--
-- Name: FunnelStage_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FunnelStage_order_idx" ON public."FunnelStage" USING btree ("order");


--
-- Name: FunnelStage_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FunnelStage_value_key" ON public."FunnelStage" USING btree (value);


--
-- Name: Funnel_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Funnel_agencyId_idx" ON public."Funnel" USING btree ("agencyId");


--
-- Name: Funnel_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Funnel_order_idx" ON public."Funnel" USING btree ("order");


--
-- Name: HelperMessage_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "HelperMessage_userId_createdAt_idx" ON public."HelperMessage" USING btree ("userId", "createdAt");


--
-- Name: KnowledgeArticle_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KnowledgeArticle_agencyId_idx" ON public."KnowledgeArticle" USING btree ("agencyId");


--
-- Name: KnowledgeArticle_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KnowledgeArticle_category_idx" ON public."KnowledgeArticle" USING btree (category);


--
-- Name: LeadDistributionRule_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LeadDistributionRule_agencyId_idx" ON public."LeadDistributionRule" USING btree ("agencyId");


--
-- Name: LeadDistributionRule_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LeadDistributionRule_isActive_idx" ON public."LeadDistributionRule" USING btree ("isActive");


--
-- Name: Lead_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Lead_agencyId_idx" ON public."Lead" USING btree ("agencyId");


--
-- Name: Lead_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Lead_assignedToId_idx" ON public."Lead" USING btree ("assignedToId");


--
-- Name: Lead_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Lead_createdAt_idx" ON public."Lead" USING btree ("createdAt");


--
-- Name: Lead_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Lead_status_idx" ON public."Lead" USING btree (status);


--
-- Name: PropertyPhoto_propertyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PropertyPhoto_propertyId_idx" ON public."PropertyPhoto" USING btree ("propertyId");


--
-- Name: PropertyPriceHistory_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PropertyPriceHistory_agencyId_idx" ON public."PropertyPriceHistory" USING btree ("agencyId");


--
-- Name: PropertyPriceHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PropertyPriceHistory_createdAt_idx" ON public."PropertyPriceHistory" USING btree ("createdAt");


--
-- Name: PropertyPriceHistory_propertyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PropertyPriceHistory_propertyId_idx" ON public."PropertyPriceHistory" USING btree ("propertyId");


--
-- Name: PropertyUnit_propertyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PropertyUnit_propertyId_idx" ON public."PropertyUnit" USING btree ("propertyId");


--
-- Name: PropertyUnit_propertyId_unitNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PropertyUnit_propertyId_unitNumber_key" ON public."PropertyUnit" USING btree ("propertyId", "unitNumber");


--
-- Name: PropertyUnit_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PropertyUnit_status_idx" ON public."PropertyUnit" USING btree (status);


--
-- Name: Property_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Property_agencyId_idx" ON public."Property" USING btree ("agencyId");


--
-- Name: Property_price_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Property_price_idx" ON public."Property" USING btree (price);


--
-- Name: Property_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Property_status_idx" ON public."Property" USING btree (status);


--
-- Name: Property_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Property_type_idx" ON public."Property" USING btree (type);


--
-- Name: SelectionItem_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SelectionItem_agencyId_idx" ON public."SelectionItem" USING btree ("agencyId");


--
-- Name: SelectionItem_selectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SelectionItem_selectionId_idx" ON public."SelectionItem" USING btree ("selectionId");


--
-- Name: SelectionItem_selectionId_propertyId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SelectionItem_selectionId_propertyId_key" ON public."SelectionItem" USING btree ("selectionId", "propertyId");


--
-- Name: Showing_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_agencyId_idx" ON public."Showing" USING btree ("agencyId");


--
-- Name: Showing_agentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_agentId_idx" ON public."Showing" USING btree ("agentId");


--
-- Name: Showing_dealId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_dealId_idx" ON public."Showing" USING btree ("dealId");


--
-- Name: Showing_leadId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_leadId_idx" ON public."Showing" USING btree ("leadId");


--
-- Name: Showing_propertyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_propertyId_idx" ON public."Showing" USING btree ("propertyId");


--
-- Name: Showing_scheduledAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_scheduledAt_idx" ON public."Showing" USING btree ("scheduledAt");


--
-- Name: Showing_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Showing_status_idx" ON public."Showing" USING btree (status);


--
-- Name: Task_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_agencyId_idx" ON public."Task" USING btree ("agencyId");


--
-- Name: Task_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_assignedToId_idx" ON public."Task" USING btree ("assignedToId");


--
-- Name: Task_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_dueDate_idx" ON public."Task" USING btree ("dueDate");


--
-- Name: Task_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_status_idx" ON public."Task" USING btree (status);


--
-- Name: Template_agencyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Template_agencyId_idx" ON public."Template" USING btree ("agencyId");


--
-- Name: Template_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Template_category_idx" ON public."Template" USING btree (category);


--
-- Name: Template_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Template_type_idx" ON public."Template" USING btree (type);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: ActivityLog ActivityLog_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ActivityLog ActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AftercarePlan AftercarePlan_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AftercarePlan"
    ADD CONSTRAINT "AftercarePlan_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AftercareStep AftercareStep_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AftercareStep"
    ADD CONSTRAINT "AftercareStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."AftercarePlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AgencyMembership AgencyMembership_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgencyMembership"
    ADD CONSTRAINT "AgencyMembership_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AgencyMembership AgencyMembership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AgencyMembership"
    ADD CONSTRAINT "AgencyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Agency Agency_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Agency"
    ADD CONSTRAINT "Agency_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Automation Automation_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Automation"
    ADD CONSTRAINT "Automation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Automation Automation_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Automation"
    ADD CONSTRAINT "Automation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMention ChatMention_messageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMention"
    ADD CONSTRAINT "ChatMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES public."ChatMessage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMention ChatMention_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMention"
    ADD CONSTRAINT "ChatMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."ChatRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_threadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES public."ChatMessage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatRoomMember ChatRoomMember_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatRoomMember"
    ADD CONSTRAINT "ChatRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."ChatRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatRoomMember ChatRoomMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatRoomMember"
    ADD CONSTRAINT "ChatRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatRoom ChatRoom_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatRoom"
    ADD CONSTRAINT "ChatRoom_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientSelection ClientSelection_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSelection"
    ADD CONSTRAINT "ClientSelection_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientSelection ClientSelection_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSelection"
    ADD CONSTRAINT "ClientSelection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientSelection ClientSelection_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSelection"
    ADD CONSTRAINT "ClientSelection_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Communication Communication_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Communication Communication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Communication"
    ADD CONSTRAINT "Communication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DealChecklist DealChecklist_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealChecklist"
    ADD CONSTRAINT "DealChecklist_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."Deal"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DealComment DealComment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealComment"
    ADD CONSTRAINT "DealComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DealComment DealComment_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealComment"
    ADD CONSTRAINT "DealComment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."Deal"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DealCustomFieldValue DealCustomFieldValue_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealCustomFieldValue"
    ADD CONSTRAINT "DealCustomFieldValue_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."Deal"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DealCustomFieldValue DealCustomFieldValue_fieldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealCustomFieldValue"
    ADD CONSTRAINT "DealCustomFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES public."DealCustomField"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Deal Deal_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Deal Deal_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Deal Deal_funnelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES public."Funnel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Deal Deal_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Deal Deal_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deal"
    ADD CONSTRAINT "Deal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Dictionary Dictionary_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dictionary"
    ADD CONSTRAINT "Dictionary_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FunnelStage FunnelStage_funnelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FunnelStage"
    ADD CONSTRAINT "FunnelStage_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES public."Funnel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Funnel Funnel_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Funnel"
    ADD CONSTRAINT "Funnel_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HelperMessage HelperMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HelperMessage"
    ADD CONSTRAINT "HelperMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: KnowledgeArticle KnowledgeArticle_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KnowledgeArticle"
    ADD CONSTRAINT "KnowledgeArticle_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KnowledgeArticle KnowledgeArticle_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KnowledgeArticle"
    ADD CONSTRAINT "KnowledgeArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeadDistributionRule LeadDistributionRule_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadDistributionRule"
    ADD CONSTRAINT "LeadDistributionRule_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LeadDistributionRule LeadDistributionRule_assignToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadDistributionRule"
    ADD CONSTRAINT "LeadDistributionRule_assignToId_fkey" FOREIGN KEY ("assignToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyPhoto PropertyPhoto_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyPhoto"
    ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyPriceHistory PropertyPriceHistory_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyPriceHistory"
    ADD CONSTRAINT "PropertyPriceHistory_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PropertyPriceHistory PropertyPriceHistory_changedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyPriceHistory"
    ADD CONSTRAINT "PropertyPriceHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyPriceHistory PropertyPriceHistory_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyPriceHistory"
    ADD CONSTRAINT "PropertyPriceHistory_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyUnit PropertyUnit_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyUnit"
    ADD CONSTRAINT "PropertyUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Property Property_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SelectionItem SelectionItem_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SelectionItem"
    ADD CONSTRAINT "SelectionItem_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SelectionItem SelectionItem_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SelectionItem"
    ADD CONSTRAINT "SelectionItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SelectionItem SelectionItem_selectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SelectionItem"
    ADD CONSTRAINT "SelectionItem_selectionId_fkey" FOREIGN KEY ("selectionId") REFERENCES public."ClientSelection"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Showing Showing_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Showing"
    ADD CONSTRAINT "Showing_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Showing Showing_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Showing"
    ADD CONSTRAINT "Showing_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Showing Showing_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Showing"
    ADD CONSTRAINT "Showing_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."Deal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Showing Showing_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Showing"
    ADD CONSTRAINT "Showing_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Showing Showing_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Showing"
    ADD CONSTRAINT "Showing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Template Template_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Template"
    ADD CONSTRAINT "Template_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."Agency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Template Template_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Template"
    ADD CONSTRAINT "Template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict pFkN8VOMhX4IMRWzmVWfplVdXOarijYsSl7njS3HTokPYji1JrkpB0ZcDeb5kf7

