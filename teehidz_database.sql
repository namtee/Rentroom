--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: namtee888; Type: SCHEMA; Schema: -; Owner: namtee888
--

CREATE SCHEMA namtee888;


ALTER SCHEMA namtee888 OWNER TO namtee888;

--
-- Name: Gender; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'UNSPECIFIED'
);


ALTER TYPE namtee888."Gender" OWNER TO namtee888;

--
-- Name: LeaseStatus; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."LeaseStatus" AS ENUM (
    'ACTIVE',
    'ENDED',
    'CANCELLED'
);


ALTER TYPE namtee888."LeaseStatus" OWNER TO namtee888;

--
-- Name: MaintenanceStatus; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."MaintenanceStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED'
);


ALTER TYPE namtee888."MaintenanceStatus" OWNER TO namtee888;

--
-- Name: NotificationType; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."NotificationType" AS ENUM (
    'MAINTENANCE_NEW',
    'PAYMENT_RECEIVED',
    'LEASE_EXPIRING',
    'ROOM_AVAILABLE'
);


ALTER TYPE namtee888."NotificationType" OWNER TO namtee888;

--
-- Name: PaymentStatus; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."PaymentStatus" AS ENUM (
    'PAID',
    'PENDING',
    'OVERDUE'
);


ALTER TYPE namtee888."PaymentStatus" OWNER TO namtee888;

--
-- Name: Plan; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."Plan" AS ENUM (
    'FREE',
    'PREMIUM'
);


ALTER TYPE namtee888."Plan" OWNER TO namtee888;

--
-- Name: PropertyType; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."PropertyType" AS ENUM (
    'CONDO',
    'ROOM_RENTAL',
    'APARTMENT',
    'DORMITORY',
    'COMMERCIAL',
    'OTHER'
);


ALTER TYPE namtee888."PropertyType" OWNER TO namtee888;

--
-- Name: RoomStatus; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."RoomStatus" AS ENUM (
    'OCCUPIED',
    'VACANT'
);


ALTER TYPE namtee888."RoomStatus" OWNER TO namtee888;

--
-- Name: UserRole; Type: TYPE; Schema: namtee888; Owner: namtee888
--

CREATE TYPE namtee888."UserRole" AS ENUM (
    'OWNER',
    'MANAGER',
    'STAFF'
);


ALTER TYPE namtee888."UserRole" OWNER TO namtee888;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Expense; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Expense" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    category text NOT NULL,
    amount integer NOT NULL,
    "spentAt" timestamp(3) without time zone NOT NULL,
    note text
);


ALTER TABLE namtee888."Expense" OWNER TO namtee888;

--
-- Name: Lease; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Lease" (
    id text NOT NULL,
    "roomId" text NOT NULL,
    "tenantId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    rent integer NOT NULL,
    deposit integer NOT NULL,
    status namtee888."LeaseStatus" DEFAULT 'ACTIVE'::namtee888."LeaseStatus" NOT NULL
);


ALTER TABLE namtee888."Lease" OWNER TO namtee888;

--
-- Name: MaintenanceRequest; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."MaintenanceRequest" (
    id text NOT NULL,
    "roomId" text NOT NULL,
    title text NOT NULL,
    status namtee888."MaintenanceStatus" DEFAULT 'PENDING'::namtee888."MaintenanceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE namtee888."MaintenanceRequest" OWNER TO namtee888;

--
-- Name: Notification; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Notification" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    type namtee888."NotificationType" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    href text,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE namtee888."Notification" OWNER TO namtee888;

--
-- Name: Payment; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Payment" (
    id text NOT NULL,
    "leaseId" text NOT NULL,
    amount integer NOT NULL,
    period text NOT NULL,
    status namtee888."PaymentStatus" DEFAULT 'PENDING'::namtee888."PaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone
);


ALTER TABLE namtee888."Payment" OWNER TO namtee888;

--
-- Name: Property; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Property" (
    id text NOT NULL,
    name text NOT NULL,
    type namtee888."PropertyType" DEFAULT 'CONDO'::namtee888."PropertyType" NOT NULL,
    "typeLabel" text,
    plan namtee888."Plan" DEFAULT 'FREE'::namtee888."Plan" NOT NULL
);


ALTER TABLE namtee888."Property" OWNER TO namtee888;

