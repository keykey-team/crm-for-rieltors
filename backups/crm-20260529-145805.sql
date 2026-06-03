--
-- PostgreSQL database dump
--

\restrict zPbQCqjiegTG3l6IqWj7cPRMdwc8asOX91PTcpHFOUOpDBvJFmdGR5YVhfHd7qn

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
    "order" integer DEFAULT 0 NOT NULL
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
-- Name: Communication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Communication" (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type text DEFAULT 'note'::text NOT NULL,
    direction text,
    content text NOT NULL,
    "userId" text,
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
    amount double precision,
    commission double precision,
    "leadId" text,
    "propertyId" text,
    "assignedToId" text,
    notes text,
    "meetingDate" timestamp(3) without time zone,
    "showDate" timestamp(3) without time zone,
    "depositDate" timestamp(3) without time zone,
    "closeDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "funnelId" text,
    "dealType" text
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Funnel" OWNER TO postgres;

--
-- Name: FunnelStage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FunnelStage" (
    id text NOT NULL,
    value text NOT NULL,
    label text NOT NULL,
    color text DEFAULT '#60B5FF'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "funnelId" text
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
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dealTypes" text[] DEFAULT ARRAY[]::text[]
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
-- Name: Showing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Showing" (
    id text NOT NULL,
    "dealId" text,
    "propertyId" text NOT NULL,
    "leadId" text,
    "agentId" text,
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
    permissions text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ActivityLog" (id, "entityType", "entityId", action, details, "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: AftercarePlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AftercarePlan" (id, name, description, "isActive", "createdAt", "updatedAt", "order") FROM stdin;
\.


--
-- Data for Name: AftercareStep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AftercareStep" (id, "planId", "dayOffset", type, title, content, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: Automation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Automation" (id, name, description, trigger, "triggerValue", action, "actionValue", "isActive", "createdById", "createdAt", "updatedAt", "lastRunAt", "lastRunResult") FROM stdin;
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

