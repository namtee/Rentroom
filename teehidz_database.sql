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
cmu5bc6j00058v9hknax3uirc	property_suksan	ค่าใช้จ่ายรวม	4760000	2026-07-20 05:00:00	\N
cmu5bc6j00059v9hkfzpo0q3o	property_suksan	ค่าใช้จ่ายรวม	4980000	2026-08-20 05:00:00	\N
cmu5bc6j0005av9hkaoaa59kv	property_suksan	ค่าใช้จ่ายรวม	5230000	2026-09-10 05:00:00	\N
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
cmu5bc6j2005bv9hkih5t38lh	property_suksan	MAINTENANCE_NEW	มีแจ้งซ่อมใหม่	ห้อง 203 - น้ำรั่วในห้องน้ำ	/maintenance/maintenance_203	\N	2025-09-11 12:12:00
cmu5bc6j2005cv9hkxwwjcvvi	property_suksan	PAYMENT_RECEIVED	ผู้เช่าชำระค่าเช่า	ห้อง 101 - 3,500 บาท	/finance/payments/seed-101	\N	2025-09-11 13:05:00
cmu5bc6j2005dv9hkbxhhi28k	property_suksan	LEASE_EXPIRING	ใกล้หมดสัญญาเช่า	ห้อง 110 - เหลือ 15 วัน	/leases/lease_110	\N	2025-09-11 08:12:00
cmu5bc6j2005ev9hkysrrydao	property_suksan	ROOM_AVAILABLE	ห้องว่างพร้อมให้เช่า	ห้อง 103 - 3,800 บาท/เดือน	/rooms/room_103?seed=1	2026-09-17 09:14:15.024	2025-09-11 06:12:00
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Payment" (id, "leaseId", amount, period, status, "paidAt") FROM stdin;
cmu5bc6hq0001v9hkega2111c	lease_101	350000	2026-09	PAID	2026-09-11 13:05:00
cmu5bc6hr0003v9hkph7wwwle	lease_102	350000	2026-09	PAID	2026-09-11 12:42:00
cmu5bc6hs0005v9hkbyh6uyda	lease_104	380000	2026-09	PAID	2026-09-11 11:30:00
cmu5bc6hs0007v9hkkad3hmzd	lease_105	380000	2026-09	PAID	2026-09-11 10:20:00
cmu5bc6ht0009v9hkdztdy1v6	lease_108	350000	2026-09	PAID	2026-09-10 09:12:00
cmu5bc6ht000bv9hkxsig9wr4	lease_107	350000	2026-09	PAID	2026-09-01 08:00:00
cmu5bc6hu000dv9hk2092w1ao	lease_108	350000	2026-09	PAID	2026-09-02 08:00:00
cmu5bc6hu000fv9hkxqbgeqy1	lease_109	350000	2026-09	PAID	2026-09-03 08:00:00
cmu5bc6hv000hv9hk53fuhzls	lease_110	350000	2026-09	PAID	2026-09-04 08:00:00
cmu5bc6hv000jv9hk4esm07ac	lease_111	350000	2026-09	PAID	2026-09-05 08:00:00
cmu5bc6hw000lv9hkwxyroqgd	lease_201	350000	2026-09	PAID	2026-09-06 08:00:00
cmu5bc6hw000nv9hktapc367g	lease_202	380000	2026-09	PAID	2026-09-07 08:00:00
cmu5bc6hx000pv9hkpufecc7q	lease_203	380000	2026-09	PAID	2026-09-08 08:00:00
cmu5bc6hx000rv9hkvowle98m	lease_204	380000	2026-09	PAID	2026-09-09 08:00:00
cmu5bc6hx000tv9hkx4prdpju	lease_205	380000	2026-09	PAID	2026-09-01 08:00:00
cmu5bc6hy000vv9hkwwp7adp3	lease_206	380000	2026-09	PAID	2026-09-02 08:00:00
cmu5bc6hz000xv9hkf1jjghl7	lease_208	380000	2026-09	PAID	2026-09-03 08:00:00
cmu5bc6hz000zv9hkt0l19auw	lease_209	380000	2026-09	PAID	2026-09-04 08:00:00
cmu5bc6i00011v9hkek1bz0rn	lease_210	380000	2026-09	PAID	2026-09-05 08:00:00
cmu5bc6i00013v9hkgmbhsr7p	lease_211	380000	2026-09	PAID	2026-09-06 08:00:00
cmu5bc6i00015v9hkoex5wvtf	lease_212	380000	2026-09	PAID	2026-09-07 08:00:00
cmu5bc6i10017v9hk3pc8mcc6	lease_301	380000	2026-09	PAID	2026-09-08 08:00:00
cmu5bc6i10019v9hk0vlbd7b0	lease_302	380000	2026-09	PAID	2026-09-09 08:00:00
cmu5bc6i2001bv9hkdfz5sgca	lease_303	380000	2026-09	PAID	2026-09-01 08:00:00
cmu5bc6i2001dv9hk41soqgyu	lease_304	380000	2026-09	PAID	2026-09-02 08:00:00
cmu5bc6i3001fv9hkdyz398fr	lease_305	380000	2026-09	PAID	2026-09-03 08:00:00
cmu5bc6i3001hv9hk08j54y9f	lease_306	380000	2026-09	PAID	2026-09-04 08:00:00
cmu5bc6i4001jv9hkwmkf1iqt	lease_307	380000	2026-09	PAID	2026-09-05 08:00:00
cmu5bc6i4001lv9hk5easrwmc	lease_308	380000	2026-09	PAID	2026-09-06 08:00:00
cmu5bc6i4001nv9hkh47xewq7	lease_310	380000	2026-09	PAID	2026-09-07 08:00:00
cmu5bc6i5001pv9hk2tf46rsq	lease_311	380000	2026-09	PAID	2026-09-08 08:00:00
cmu5bc6i5001rv9hkvd5j68hn	lease_312	380000	2026-09	PAID	2026-09-09 08:00:00
cmu5bc6i6001tv9hko7lfr9ce	lease_401	380000	2026-09	PAID	2026-09-01 08:00:00
cmu5bc6i6001vv9hkka87hzru	lease_402	380000	2026-09	PAID	2026-09-02 08:00:00
cmu5bc6i7001xv9hkpwc4dbkq	lease_101	350000	2026-07	PAID	2026-07-05 08:00:00
cmu5bc6i7001zv9hkmu3lpcw1	lease_102	350000	2026-07	PAID	2026-07-06 08:00:00
cmu5bc6i70021v9hkhoea0ht5	lease_104	350000	2026-07	PAID	2026-07-07 08:00:00
cmu5bc6i80023v9hkly94i346	lease_105	350000	2026-07	PAID	2026-07-08 08:00:00
cmu5bc6i80025v9hkgq8b3lsu	lease_106	380000	2026-07	PAID	2026-07-09 08:00:00
cmu5bc6i90027v9hkyvffmkd7	lease_107	380000	2026-07	PAID	2026-07-10 08:00:00
cmu5bc6i90029v9hk07x0j2dq	lease_108	380000	2026-07	PAID	2026-07-11 08:00:00
cmu5bc6ia002bv9hkxg59f139	lease_109	380000	2026-07	PAID	2026-07-12 08:00:00
cmu5bc6ia002dv9hkqvxoco8x	lease_110	380000	2026-07	PAID	2026-07-13 08:00:00
cmu5bc6ib002fv9hkamq3hvqp	lease_111	380000	2026-07	PAID	2026-07-14 08:00:00
cmu5bc6ib002hv9hksig938au	lease_201	380000	2026-07	PAID	2026-07-15 08:00:00
cmu5bc6ic002jv9hkfarvnqcm	lease_202	380000	2026-07	PAID	2026-07-16 08:00:00
cmu5bc6ic002lv9hkh8nkqlom	lease_203	380000	2026-07	PAID	2026-07-17 08:00:00
cmu5bc6id002nv9hkjogqhjwv	lease_204	380000	2026-07	PAID	2026-07-18 08:00:00
cmu5bc6id002pv9hkhwry3ub1	lease_205	380000	2026-07	PAID	2026-07-19 08:00:00
cmu5bc6ie002rv9hks0tjtiys	lease_206	380000	2026-07	PAID	2026-07-20 08:00:00
cmu5bc6ie002tv9hk6uavm1fp	lease_208	380000	2026-07	PAID	2026-07-21 08:00:00
cmu5bc6if002vv9hksh5sjez3	lease_209	380000	2026-07	PAID	2026-07-22 08:00:00
cmu5bc6if002xv9hkndyzj0dv	lease_210	380000	2026-07	PAID	2026-07-23 08:00:00
cmu5bc6ig002zv9hkvsivtjx3	lease_211	380000	2026-07	PAID	2026-07-24 08:00:00
cmu5bc6ig0031v9hkevwnre73	lease_212	380000	2026-07	PAID	2026-07-05 08:00:00
cmu5bc6ih0033v9hk0j430qyf	lease_301	380000	2026-07	PAID	2026-07-06 08:00:00
cmu5bc6ih0035v9hk29xtntis	lease_302	380000	2026-07	PAID	2026-07-07 08:00:00
cmu5bc6ih0037v9hk1qoqjh81	lease_303	380000	2026-07	PAID	2026-07-08 08:00:00
cmu5bc6ii0039v9hkmhyjw8kc	lease_304	380000	2026-07	PAID	2026-07-09 08:00:00
cmu5bc6ii003bv9hkpw9gkju8	lease_305	380000	2026-07	PAID	2026-07-10 08:00:00
cmu5bc6ij003dv9hk4ch8ckn4	lease_306	380000	2026-07	PAID	2026-07-11 08:00:00
cmu5bc6ij003fv9hk94fquvr8	lease_307	380000	2026-07	PAID	2026-07-12 08:00:00
cmu5bc6ik003hv9hk42ljt82n	lease_101	350000	2026-08	PAID	2026-08-05 08:00:00
cmu5bc6ik003jv9hkk00rf49v	lease_102	350000	2026-08	PAID	2026-08-06 08:00:00
cmu5bc6il003lv9hkgtw0hozb	lease_104	350000	2026-08	PAID	2026-08-07 08:00:00
cmu5bc6il003nv9hk5af8r9zm	lease_105	350000	2026-08	PAID	2026-08-08 08:00:00
cmu5bc6il003pv9hk6397atfp	lease_106	350000	2026-08	PAID	2026-08-09 08:00:00
cmu5bc6im003rv9hk6nksa42t	lease_107	350000	2026-08	PAID	2026-08-10 08:00:00
cmu5bc6im003tv9hkux8ml3m7	lease_108	350000	2026-08	PAID	2026-08-11 08:00:00
cmu5bc6in003vv9hk423fqg4z	lease_109	350000	2026-08	PAID	2026-08-12 08:00:00
cmu5bc6in003xv9hk5626mz40	lease_110	350000	2026-08	PAID	2026-08-13 08:00:00
cmu5bc6io003zv9hked4s1ylx	lease_111	350000	2026-08	PAID	2026-08-14 08:00:00
cmu5bc6io0041v9hkgavys8p3	lease_201	350000	2026-08	PAID	2026-08-15 08:00:00
cmu5bc6ip0043v9hkq2o2mpj6	lease_202	350000	2026-08	PAID	2026-08-16 08:00:00
cmu5bc6ip0045v9hk11cm2gtp	lease_203	350000	2026-08	PAID	2026-08-17 08:00:00
cmu5bc6ip0047v9hkgpn9dbas	lease_204	350000	2026-08	PAID	2026-08-18 08:00:00
cmu5bc6iq0049v9hkw64890gi	lease_205	350000	2026-08	PAID	2026-08-19 08:00:00
cmu5bc6iq004bv9hk1x4j70q6	lease_206	350000	2026-08	PAID	2026-08-20 08:00:00
cmu5bc6ir004dv9hk8bmi2kyx	lease_208	350000	2026-08	PAID	2026-08-21 08:00:00
cmu5bc6ir004fv9hkpyw7n4m3	lease_209	350000	2026-08	PAID	2026-08-22 08:00:00
cmu5bc6is004hv9hk74l4nsv1	lease_210	350000	2026-08	PAID	2026-08-23 08:00:00
cmu5bc6is004jv9hkdo989qqy	lease_211	350000	2026-08	PAID	2026-08-24 08:00:00
cmu5bc6it004lv9hklhnpcmrj	lease_212	350000	2026-08	PAID	2026-08-05 08:00:00
cmu5bc6iu004nv9hkdpia1wgc	lease_301	350000	2026-08	PAID	2026-08-06 08:00:00
cmu5bc6iu004pv9hkhqu7480m	lease_302	350000	2026-08	PAID	2026-08-07 08:00:00
cmu5bc6iv004rv9hkqi31rto2	lease_303	350000	2026-08	PAID	2026-08-08 08:00:00
cmu5bc6iw004tv9hk9jgwff5r	lease_304	350000	2026-08	PAID	2026-08-09 08:00:00
cmu5bc6iw004vv9hk5edu0fp8	lease_305	350000	2026-08	PAID	2026-08-10 08:00:00
cmu5bc6ix004xv9hksnygwkqa	lease_306	350000	2026-08	PAID	2026-08-11 08:00:00
cmu5bc6ix004zv9hkamy4xdej	lease_307	350000	2026-08	PAID	2026-08-12 08:00:00
cmu5bc6iy0051v9hk5crdofpo	lease_308	350000	2026-08	PAID	2026-08-13 08:00:00
cmu5bc6iy0053v9hk6a1asgtn	lease_310	380000	2026-08	PAID	2026-08-14 08:00:00
cmu5bc6iz0055v9hkg12xnid2	lease_311	380000	2026-08	PAID	2026-08-15 08:00:00
cmu5bc6iz0057v9hkexggljc3	lease_312	380000	2026-08	PAID	2026-08-16 08:00:00
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
room_106	property_suksan	106	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_107	property_suksan	107	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_108	property_suksan	108	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_109	property_suksan	109	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_110	property_suksan	110	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_111	property_suksan	111	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_112	property_suksan	112	1	380000	VACANT	\N	2026-09-17 09:14:15.088
room_201	property_suksan	201	2	350000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_202	property_suksan	202	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_203	property_suksan	203	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_204	property_suksan	204	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_205	property_suksan	205	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_206	property_suksan	206	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_207	property_suksan	207	2	380000	VACANT	\N	2026-09-17 09:14:15.088
room_208	property_suksan	208	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_209	property_suksan	209	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_210	property_suksan	210	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_211	property_suksan	211	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_212	property_suksan	212	2	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_301	property_suksan	301	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_302	property_suksan	302	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_303	property_suksan	303	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_304	property_suksan	304	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_305	property_suksan	305	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_306	property_suksan	306	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_307	property_suksan	307	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_308	property_suksan	308	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_309	property_suksan	309	3	380000	VACANT	\N	2026-09-17 09:14:15.088
room_310	property_suksan	310	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_311	property_suksan	311	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_312	property_suksan	312	3	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_401	property_suksan	401	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_402	property_suksan	402	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_403	property_suksan	403	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_404	property_suksan	404	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_405	property_suksan	405	4	380000	VACANT	\N	2026-09-17 09:14:15.088
room_406	property_suksan	406	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_407	property_suksan	407	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_408	property_suksan	408	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_409	property_suksan	409	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_410	property_suksan	410	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_411	property_suksan	411	4	380000	OCCUPIED	\N	2026-09-17 09:14:15.088
room_412	property_suksan	412	4	380000	VACANT	\N	2026-09-17 09:14:15.088
room_105	property_suksan	105	1	380000	OCCUPIED	\N	2026-09-17 09:14:15.183
room_104	property_suksan	104	1	380000	OCCUPIED	\N	2026-09-17 09:14:15.184
room_103	property_suksan	103	1	380000	VACANT	\N	2026-09-17 09:14:15.185
room_102	property_suksan	102	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.185
room_101	property_suksan	101	1	350000	OCCUPIED	\N	2026-09-17 09:14:15.186
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: namtee888; Owner: namtee888
--