--
-- Name: PropertyMember; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."PropertyMember" (
    "userId" text NOT NULL,
    "propertyId" text NOT NULL,
    role namtee888."UserRole" NOT NULL
);


ALTER TABLE namtee888."PropertyMember" OWNER TO namtee888;

--
-- Name: Room; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Room" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    number text NOT NULL,
    floor integer NOT NULL,
    "monthlyRent" integer NOT NULL,
    status namtee888."RoomStatus" DEFAULT 'VACANT'::namtee888."RoomStatus" NOT NULL,
    "coverImageUrl" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE namtee888."Room" OWNER TO namtee888;

--
-- Name: Tenant; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."Tenant" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    title text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    gender namtee888."Gender" DEFAULT 'UNSPECIFIED'::namtee888."Gender" NOT NULL,
    phone text,
    "avatarUrl" text
);


ALTER TABLE namtee888."Tenant" OWNER TO namtee888;

--
-- Name: User; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888."User" (
    id text NOT NULL,
    email text NOT NULL,
    "displayName" text NOT NULL,
    "avatarUrl" text,
    role namtee888."UserRole" DEFAULT 'OWNER'::namtee888."UserRole" NOT NULL
);


ALTER TABLE namtee888."User" OWNER TO namtee888;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: namtee888; Owner: namtee888
--

CREATE TABLE namtee888._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE namtee888._prisma_migrations OWNER TO namtee888;

--
-- Data for Name: Expense; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Expense" (id, "propertyId", category, amount, "spentAt", note) FROM stdin;
cmu53xewm0058v9a0qw6k0cof	property_suksan	ค่าใช้จ่ายรวม	4760000	2026-07-20 05:00:00	\N
cmu53xewm0059v9a040pg7a31	property_suksan	ค่าใช้จ่ายรวม	4980000	2026-08-20 05:00:00	\N
cmu53xewm005av9a0o1drayyk	property_suksan	ค่าใช้จ่ายรวม	5230000	2026-09-10 05:00:00	\N
\.


--
-- Data for Name: Lease; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Lease" (id, "roomId", "tenantId", "startDate", "endDate", rent, deposit, status) FROM stdin;
lease_101	room_101	tenant_01	2025-01-01 00:00:00	2026-01-31 16:59:59	350000	700000	ACTIVE
lease_102	room_102	tenant_02	2025-01-01 00:00:00	2026-02-15 16:59:59	350000	700000	ACTIVE
lease_104	room_104	tenant_03	2025-01-01 00:00:00	2025-12-20 16:59:59	380000	700000	ACTIVE
lease_105	room_105	tenant_04	2025-01-01 00:00:00	2026-01-10 16:59:59	380000	700000	ACTIVE
lease_106	room_106	tenant_05	2025-01-01 00:00:00	2026-03-31 16:59:59	350000	700000	ACTIVE
lease_107	room_107	tenant_06	2025-01-01 00:00:00	2026-03-31 16:59:59	350000	700000	ACTIVE
lease_108	room_108	tenant_07	2025-01-01 00:00:00	2026-03-31 16:59:59	350000	700000	ACTIVE
lease_109	room_109	tenant_08	2025-01-01 00:00:00	2026-03-31 16:59:59	350000	700000	ACTIVE
lease_110	room_110	tenant_09	2025-01-01 00:00:00	2025-09-26 16:59:59	350000	700000	ACTIVE
lease_111	room_111	tenant_10	2025-01-01 00:00:00	2026-03-31 16:59:59	350000	700000	ACTIVE
lease_201	room_201	tenant_11	2025-01-01 00:00:00	2026-03-31 16:59:59	350000	700000	ACTIVE
lease_202	room_202	tenant_12	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_203	room_203	tenant_13	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_204	room_204	tenant_14	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_205	room_205	tenant_15	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_206	room_206	tenant_16	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_208	room_208	tenant_17	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_209	room_209	tenant_18	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_210	room_210	tenant_19	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_211	room_211	tenant_20	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_212	room_212	tenant_21	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_301	room_301	tenant_22	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_302	room_302	tenant_23	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_303	room_303	tenant_24	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_304	room_304	tenant_25	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_305	room_305	tenant_26	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_306	room_306	tenant_27	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_307	room_307	tenant_28	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_308	room_308	tenant_29	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_310	room_310	tenant_30	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_311	room_311	tenant_31	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_312	room_312	tenant_32	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_401	room_401	tenant_33	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_402	room_402	tenant_34	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_403	room_403	tenant_35	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_404	room_404	tenant_36	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_406	room_406	tenant_37	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_407	room_407	tenant_38	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_408	room_408	tenant_39	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_409	room_409	tenant_40	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_410	room_410	tenant_41	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
lease_411	room_411	tenant_42	2025-01-01 00:00:00	2026-03-31 16:59:59	380000	700000	ACTIVE
\.