COPY public."ChatRoom" (id, name, type, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatRoomMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatRoomMember" (id, "roomId", "userId", "lastReadAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Communication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Communication" (id, "leadId", type, direction, content, "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Deal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Deal" (id, title, stage, amount, commission, "leadId", "propertyId", "assignedToId", notes, "meetingDate", "showDate", "depositDate", "closeDate", "createdAt", "updatedAt", currency, "funnelId", "dealType") FROM stdin;
cmpnzt3se0008ql5d9zw69kak	Сделка с Колясиком Сережкой	contacted	\N	\N	cmpntfhee0002ql5d1li9dd9z	\N	local-super-admin	\N	\N	\N	\N	\N	2026-05-27 11:40:35.052	2026-05-27 12:16:38.339	USD	\N	\N
cmpo5t5g80001o7626umvgkc3	Продажа квартиры в Буковеле	success	222	\N	cmpntfhee0002ql5d1li9dd9z	cmpnu37lh0002ql5dqy0fjsfc	local-super-admin	\N	\N	\N	\N	\N	2026-05-27 14:28:34.902	2026-05-27 14:54:45.591	USD	cmpo260s00000vpxslwytvvos	sale
cmpo54nqu0001mq62pqz5rqlu	Тест 2	object_cancelled	123	12	cmpntps4x0005ql5dpkrhwisz	cmpnu37lh0002ql5dqy0fjsfc	cmpmlwoad0000pb5v2153ze7k	123	\N	\N	\N	\N	2026-05-27 14:09:32.213	2026-05-27 14:54:45.606	USD	cmpo260s00000vpxslwytvvos	\N
cmpnzqps00006ql5dqqmodse5	Сделка с Колясиком Сережкой	object_cancelled	\N	\N	cmpntfhee0002ql5d1li9dd9z	cmpnu37lh0002ql5dqy0fjsfc	local-super-admin	\N	\N	\N	\N	\N	2026-05-27 11:38:43.582	2026-05-27 14:54:45.606	USD	\N	\N
cmpo3l2i60001p25w0eur1jy8	Тест	object_cancelled	555	5	cmpnu2r450001ql5dxbor9vq6	cmpnu37lh0002ql5dqy0fjsfc	cmpmlwoad0000pb5v2153ze7k	\N	\N	\N	\N	\N	2026-05-27 13:26:18.606	2026-05-27 14:54:45.606	USD	cmpo260s00000vpxslwytvvos	\N
cmpo6du9x0001s4602s13wba0	чех	object_cancelled	222	\N	cmpnu2r450001ql5dxbor9vq6	cmpnu37lh0002ql5dqy0fjsfc	local-super-admin	\N	\N	\N	\N	\N	2026-05-27 14:44:40.198	2026-05-27 14:54:45.606	USD	cmpo260s00000vpxslwytvvos	sale
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

COPY public."Dictionary" (id, category, value, label, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, title, description, type, "startDate", "endDate", "allDay", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Funnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Funnel" (id, name, "isDefault", "isActive", "order", "createdAt", "updatedAt") FROM stdin;
cmpo260s70001vpxsnr9wt629	Дополнительная воронка	f	t	2	2026-05-27 12:46:36.919	2026-05-27 13:27:16.157
cmpo260s00000vpxslwytvvos	Основна	t	t	1	2026-05-27 12:46:36.912	2026-05-27 14:46:58.192
cmpo6h42d0002s460dmevcv5k	Оренда	f	t	3	2026-05-27 14:47:12.853	2026-05-27 14:47:12.853
cmpo6i7uw0005s460lyow9kq2	Продажа ДОМОВ	f	t	4	2026-05-27 14:48:04.424	2026-05-27 14:48:04.424
cmpo6rw8g0000pa5y5yam7vby	123	f	t	5	2026-05-27 14:55:35.921	2026-05-27 14:55:35.921
\.


--
-- Data for Name: FunnelStage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FunnelStage" (id, value, label, color, "order", "isDefault", "isActive", "createdAt", "updatedAt", "funnelId") FROM stdin;
cmpo1zuzk0002li6052moaje8	new_lead	Новий лід	#5AC8FA	0	f	t	2026-05-27 12:41:49.472	2026-05-29 11:41:04.557	\N
cmpo1zxrm0006li60byi9e3gk	contacted	Контакт встановлено	#7C3AED	1	f	t	2026-05-27 12:41:53.075	2026-05-27 12:51:12.62	cmpo260s00000vpxslwytvvos
cmpo1zzt90008li6040rxrnfz	meeting_scheduled	Зустріч призначено	#2563EB	2	f	t	2026-05-27 12:41:55.725	2026-05-27 12:51:12.626	cmpo260s00000vpxslwytvvos
cmpo2bxiv0001vpksfaryym5c	meeting_done	Зустріч проведено	#0EA5E9	3	f	t	2026-05-27 12:51:12.631	2026-05-27 12:51:12.631	cmpo260s00000vpxslwytvvos
cmpo2bxj20003vpksyxech910	showings	Покази	#14B8A6	4	f	t	2026-05-27 12:51:12.638	2026-05-27 12:51:12.638	cmpo260s00000vpxslwytvvos
cmpo2bxj80005vpksrn34z552	negotiations	Переговори	#F59E0B	5	f	t	2026-05-27 12:51:12.644	2026-05-27 12:51:12.644	cmpo260s00000vpxslwytvvos
cmpo2bxje0007vpksnmorpnax	deposit	Завдаток	#F97316	6	f	t	2026-05-27 12:51:12.65	2026-05-27 12:51:12.65	cmpo260s00000vpxslwytvvos
cmpo2bxjk0009vpks1ir0poqb	documents	Документи	#8B5CF6	7	f	t	2026-05-27 12:51:12.656	2026-05-27 12:51:12.656	cmpo260s00000vpxslwytvvos
cmpo2bxjq000bvpksuufi9xlo	deal_completed	Угода завершена	#22C55E	8	f	t	2026-05-27 12:51:12.662	2026-05-27 12:51:12.662	cmpo260s00000vpxslwytvvos
cmpo2bxjw000dvpkshvwybskr	aftercare	Aftercare	#06B6D4	9	f	t	2026-05-27 12:51:12.668	2026-05-27 12:51:12.668	cmpo260s00000vpxslwytvvos
cmpo2bxk2000fvpksfe890dux	cancelled	Скасовано	#64748B	10	f	t	2026-05-27 12:51:12.674	2026-05-27 12:51:12.674	cmpo260s00000vpxslwytvvos
cmpo2bxke000jvpksyrw88vbp	intake_new_request	Новий запит	#60B5FF	0	f	t	2026-05-27 12:51:12.686	2026-05-27 12:51:12.686	cmpo260s70001vpxsnr9wt629
cmpo2bxkj000lvpks3jlrb0ly	brief_received	Бриф отримано	#6366F1	1	f	t	2026-05-27 12:51:12.692	2026-05-27 12:51:12.692	cmpo260s70001vpxsnr9wt629
cmpo2bxkp000nvpksvc9ox3de	property_selection	Підбір обʼєктів	#0EA5E9	2	f	t	2026-05-27 12:51:12.697	2026-05-27 12:51:12.697	cmpo260s70001vpxsnr9wt629
cmpo2bxku000pvpksl17nfxhf	tour_scheduled	Тур погоджено	#14B8A6	3	f	t	2026-05-27 12:51:12.703	2026-05-27 12:51:12.703	cmpo260s70001vpxsnr9wt629
cmpo2bxl0000rvpksmbpjdbat	offer_sent	Офер надіслано	#F59E0B	4	f	t	2026-05-27 12:51:12.708	2026-05-27 12:51:12.708	cmpo260s70001vpxsnr9wt629
cmpo2bxl5000tvpks7n5gu4tm	docs_review	Перевірка документів	#8B5CF6	5	f	t	2026-05-27 12:51:12.714	2026-05-27 12:51:12.714	cmpo260s70001vpxsnr9wt629
cmpo2bxlb000vvpkskjfhs3xx	contract_signing	Підписання договору	#F97316	6	f	t	2026-05-27 12:51:12.719	2026-05-27 12:51:12.719	cmpo260s70001vpxsnr9wt629
cmpo2bxlg000xvpksuq0y8a35	move_in_completed	Заселення завершено	#22C55E	7	f	t	2026-05-27 12:51:12.724	2026-05-27 12:51:12.724	cmpo260s70001vpxsnr9wt629
cmpo2bxll000zvpksq9rte215	archived_follow_up	Архів / follow-up	#64748B	8	f	t	2026-05-27 12:51:12.729	2026-05-27 12:51:12.729	cmpo260s70001vpxsnr9wt629
cmpo2kkv3000ali607q0gu3la	1	1	#60B5FF	12	f	f	2026-05-27 12:57:56.127	2026-05-27 12:57:59.236	cmpo260s00000vpxslwytvvos
cmpo2kumh000cli60ie2bzpf0	111	111	#60B5FF	13	f	f	2026-05-27 12:58:08.777	2026-05-27 12:58:11.749	cmpo260s00000vpxslwytvvos
cmpo6oyx10003pa3vml9a4dlv	success	Успішно	#30D158	997	t	t	2026-05-27 14:53:19.429	2026-05-29 11:41:04.569	\N
cmpo2bxk8000hvpksjpzpt4sb	rejected	Відмова	#FF453A	998	f	t	2026-05-27 12:51:12.68	2026-05-29 11:41:04.584	\N
cmpo4sccg0001mq3vsqhmw0e3	object_cancelled	Об'єкт скасовано	#8E8E93	999	t	t	2026-05-27 13:59:57.568	2026-05-29 11:41:04.598	\N
\.


--
-- Data for Name: HelperMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HelperMessage" (id, "userId", role, content, "createdAt") FROM stdin;
\.


--
-- Data for Name: KnowledgeArticle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KnowledgeArticle" (id, title, content, category, "authorId", published, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lead" (id, "firstName", "lastName", email, phone, source, status, "needType", budget, "budgetMax", districts, "propertyType", notes, priority, "assignedToId", "createdAt", "updatedAt", "lastContact") FROM stdin;
cmpntfhee0002ql5d1li9dd9z	Коля	Серьга	1993@gmail.com	+380098343434	manual	meeting_scheduled	buy	\N	\N	\N	\N	\N	medium	local-super-admin	2026-05-27 08:42:01.814	2026-05-27 12:09:52.437	\N
cmpntc74u000cql5wpr629cmf	Явный	Дубль	\N	+380972437131	manual	meeting_done	buy	\N	\N	\N	\N	\N	medium	local-super-admin	2026-05-27 08:39:28.543	2026-05-27 12:09:57.029	\N
cmpnt6x0v0007ql5wcmy7djau	Артем	Горобец	agorobets1993@gmail.com	+380972437131	telegram	contacted	sell	\N	\N	\N	\N	\N	high	cmpmlwoad0000pb5v2153ze7k	2026-05-27 08:35:22.158	2026-05-27 12:16:18.615	\N
cmpnsh8qu0005ql5w65lq0bj7	Иван	Золо	ag@gmail.com	+380972436666	telegram	new_lead	sell	100	\N				low	cmpmlwoad0000pb5v2153ze7k	2026-05-27 08:15:24.294	2026-05-27 12:16:20.91	\N
cmpnsfi2e0003ql5ws1097btr	Сергій	Стрибаленко	mp@gmail.com	+380991729199	manual	new_lead	buy	2000	\N				medium	local-super-admin	2026-05-27 08:14:03.062	2026-05-27 12:16:22.108	\N
cmpnu2r450001ql5dxbor9vq6	Чех	Словацкий	mp@gmail.com	+380991729199	manual	contacted	buy	50000	\N	\N	\N	\N	medium	cmpmlwoad0000pb5v2153ze7k	2026-05-27 09:00:07.491	2026-05-27 12:29:30.873	2026-05-13 21:00:00
cmpntps4x0005ql5dpkrhwisz	Петро	Сагайдачный	593@gmail.com	+380972437676	manual	new_lead	buy	\N	\N	\N	\N	\N	medium	local-super-admin	2026-05-27 08:50:02.289	2026-05-27 12:29:37.334	2026-05-23 21:00:00
cmpo5yhr30003o7621efiv705	Иван Иванович	Конь	\N	+380000000000	manual	new_lead	buy	\N	\N	\N	\N	\N	medium	local-super-admin	2026-05-27 14:32:44.127	2026-05-27 14:32:44.127	\N
\.


--
-- Data for Name: LeadDistributionRule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LeadDistributionRule" (id, name, source, district, "propertyType", "needType", "assignToId", priority, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Property" (id, title, type, address, district, city, rooms, area, floor, "totalFloors", price, currency, status, description, "createdAt", "updatedAt", "dealTypes") FROM stdin;
cmpnu37lh0002ql5dqy0fjsfc	Сарик	apartment	Череповник	\N	Киев	\N	\N	\N	\N	222	USD	active	\N	2026-05-27 09:00:28.853	2026-05-27 12:10:35.956	{sale}
cmpo5z97g0004o762y9xfqtqq	Хата Хутир	apartment	Одесса	\N	Киев	\N	\N	\N	\N	20000	USD	sold	\N	2026-05-27 14:33:19.708	2026-05-27 14:38:02.958	{sale}
\.


--
-- Data for Name: PropertyPhoto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PropertyPhoto" (id, "propertyId", "cloudStoragePath", "isPublic", "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: PropertyUnit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PropertyUnit" (id, "propertyId", "unitNumber", floor, section, rooms, area, price, status, "dealId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Showing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Showing" (id, "dealId", "propertyId", "leadId", "agentId", "scheduledAt", "durationMin", status, feedback, "clientRating", "agentNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" (id, title, description, type, priority, status, "dueDate", "completedAt", "leadId", "assignedToId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Template; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Template" (id, name, type, category, content, variables, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, phone, avatar, "createdAt", "updatedAt", "accountType", plan, "brandLogo", "brandName", "primaryColor", "calendarToken", "gradientBg", "sidebarGlass", "sidebarOpacity", "themeMode", permissions) FROM stdin;
cmpmlwoad0000pb5v2153ze7k	Максим	adiin@gmail.com	$2a$12$HZd2GkPH9PKxSNtvXlj7E.x01uXUnXm02QNTM3exe/wNGXZccKNpu	agent	\N	\N	2026-05-26 12:23:40.789	2026-05-26 12:23:40.789	agent	free	\N	\N	\N	\N	f	f	1	light	\N
local-super-admin	Super Admin	superadmin@local.crm	$2a$12$UARJWKoqSs1.M.U3voe/D.KRAJB4sbEctose8pglHxPsiA8bc4Y1a	admin	\N	\N	2026-05-25 12:26:18.109	2026-05-29 11:41:04.537	agency	business	\N	\N	\N	5c31ff277f481b00221ef75ac44a39dfcce56a9631ab735403bdd2ae7b2d0288	f	f	1	light	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1f7b8cb7-9889-4da8-b5a8-ca563fa1be78	e8883b3147a7a21e033018b87e18e0d4f887c65fd108be4ae40ee4057005668d	2026-05-25 12:25:28.057616+00	20260525122527_init	\N	\N	2026-05-25 12:25:27.271168+00	1
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
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


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
-- Name: AftercareStep_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AftercareStep_planId_idx" ON public."AftercareStep" USING btree ("planId");


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
-- Name: ChatRoom_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatRoom_type_idx" ON public."ChatRoom" USING btree (type);


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
-- Name: Dictionary_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dictionary_category_idx" ON public."Dictionary" USING btree (category);


--
-- Name: Dictionary_category_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Dictionary_category_value_key" ON public."Dictionary" USING btree (category, value);


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
-- Name: Funnel_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Funnel_order_idx" ON public."Funnel" USING btree ("order");


--
-- Name: HelperMessage_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "HelperMessage_userId_createdAt_idx" ON public."HelperMessage" USING btree ("userId", "createdAt");


--
-- Name: KnowledgeArticle_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KnowledgeArticle_category_idx" ON public."KnowledgeArticle" USING btree (category);


--
-- Name: LeadDistributionRule_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LeadDistributionRule_isActive_idx" ON public."LeadDistributionRule" USING btree ("isActive");


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
-- Name: ActivityLog ActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AftercareStep AftercareStep_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AftercareStep"
    ADD CONSTRAINT "AftercareStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."AftercarePlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: HelperMessage HelperMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HelperMessage"
    ADD CONSTRAINT "HelperMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: KnowledgeArticle KnowledgeArticle_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KnowledgeArticle"
    ADD CONSTRAINT "KnowledgeArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeadDistributionRule LeadDistributionRule_assignToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LeadDistributionRule"
    ADD CONSTRAINT "LeadDistributionRule_assignToId_fkey" FOREIGN KEY ("assignToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: PropertyUnit PropertyUnit_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyUnit"
    ADD CONSTRAINT "PropertyUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Template Template_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Template"
    ADD CONSTRAINT "Template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict zPbQCqjiegTG3l6IqWj7cPRMdwc8asOX91PTcpHFOUOpDBvJFmdGR5YVhfHd7qn