COPY namtee888."Tenant" (id, "propertyId", title, "firstName", "lastName", gender, phone, "avatarUrl") FROM stdin;
tenant_01	property_suksan	น.ส.	ผู้เช่าสมมุติ	01	FEMALE	\N	\N
tenant_02	property_suksan	นาย	ผู้เช่าสมมุติ	02	MALE	\N	\N
tenant_03	property_suksan	น.ส.	ผู้เช่าสมมุติ	03	FEMALE	\N	\N
tenant_04	property_suksan	นาย	ผู้เช่าสมมุติ	04	MALE	\N	\N
tenant_05	property_suksan	น.ส.	ผู้เช่าสมมุติ	05	FEMALE	\N	\N
tenant_06	property_suksan	น.ส.	ผู้เช่าสมมุติ	06	FEMALE	\N	\N
tenant_07	property_suksan	นาย	ผู้เช่าสมมุติ	07	MALE	\N	\N
tenant_08	property_suksan	น.ส.	ผู้เช่าสมมุติ	08	FEMALE	\N	\N
tenant_09	property_suksan	น.ส.	ผู้เช่าสมมุติ	09	FEMALE	\N	\N
tenant_10	property_suksan	น.ส.	ผู้เช่าสมมุติ	10	FEMALE	\N	\N
tenant_11	property_suksan	น.ส.	ผู้เช่าสมมุติ	11	FEMALE	\N	\N
tenant_12	property_suksan	น.ส.	ผู้เช่าสมมุติ	12	FEMALE	\N	\N
tenant_13	property_suksan	น.ส.	ผู้เช่าสมมุติ	13	FEMALE	\N	\N
tenant_14	property_suksan	น.ส.	ผู้เช่าสมมุติ	14	FEMALE	\N	\N
tenant_15	property_suksan	น.ส.	ผู้เช่าสมมุติ	15	FEMALE	\N	\N
tenant_16	property_suksan	น.ส.	ผู้เช่าสมมุติ	16	FEMALE	\N	\N
tenant_17	property_suksan	น.ส.	ผู้เช่าสมมุติ	17	FEMALE	\N	\N
tenant_18	property_suksan	น.ส.	ผู้เช่าสมมุติ	18	FEMALE	\N	\N
tenant_19	property_suksan	น.ส.	ผู้เช่าสมมุติ	19	FEMALE	\N	\N
tenant_20	property_suksan	น.ส.	ผู้เช่าสมมุติ	20	FEMALE	\N	\N
tenant_21	property_suksan	น.ส.	ผู้เช่าสมมุติ	21	FEMALE	\N	\N
tenant_22	property_suksan	น.ส.	ผู้เช่าสมมุติ	22	FEMALE	\N	\N
tenant_23	property_suksan	น.ส.	ผู้เช่าสมมุติ	23	FEMALE	\N	\N
tenant_24	property_suksan	น.ส.	ผู้เช่าสมมุติ	24	FEMALE	\N	\N
tenant_25	property_suksan	น.ส.	ผู้เช่าสมมุติ	25	FEMALE	\N	\N
tenant_26	property_suksan	น.ส.	ผู้เช่าสมมุติ	26	FEMALE	\N	\N
tenant_27	property_suksan	น.ส.	ผู้เช่าสมมุติ	27	FEMALE	\N	\N
tenant_28	property_suksan	นาย	ผู้เช่าสมมุติ	28	MALE	\N	\N
tenant_29	property_suksan	นาย	ผู้เช่าสมมุติ	29	MALE	\N	\N
tenant_30	property_suksan	นาย	ผู้เช่าสมมุติ	30	MALE	\N	\N
tenant_31	property_suksan	นาย	ผู้เช่าสมมุติ	31	MALE	\N	\N
tenant_32	property_suksan	นาย	ผู้เช่าสมมุติ	32	MALE	\N	\N
tenant_33	property_suksan	นาย	ผู้เช่าสมมุติ	33	MALE	\N	\N
tenant_34	property_suksan	นาย	ผู้เช่าสมมุติ	34	MALE	\N	\N
tenant_35	property_suksan	นาย	ผู้เช่าสมมุติ	35	MALE	\N	\N
tenant_36	property_suksan	นาย	ผู้เช่าสมมุติ	36	MALE	\N	\N
tenant_37	property_suksan	นาย	ผู้เช่าสมมุติ	37	MALE	\N	\N
tenant_38	property_suksan	นาย	ผู้เช่าสมมุติ	38	MALE	\N	\N
tenant_39	property_suksan	นาย	ผู้เช่าสมมุติ	39	MALE	\N	\N
tenant_40	property_suksan	นาย	ผู้เช่าสมมุติ	40	MALE	\N	\N
tenant_41	property_suksan	นาย	ผู้เช่าสมมุติ	41	MALE	\N	\N
tenant_42	property_suksan	นาย	ผู้เช่าสมมุติ	42	MALE	\N	\N
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