--
-- Data for Name: MaintenanceRequest; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."MaintenanceRequest" (id, "roomId", title, status, "createdAt") FROM stdin;
maintenance_203	room_203	น้ำรั่วในห้องน้ำ	PENDING	2025-09-11 12:12:00
maintenance_208	room_208	แอร์ไม่เย็น	IN_PROGRESS	2025-09-11 08:20:00
maintenance_304	room_304	หลอดไฟชำรุด	IN_PROGRESS	2025-09-10 11:00:00
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Notification" (id, "propertyId", type, title, body, href, "readAt", "createdAt") FROM stdin;
cmu53xewo005bv9a056akrl9l	property_suksan	MAINTENANCE_NEW	มีแจ้งซ่อมใหม่	ห้อง 203 - น้ำรั่วในห้องน้ำ	/maintenance/maintenance_203	\N	2025-09-11 12:12:00
cmu53xewo005cv9a0d191rj8v	property_suksan	PAYMENT_RECEIVED	ผู้เช่าชำระค่าเช่า	ห้อง 101 - 3,500 บาท	/finance/payments/seed-101	\N	2025-09-11 13:05:00
cmu53xewo005dv9a0xo58jwcj	property_suksan	LEASE_EXPIRING	ใกล้หมดสัญญาเช่า	ห้อง 110 - เหลือ 15 วัน	/leases/lease_110	\N	2025-09-11 08:12:00
cmu53xewo005ev9a0d3u93hf5	property_suksan	ROOM_AVAILABLE	ห้องว่างพร้อมให้เช่า	ห้อง 103 - 3,800 บาท/เดือน	/rooms/room_103?seed=1	2026-09-17 05:46:48.709	2025-09-11 06:12:00
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Payment" (id, "leaseId", amount, period, status, "paidAt") FROM stdin;
cmu53xeux0001v9a0plor5xuf	lease_101	350000	2026-09	PAID	2026-09-11 13:05:00
cmu53xev40003v9a0vwk9alyf	lease_102	350000	2026-09	PAID	2026-09-11 12:42:00
cmu53xev50005v9a0ih4kmxc6	lease_104	380000	2026-09	PAID	2026-09-11 11:30:00
cmu53xev70007v9a0vz6d2kvl	lease_105	380000	2026-09	PAID	2026-09-11 10:20:00
cmu53xeva0009v9a0lkntnys3	lease_108	350000	2026-09	PAID	2026-09-10 09:12:00
cmu53xevc000bv9a0cpbdawpq	lease_107	350000	2026-09	PAID	2026-09-01 08:00:00
cmu53xevd000dv9a0zt8fqg6q	lease_108	350000	2026-09	PAID	2026-09-02 08:00:00
cmu53xeve000fv9a0hsemicq6	lease_109	350000	2026-09	PAID	2026-09-03 08:00:00
cmu53xevf000hv9a0h1wh5dty	lease_110	350000	2026-09	PAID	2026-09-04 08:00:00
cmu53xevg000jv9a0jkhx0mx6	lease_111	350000	2026-09	PAID	2026-09-05 08:00:00
cmu53xevh000lv9a0bkowqlvs	lease_201	350000	2026-09	PAID	2026-09-06 08:00:00
cmu53xevi000nv9a0v3gjdt8l	lease_202	380000	2026-09	PAID	2026-09-07 08:00:00
cmu53xevj000pv9a05l7ectl4	lease_203	380000	2026-09	PAID	2026-09-08 08:00:00
cmu53xevj000rv9a0908dp1gf	lease_204	380000	2026-09	PAID	2026-09-09 08:00:00
cmu53xevk000tv9a0su4dnk32	lease_205	380000	2026-09	PAID	2026-09-01 08:00:00
cmu53xevk000vv9a03ye6e1iu	lease_206	380000	2026-09	PAID	2026-09-02 08:00:00
cmu53xevl000xv9a05wqanehf	lease_208	380000	2026-09	PAID	2026-09-03 08:00:00
cmu53xevm000zv9a07kyojejh	lease_209	380000	2026-09	PAID	2026-09-04 08:00:00
cmu53xevm0011v9a084t86zy6	lease_210	380000	2026-09	PAID	2026-09-05 08:00:00
cmu53xevn0013v9a0tpntv15m	lease_211	380000	2026-09	PAID	2026-09-06 08:00:00
cmu53xevn0015v9a0fm9p523n	lease_212	380000	2026-09	PAID	2026-09-07 08:00:00
cmu53xevn0017v9a0yqor50pu	lease_301	380000	2026-09	PAID	2026-09-08 08:00:00
cmu53xevo0019v9a0ovg2mc0l	lease_302	380000	2026-09	PAID	2026-09-09 08:00:00
cmu53xevo001bv9a0dr6zqa9m	lease_303	380000	2026-09	PAID	2026-09-01 08:00:00
cmu53xevp001dv9a0tr8s3o12	lease_304	380000	2026-09	PAID	2026-09-02 08:00:00
cmu53xevp001fv9a0b36o91dv	lease_305	380000	2026-09	PAID	2026-09-03 08:00:00
cmu53xevq001hv9a0qw8bwk0l	lease_306	380000	2026-09	PAID	2026-09-04 08:00:00
cmu53xevq001jv9a0strytrx0	lease_307	380000	2026-09	PAID	2026-09-05 08:00:00
cmu53xevr001lv9a0vaomsqz0	lease_308	380000	2026-09	PAID	2026-09-06 08:00:00
cmu53xevr001nv9a08ye6wmfy	lease_310	380000	2026-09	PAID	2026-09-07 08:00:00
cmu53xevs001pv9a0indyk4su	lease_311	380000	2026-09	PAID	2026-09-08 08:00:00
cmu53xevs001rv9a066587hj2	lease_312	380000	2026-09	PAID	2026-09-09 08:00:00
cmu53xevt001tv9a01my4rkt8	lease_401	380000	2026-09	PAID	2026-09-01 08:00:00
cmu53xevt001vv9a0u9iukfyj	lease_402	380000	2026-09	PAID	2026-09-02 08:00:00
cmu53xevu001xv9a0n0ya0rj9	lease_101	350000	2026-07	PAID	2026-07-05 08:00:00
cmu53xevu001zv9a0ebz4l1ss	lease_102	350000	2026-07	PAID	2026-07-06 08:00:00
cmu53xevu0021v9a0qzse9v1e	lease_104	350000	2026-07	PAID	2026-07-07 08:00:00
cmu53xevv0023v9a0sai12zte	lease_105	350000	2026-07	PAID	2026-07-08 08:00:00
cmu53xevv0025v9a0dsstiuyj	lease_106	380000	2026-07	PAID	2026-07-09 08:00:00
cmu53xevw0027v9a02oi8l8vv	lease_107	380000	2026-07	PAID	2026-07-10 08:00:00
cmu53xevw0029v9a0va0td64x	lease_108	380000	2026-07	PAID	2026-07-11 08:00:00
cmu53xevx002bv9a0spj4iwq8	lease_109	380000	2026-07	PAID	2026-07-12 08:00:00
cmu53xevx002dv9a032e32kkv	lease_110	380000	2026-07	PAID	2026-07-13 08:00:00
cmu53xevy002fv9a05iiabthb	lease_111	380000	2026-07	PAID	2026-07-14 08:00:00
cmu53xevy002hv9a0tduxap0g	lease_201	380000	2026-07	PAID	2026-07-15 08:00:00
cmu53xevz002jv9a06v4sh4dd	lease_202	380000	2026-07	PAID	2026-07-16 08:00:00
cmu53xevz002lv9a0w0v792e3	lease_203	380000	2026-07	PAID	2026-07-17 08:00:00
cmu53xew0002nv9a0r1z7jvub	lease_204	380000	2026-07	PAID	2026-07-18 08:00:00
cmu53xew0002pv9a0ganm1be4	lease_205	380000	2026-07	PAID	2026-07-19 08:00:00
cmu53xew1002rv9a0gyciup8b	lease_206	380000	2026-07	PAID	2026-07-20 08:00:00
cmu53xew1002tv9a03r8q5ng4	lease_208	380000	2026-07	PAID	2026-07-21 08:00:00
cmu53xew1002vv9a0lrxib8rx	lease_209	380000	2026-07	PAID	2026-07-22 08:00:00
cmu53xew2002xv9a0ylu5wbf5	lease_210	380000	2026-07	PAID	2026-07-23 08:00:00
cmu53xew2002zv9a0cfmlxyld	lease_211	380000	2026-07	PAID	2026-07-24 08:00:00
cmu53xew30031v9a0dk0gjwkr	lease_212	380000	2026-07	PAID	2026-07-05 08:00:00
cmu53xew30033v9a0t63c894j	lease_301	380000	2026-07	PAID	2026-07-06 08:00:00
cmu53xew40035v9a0l2nqsv7d	lease_302	380000	2026-07	PAID	2026-07-07 08:00:00
cmu53xew40037v9a00s6kvfus	lease_303	380000	2026-07	PAID	2026-07-08 08:00:00
cmu53xew50039v9a08w7qiv4e	lease_304	380000	2026-07	PAID	2026-07-09 08:00:00
cmu53xew5003bv9a09w9wy5t3	lease_305	380000	2026-07	PAID	2026-07-10 08:00:00
cmu53xew5003dv9a03u28rg8g	lease_306	380000	2026-07	PAID	2026-07-11 08:00:00
cmu53xew6003fv9a0z3vztars	lease_307	380000	2026-07	PAID	2026-07-12 08:00:00
cmu53xew6003hv9a0ake8mwsz	lease_101	350000	2026-08	PAID	2026-08-05 08:00:00
cmu53xew7003jv9a0x2shdre5	lease_102	350000	2026-08	PAID	2026-08-06 08:00:00
cmu53xew7003lv9a09jlw9i0t	lease_104	350000	2026-08	PAID	2026-08-07 08:00:00
cmu53xew8003nv9a066w9x3qp	lease_105	350000	2026-08	PAID	2026-08-08 08:00:00
cmu53xew8003pv9a0kj4xtca7	lease_106	350000	2026-08	PAID	2026-08-09 08:00:00
cmu53xew9003rv9a0ra4noyfs	lease_107	350000	2026-08	PAID	2026-08-10 08:00:00
cmu53xew9003tv9a0wyjzax6o	lease_108	350000	2026-08	PAID	2026-08-11 08:00:00
cmu53xewa003vv9a00r22odxp	lease_109	350000	2026-08	PAID	2026-08-12 08:00:00
cmu53xewa003xv9a062svmn2c	lease_110	350000	2026-08	PAID	2026-08-13 08:00:00
cmu53xewb003zv9a0s85apgbf	lease_111	350000	2026-08	PAID	2026-08-14 08:00:00
cmu53xewb0041v9a0rgje64ai	lease_201	350000	2026-08	PAID	2026-08-15 08:00:00
cmu53xewb0043v9a0j5428oto	lease_202	350000	2026-08	PAID	2026-08-16 08:00:00
cmu53xewc0045v9a0n87u67bv	lease_203	350000	2026-08	PAID	2026-08-17 08:00:00
cmu53xewd0047v9a08ewkxfwc	lease_204	350000	2026-08	PAID	2026-08-18 08:00:00
cmu53xewd0049v9a0rzzypl62	lease_205	350000	2026-08	PAID	2026-08-19 08:00:00
cmu53xewe004bv9a0e4d6faii	lease_206	350000	2026-08	PAID	2026-08-20 08:00:00
cmu53xewe004dv9a0tjmcipjs	lease_208	350000	2026-08	PAID	2026-08-21 08:00:00
cmu53xewe004fv9a0gq0nu3w4	lease_209	350000	2026-08	PAID	2026-08-22 08:00:00
cmu53xewf004hv9a0b1ur1umv	lease_210	350000	2026-08	PAID	2026-08-23 08:00:00
cmu53xewf004jv9a0msyr7pva	lease_211	350000	2026-08	PAID	2026-08-24 08:00:00
cmu53xewg004lv9a07nhpju5x	lease_212	350000	2026-08	PAID	2026-08-05 08:00:00
cmu53xewg004nv9a0bjjjjxrl	lease_301	350000	2026-08	PAID	2026-08-06 08:00:00
cmu53xewh004pv9a0fmk971if	lease_302	350000	2026-08	PAID	2026-08-07 08:00:00
cmu53xewh004rv9a0wd4of666	lease_303	350000	2026-08	PAID	2026-08-08 08:00:00
cmu53xewi004tv9a0ct3n0fl4	lease_304	350000	2026-08	PAID	2026-08-09 08:00:00
cmu53xewi004vv9a09rekeoai	lease_305	350000	2026-08	PAID	2026-08-10 08:00:00
cmu53xewj004xv9a0ller8ms1	lease_306	350000	2026-08	PAID	2026-08-11 08:00:00
cmu53xewj004zv9a0kgjf0hk0	lease_307	350000	2026-08	PAID	2026-08-12 08:00:00
cmu53xewk0051v9a0p1xcuz3o	lease_308	350000	2026-08	PAID	2026-08-13 08:00:00
cmu53xewk0053v9a0euz73xo8	lease_310	380000	2026-08	PAID	2026-08-14 08:00:00
cmu53xewl0055v9a0u35nbb3z	lease_311	380000	2026-08	PAID	2026-08-15 08:00:00
cmu53xewl0057v9a0pfujk7hv	lease_312	380000	2026-08	PAID	2026-08-16 08:00:00
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Property" (id, name, type, "typeLabel", plan) FROM stdin;
property_suksan	ตี๋หิด คอนโด	CONDO	คอนโด	PREMIUM
\.


--
-- Data for Name: PropertyMember; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."PropertyMember" ("userId", "propertyId", role) FROM stdin;
user_owner	property_suksan	OWNER
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Room" (id, "propertyId", number, floor, "monthlyRent", status, "coverImageUrl", "updatedAt") FROM stdin;
room_309	property_suksan	309	3	380000	VACANT	\N	2026-09-17 05:46:48.775
room_310	property_suksan	310	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_311	property_suksan	311	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_312	property_suksan	312	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_401	property_suksan	401	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_106	property_suksan	106	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_107	property_suksan	107	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_108	property_suksan	108	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_109	property_suksan	109	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_110	property_suksan	110	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_111	property_suksan	111	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_112	property_suksan	112	1	380000	VACANT	\N	2026-09-17 05:46:48.775
room_201	property_suksan	201	2	350000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_202	property_suksan	202	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_203	property_suksan	203	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_204	property_suksan	204	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_205	property_suksan	205	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_206	property_suksan	206	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_207	property_suksan	207	2	380000	VACANT	\N	2026-09-17 05:46:48.775
room_208	property_suksan	208	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_209	property_suksan	209	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_210	property_suksan	210	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_211	property_suksan	211	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_212	property_suksan	212	2	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_301	property_suksan	301	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_302	property_suksan	302	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_303	property_suksan	303	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_304	property_suksan	304	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_305	property_suksan	305	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_306	property_suksan	306	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_307	property_suksan	307	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_308	property_suksan	308	3	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_402	property_suksan	402	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_403	property_suksan	403	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_404	property_suksan	404	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_405	property_suksan	405	4	380000	VACANT	\N	2026-09-17 05:46:48.775
room_406	property_suksan	406	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_407	property_suksan	407	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_408	property_suksan	408	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_409	property_suksan	409	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_410	property_suksan	410	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_411	property_suksan	411	4	380000	OCCUPIED	\N	2026-09-17 05:46:48.775
room_412	property_suksan	412	4	380000	VACANT	\N	2026-09-17 05:46:48.775
room_105	property_suksan	105	1	380000	OCCUPIED	\N	2026-09-17 05:46:48.889
room_104	property_suksan	104	1	380000	OCCUPIED	\N	2026-09-17 05:46:48.89
room_103	property_suksan	103	1	380000	VACANT	\N	2026-09-17 05:46:48.891
room_102	property_suksan	102	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.891
room_101	property_suksan	101	1	350000	OCCUPIED	\N	2026-09-17 05:46:48.892
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Tenant" (id, "propertyId", title, "firstName", "lastName", gender, phone, "avatarUrl") FROM stdin;
tenant_01	property_suksan	น.ส.	วราภรณ์	ใจดี	FEMALE	\N	\N
tenant_02	property_suksan	นาย	ศักดิ์ชัย	แสนสุข	MALE	\N	\N
tenant_03	property_suksan	น.ส.	ธนพร	พรมมา	FEMALE	\N	\N
tenant_04	property_suksan	นาย	กิตติพงษ์	รัตนวงศ์	MALE	\N	\N
tenant_05	property_suksan	น.ส.	พิมพ์ชนก	บุญมี	FEMALE	\N	\N
tenant_06	property_suksan	น.ส.	ชนากานต์	สุขใจ	FEMALE	\N	\N
tenant_07	property_suksan	นาย	สุรเชษฐ์	จันทร์ดี	MALE	\N	\N
tenant_08	property_suksan	นาย	ธนกฤต	วงศ์ดี	FEMALE	\N	\N
tenant_09	property_suksan	น.ส.	ณัฐชา	มีสุข	FEMALE	\N	\N
tenant_10	property_suksan	น.ส.	ปวีณา	แก้วใส	FEMALE	\N	\N
tenant_11	property_suksan	นาย	พงศกร	ทองดี	FEMALE	\N	\N
tenant_12	property_suksan	น.ส.	ศิริพร	คำแสน	FEMALE	\N	\N
tenant_13	property_suksan	น.ส.	กัญญารัตน์	บุญช่วย	FEMALE	\N	\N
tenant_14	property_suksan	นาย	ณัฐวุฒิ	เมืองงาม	FEMALE	\N	\N
tenant_15	property_suksan	น.ส.	ภัทรวดี	ใจงาม	FEMALE	\N	\N
tenant_16	property_suksan	นาย	อาทิตย์	ศรีสุข	FEMALE	\N	\N
tenant_17	property_suksan	น.ส.	สุพัตรา	แสงทอง	FEMALE	\N	\N
tenant_18	property_suksan	น.ส.	จิราภา	พูลผล	FEMALE	\N	\N
tenant_19	property_suksan	นาย	ธีรภัทร	บุญส่ง	FEMALE	\N	\N
tenant_20	property_suksan	น.ส.	ชลธิชา	สวัสดี	FEMALE	\N	\N
tenant_21	property_suksan	นาย	ภูริณัฐ	ใจมั่น	FEMALE	\N	\N
tenant_22	property_suksan	น.ส.	ณิชาภัทร	วัฒนา	FEMALE	\N	\N
tenant_23	property_suksan	น.ส.	รัตนา	สงวนดี	FEMALE	\N	\N
tenant_24	property_suksan	นาย	วรพล	มั่นคง	FEMALE	\N	\N
tenant_25	property_suksan	น.ส.	อรทัย	พรหมดี	FEMALE	\N	\N
tenant_26	property_suksan	นาย	ชัยวัฒน์	ศรีงาม	FEMALE	\N	\N
tenant_27	property_suksan	น.ส.	นันทิชา	สุขสันต์	FEMALE	\N	\N
tenant_28	property_suksan	น.ส.	เบญจพร	แก้วงาม	MALE	\N	\N
tenant_29	property_suksan	นาย	ภาคภูมิ	ทรัพย์ดี	MALE	\N	\N
tenant_30	property_suksan	น.ส.	สุชาดา	มีผล	MALE	\N	\N
tenant_31	property_suksan	นาย	ธนพล	ศรีทอง	MALE	\N	\N
tenant_32	property_suksan	น.ส.	อัญชลี	ใจบุญ	MALE	\N	\N
tenant_33	property_suksan	น.ส.	กมลชนก	พูนสุข	MALE	\N	\N
tenant_34	property_suksan	นาย	ปกรณ์	วงศ์ไทย	MALE	\N	\N
tenant_35	property_suksan	น.ส.	มณีรัตน์	แสนดี	MALE	\N	\N
tenant_36	property_suksan	นาย	เจษฎา	คงมั่น	MALE	\N	\N
tenant_37	property_suksan	น.ส.	พรนภา	ชื่นใจ	MALE	\N	\N
tenant_38	property_suksan	นาย	นราวิชญ์	วัฒนา	MALE	\N	\N
tenant_39	property_suksan	น.ส.	พิชชาภา	บุญเรือง	MALE	\N	\N
tenant_40	property_suksan	นาย	เอกชัย	สุขเกษม	MALE	\N	\N
tenant_41	property_suksan	น.ส.	ลลิตา	ศรีเมือง	MALE	\N	\N
tenant_42	property_suksan	นาย	จักรพงษ์	แก้วดี	MALE	\N	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."User" (id, email, "displayName", "avatarUrl", role) FROM stdin;
user_owner	owner@teehidz.local	คุณตี๋หิด	\N	OWNER
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3df38c03-e6cb-464f-a94e-0d8ad6541901	72a7a79a0dc9b5db900cbb14ffbf65ace890d20e50c8e19da0a09dbab608e5a0	2026-09-17 12:04:28.206392+07	20260917045810_init	\N	\N	2026-09-17 12:04:28.117324+07	1
\.


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: Lease Lease_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Lease"
    ADD CONSTRAINT "Lease_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceRequest MaintenanceRequest_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PropertyMember PropertyMember_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."PropertyMember"
    ADD CONSTRAINT "PropertyMember_pkey" PRIMARY KEY ("userId", "propertyId");


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Expense_propertyId_spentAt_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Expense_propertyId_spentAt_idx" ON namtee888."Expense" USING btree ("propertyId", "spentAt");


--
-- Name: Lease_roomId_status_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Lease_roomId_status_idx" ON namtee888."Lease" USING btree ("roomId", status);


--
-- Name: Lease_status_endDate_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Lease_status_endDate_idx" ON namtee888."Lease" USING btree (status, "endDate");


--
-- Name: Lease_tenantId_status_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Lease_tenantId_status_idx" ON namtee888."Lease" USING btree ("tenantId", status);


--
-- Name: MaintenanceRequest_createdAt_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "MaintenanceRequest_createdAt_idx" ON namtee888."MaintenanceRequest" USING btree ("createdAt");


--
-- Name: MaintenanceRequest_roomId_status_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "MaintenanceRequest_roomId_status_idx" ON namtee888."MaintenanceRequest" USING btree ("roomId", status);


--
-- Name: Notification_propertyId_createdAt_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Notification_propertyId_createdAt_idx" ON namtee888."Notification" USING btree ("propertyId", "createdAt");


--
-- Name: Notification_propertyId_readAt_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Notification_propertyId_readAt_idx" ON namtee888."Notification" USING btree ("propertyId", "readAt");


--
-- Name: Notification_propertyId_type_href_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Notification_propertyId_type_href_idx" ON namtee888."Notification" USING btree ("propertyId", type, href);


--
-- Name: Payment_leaseId_status_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Payment_leaseId_status_idx" ON namtee888."Payment" USING btree ("leaseId", status);


--
-- Name: Payment_status_paidAt_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Payment_status_paidAt_idx" ON namtee888."Payment" USING btree (status, "paidAt");


--
-- Name: PropertyMember_propertyId_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "PropertyMember_propertyId_idx" ON namtee888."PropertyMember" USING btree ("propertyId");


--
-- Name: Room_propertyId_number_key; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE UNIQUE INDEX "Room_propertyId_number_key" ON namtee888."Room" USING btree ("propertyId", number);


--
-- Name: Room_propertyId_status_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Room_propertyId_status_idx" ON namtee888."Room" USING btree ("propertyId", status);


--
-- Name: Tenant_propertyId_idx; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE INDEX "Tenant_propertyId_idx" ON namtee888."Tenant" USING btree ("propertyId");


--
-- Name: User_email_key; Type: INDEX; Schema: namtee888; Owner: namtee888
--

CREATE UNIQUE INDEX "User_email_key" ON namtee888."User" USING btree (email);


--
-- Name: Expense Expense_propertyId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Expense"
    ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES namtee888."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lease Lease_roomId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Lease"
    ADD CONSTRAINT "Lease_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES namtee888."Room"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lease Lease_tenantId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Lease"
    ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES namtee888."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MaintenanceRequest MaintenanceRequest_roomId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES namtee888."Room"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_propertyId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Notification"
    ADD CONSTRAINT "Notification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES namtee888."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_leaseId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Payment"
    ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES namtee888."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyMember PropertyMember_propertyId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."PropertyMember"
    ADD CONSTRAINT "PropertyMember_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES namtee888."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyMember PropertyMember_userId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."PropertyMember"
    ADD CONSTRAINT "PropertyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES namtee888."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Room Room_propertyId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Room"
    ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES namtee888."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Tenant Tenant_propertyId_fkey; Type: FK CONSTRAINT; Schema: namtee888; Owner: namtee888
--

ALTER TABLE ONLY namtee888."Tenant"
    ADD CONSTRAINT "Tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES namtee888."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

