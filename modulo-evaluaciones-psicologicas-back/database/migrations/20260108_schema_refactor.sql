--
-- Schema refactor aligning database objects with the JPA model (January 2026)
-- WARNING: execute on a staging copy first. Backup existing data before running.
-- This script recreates core tables, sequences and constraints used by the
-- modulo-evaluaciones-psicologicas microservices. Tables not listed here may be
-- dropped after confirming they are unused.
--

PROMPT === Dropping existing constraints/load-bearing tables (ignored if absent) ===

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE documentos_digitales CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE tipos_documento CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE password_change_requests CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE usuarios CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE roles CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE seguimientos_psicologicos CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE fichas_psicologicas CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE psicologos CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE personal_militar CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE catalogo_condiciones CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE catalogo_cie10 CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE fichas_historicas CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

PROMPT === Dropping sequences (ignored if absent) ===
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_documentos_digitales';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_tipos_documento';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_password_change_requests';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_usuarios';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_roles';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_seguimientos_psicologicos';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_fichas_psicologicas';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_psicologos';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_personal_militar';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_catalogo_condiciones';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_catalogo_cie10';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_fichas_historicas';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/

PROMPT === Recreating catalogo_cie10 ===
CREATE SEQUENCE seq_catalogo_cie10 START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE catalogo_cie10 (
    id              NUMBER(19, 0)      NOT NULL,
    codigo          VARCHAR2(10 CHAR)  NOT NULL,
    descripcion     CLOB               NOT NULL,
    activo          NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    created_at      TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_catalogo_cie10 PRIMARY KEY (id),
    CONSTRAINT uk_catalogo_cie10_codigo UNIQUE (codigo),
    CONSTRAINT ck_catalogo_cie10_activo CHECK (activo IN (0, 1))
);

PROMPT === Recreating personal_militar ===
CREATE SEQUENCE seq_personal_militar START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE personal_militar (
    id                NUMBER(19, 0)       NOT NULL,
    cedula            VARCHAR2(20 CHAR)   NOT NULL,
    apellidos_nombres VARCHAR2(200 CHAR)  NOT NULL,
    tipo_persona      VARCHAR2(20 CHAR)   NOT NULL,
    es_militar        NUMBER(1, 0)        DEFAULT 0 NOT NULL,
    fecha_nacimiento  DATE                NOT NULL,
    edad              NUMBER(3, 0)        NOT NULL,
    sexo              VARCHAR2(10 CHAR)   NOT NULL,
    etnia             VARCHAR2(50 CHAR),
    estado_civil      VARCHAR2(50 CHAR),
    nro_hijos         NUMBER(3, 0)        DEFAULT 0 NOT NULL,
    ocupacion         VARCHAR2(100 CHAR),
    servicio_activo   NUMBER(1, 0)        DEFAULT 1 NOT NULL,
    servicio_pasivo   NUMBER(1, 0)        DEFAULT 0 NOT NULL,
    seguro            VARCHAR2(100 CHAR),
    grado             VARCHAR2(50 CHAR),
    especialidad      VARCHAR2(100 CHAR),
    unidad_militar    VARCHAR2(150 CHAR),
    provincia         VARCHAR2(100 CHAR),
    canton            VARCHAR2(100 CHAR),
    parroquia         VARCHAR2(100 CHAR),
    barrio_sector     VARCHAR2(100 CHAR),
    telefono          VARCHAR2(20 CHAR),
    celular           VARCHAR2(20 CHAR),
    email             VARCHAR2(100 CHAR),
    activo            NUMBER(1, 0)        DEFAULT 1 NOT NULL,
    created_at        TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_personal_militar PRIMARY KEY (id),
    CONSTRAINT uk_personal_militar_cedula UNIQUE (cedula),
    CONSTRAINT ck_personal_militar_esmilitar CHECK (es_militar IN (0, 1)),
    CONSTRAINT ck_personal_militar_activo CHECK (activo IN (0, 1)),
    CONSTRAINT ck_personal_militar_serv_act CHECK (servicio_activo IN (0, 1)),
    CONSTRAINT ck_personal_militar_serv_pas CHECK (servicio_pasivo IN (0, 1))
);

PROMPT === Recreating psicologos ===
CREATE SEQUENCE seq_psicologos START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE psicologos (
    id               NUMBER(19, 0)       NOT NULL,
    cedula           VARCHAR2(20 CHAR)   NOT NULL,
    usuario_id       NUMBER(19, 0),
    nombres          VARCHAR2(120 CHAR)  NOT NULL,
    apellidos        VARCHAR2(120 CHAR)  NOT NULL,
    apellidos_nombres VARCHAR2(240 CHAR) NOT NULL,
    username         VARCHAR2(50 CHAR)   NOT NULL,
    email            VARCHAR2(100 CHAR),
    telefono         VARCHAR2(20 CHAR),
    celular          VARCHAR2(20 CHAR),
    grado            VARCHAR2(80 CHAR),
    unidad_militar   VARCHAR2(120 CHAR),
    especialidad     VARCHAR2(120 CHAR),
    activo           NUMBER(1, 0)        DEFAULT 1 NOT NULL,
    created_at       TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_psicologos PRIMARY KEY (id),
    CONSTRAINT uk_psicologos_cedula UNIQUE (cedula),
    CONSTRAINT uk_psicologos_username UNIQUE (username),
    CONSTRAINT ck_psicologos_activo CHECK (activo IN (0, 1))
);

PROMPT === Recreating fichas_psicologicas ===
CREATE SEQUENCE seq_fichas_psicologicas START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE fichas_psicologicas (
    id                                NUMBER(19, 0)       NOT NULL,
    personal_militar_id               NUMBER(19, 0)       NOT NULL,
    psicologo_id                      NUMBER(19, 0)       NOT NULL,
    creado_por_psicologo_id           NUMBER(19, 0)       NOT NULL,
    actualizado_por_psicologo_id      NUMBER(19, 0)       NOT NULL,
    numero_evaluacion                 VARCHAR2(40 CHAR)   NOT NULL,
    fecha_evaluacion                  DATE                NOT NULL,
    tipo_evaluacion                   VARCHAR2(40 CHAR),
    estado                            VARCHAR2(30 CHAR)   DEFAULT 'ABIERTA' NOT NULL,
    condicion_clinica                 VARCHAR2(40 CHAR)   DEFAULT 'ALTA' NOT NULL,
    observacion_clinica               CLOB,
    motivo_consulta                   CLOB,
    enfermedad_actual                 CLOB,
    historia_pasada_enfermedad        CLOB,
    historia_toma_medicacion          NUMBER(1, 0),
    historia_tipo_medicacion          VARCHAR2(200 CHAR),
    hist_rehab_requiere               NUMBER(1, 0),
    hist_rehab_tipo                   VARCHAR2(200 CHAR),
    hist_rehab_duracion               VARCHAR2(100 CHAR),
    prenatal_condiciones_biologicas   CLOB,
    prenatal_condiciones_psicologicas CLOB,
    prenatal_observacion              CLOB,
    natal_parto_normal                NUMBER(1, 0),
    natal_termino                     VARCHAR2(50 CHAR),
    natal_complicaciones              VARCHAR2(500 CHAR),
    natal_observacion                 CLOB,
    infancia_grado_sociabilidad       VARCHAR2(30 CHAR),
    infancia_relacion_padres_hermanos VARCHAR2(30 CHAR),
    infancia_discapacidad_intelectual NUMBER(1, 0),
    infancia_grado_discapacidad       VARCHAR2(30 CHAR),
    infancia_trastornos               VARCHAR2(500 CHAR),
    infancia_tratamientos_psico       NUMBER(1, 0),
    infancia_observacion              CLOB,
    catalogo_cie10_id                 NUMBER(19, 0),
    cie10_codigo                      VARCHAR2(10 CHAR),
    cie10_descripcion                 CLOB,
    plan_frecuencia                   VARCHAR2(20 CHAR),
    plan_tipo_sesion                  VARCHAR2(20 CHAR),
    plan_detalle                      VARCHAR2(500 CHAR),
    created_at                        TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at                        TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_fichas_psicologicas PRIMARY KEY (id),
    CONSTRAINT uk_fichas_numero UNIQUE (numero_evaluacion),
    CONSTRAINT ck_fichas_estado CHECK (estado IN ('ACTIVA','ABIERTA','EN_SEGUIMIENTO','OBSERVACION','CERRADA','ARCHIVADA','OTRO')),
    CONSTRAINT ck_fichas_condicion CHECK (condicion_clinica IN ('ALTA','SEGUIMIENTO','TRANSFERENCIA')),
    CONSTRAINT ck_fichas_tipo_eval CHECK (tipo_evaluacion IS NULL OR tipo_evaluacion IN ('VALORACION_PORTE_ARMAS','EVALUACION_ANUAL','INGRESO','REINTEGRO','EVALUACION_ESPECIAL','OTRO')),
    CONSTRAINT ck_fichas_parto_normal CHECK (natal_parto_normal IN (0, 1) OR natal_parto_normal IS NULL),
    CONSTRAINT ck_fichas_discapacidad CHECK (infancia_discapacidad_intelectual IN (0, 1) OR infancia_discapacidad_intelectual IS NULL),
    CONSTRAINT ck_fichas_tratamientos CHECK (infancia_tratamientos_psico IN (0, 1) OR infancia_tratamientos_psico IS NULL),
    CONSTRAINT ck_fichas_plan_freq CHECK (plan_frecuencia IS NULL OR plan_frecuencia IN ('SEMANAL','QUINCENAL','MENSUAL','BIMESTRAL','TRIMESTRAL','PERSONALIZADA')),
    CONSTRAINT ck_fichas_plan_tipo CHECK (plan_tipo_sesion IS NULL OR plan_tipo_sesion IN ('INDIVIDUAL','GRUPAL','FAMILIAR','PAREJA','REMOTA','MIXTA')),
    CONSTRAINT ck_fichas_sociabilidad CHECK (infancia_grado_sociabilidad IS NULL OR infancia_grado_sociabilidad IN ('INTROVERTIDO','RESERVADO','NEUTRAL','COMUNICATIVO','EXTROVERTIDO','OTRO')),
    CONSTRAINT ck_fichas_relacion CHECK (infancia_relacion_padres_hermanos IS NULL OR infancia_relacion_padres_hermanos IN ('ASERTIVA','CONFLICTIVA','DISTANTE','SOBREPROTECTORA','INEXISTENTE','OTRO')),
    CONSTRAINT ck_fichas_grado_discap CHECK (infancia_grado_discapacidad IS NULL OR infancia_grado_discapacidad IN ('NINGUNA','LEVE','MODERADO','GRAVE','PROFUNDO'))
);

CREATE INDEX ix_fichas_psicologicas_cie ON fichas_psicologicas (catalogo_cie10_id);
CREATE INDEX ix_fichas_psicologicas_personal ON fichas_psicologicas (personal_militar_id);
CREATE INDEX ix_fichas_psicologicas_psico ON fichas_psicologicas (psicologo_id);

ALTER TABLE fichas_psicologicas
    ADD CONSTRAINT fk_fichas_personal FOREIGN KEY (personal_militar_id)
        REFERENCES personal_militar (id);
ALTER TABLE fichas_psicologicas
    ADD CONSTRAINT fk_fichas_psicologo FOREIGN KEY (psicologo_id)
        REFERENCES psicologos (id);
ALTER TABLE fichas_psicologicas
    ADD CONSTRAINT fk_fichas_creado_por FOREIGN KEY (creado_por_psicologo_id)
        REFERENCES psicologos (id);
ALTER TABLE fichas_psicologicas
    ADD CONSTRAINT fk_fichas_actualizado_por FOREIGN KEY (actualizado_por_psicologo_id)
        REFERENCES psicologos (id);
ALTER TABLE fichas_psicologicas
    ADD CONSTRAINT fk_fichas_catalogo FOREIGN KEY (catalogo_cie10_id)
        REFERENCES catalogo_cie10 (id);

PROMPT === Recreating seguimientos_psicologicos ===
CREATE SEQUENCE seq_seguimientos_psicologicos START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE seguimientos_psicologicos (
    id                    NUMBER(19, 0)      NOT NULL,
    ficha_psicologica_id  NUMBER(19, 0)      NOT NULL,
    psicologo_id          NUMBER(19, 0)      NOT NULL,
    fecha_seguimiento     DATE               NOT NULL,
    observaciones         CLOB,
    created_at            TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at            TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_seguimientos_psicologicos PRIMARY KEY (id)
);

ALTER TABLE seguimientos_psicologicos
    ADD CONSTRAINT fk_seguimientos_ficha FOREIGN KEY (ficha_psicologica_id)
        REFERENCES fichas_psicologicas (id);
ALTER TABLE seguimientos_psicologicos
    ADD CONSTRAINT fk_seguimientos_psicologo FOREIGN KEY (psicologo_id)
        REFERENCES psicologos (id);

PROMPT === Recreating roles/usuarios/password_change_requests ===
CREATE SEQUENCE seq_roles START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE roles (
    id              NUMBER(19, 0)       NOT NULL,
    nombre          VARCHAR2(50 CHAR)   NOT NULL,
    descripcion     VARCHAR2(255 CHAR),
    nivel_permisos  NUMBER(3, 0)        DEFAULT 1 NOT NULL,
    activo          NUMBER(1, 0)        DEFAULT 1 NOT NULL,
    created_at      TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_nombre UNIQUE (nombre),
    CONSTRAINT ck_roles_activo CHECK (activo IN (0, 1))
);

CREATE SEQUENCE seq_usuarios START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE usuarios (
    id               NUMBER(19, 0)       NOT NULL,
    username         VARCHAR2(50 CHAR)   NOT NULL,
    password_hash    VARCHAR2(255 CHAR)  NOT NULL,
    email            VARCHAR2(100 CHAR),
    rol_id           NUMBER(19, 0),
    activo           NUMBER(1, 0)        DEFAULT 1 NOT NULL,
    fecha_ultimo_login TIMESTAMP(6),
    intentos_login   NUMBER(4, 0)        DEFAULT 0 NOT NULL,
    bloqueado        NUMBER(1, 0)        DEFAULT 0 NOT NULL,
    created_at       TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_username UNIQUE (username),
    CONSTRAINT ck_usuarios_activo CHECK (activo IN (0, 1)),
    CONSTRAINT ck_usuarios_bloqueado CHECK (bloqueado IN (0, 1)),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles (id)
);

ALTER TABLE psicologos
    ADD CONSTRAINT fk_psicologos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id);

CREATE SEQUENCE seq_password_change_requests START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE password_change_requests (
    id               NUMBER(19, 0)       NOT NULL,
    usuario_id       NUMBER(19, 0)       NOT NULL,
    username_snapshot VARCHAR2(50 CHAR)  NOT NULL,
    contact_email    VARCHAR2(150 CHAR),
    motivo           VARCHAR2(500 CHAR),
    status           VARCHAR2(20 CHAR)   NOT NULL,
    requested_at     TIMESTAMP(6)        NOT NULL,
    processed_at     TIMESTAMP(6),
    processed_by     VARCHAR2(50 CHAR),
    admin_notes      VARCHAR2(500 CHAR),
    unlock_account   NUMBER(1, 0),
    CONSTRAINT pk_password_change_requests PRIMARY KEY (id),
    CONSTRAINT ck_password_change_status CHECK (status IN ('PENDIENTE','COMPLETADO','RECHAZADO')),
    CONSTRAINT ck_password_change_unlock CHECK (unlock_account IN (0, 1) OR unlock_account IS NULL)
);

ALTER TABLE password_change_requests
    ADD CONSTRAINT fk_password_change_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id);

CREATE INDEX idx_password_change_status ON password_change_requests (status, requested_at);

PROMPT === Recreating tipos_documento/documentos_digitales ===
CREATE SEQUENCE seq_tipos_documento START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE tipos_documento (
    id            NUMBER(19, 0)       NOT NULL,
    nombre        VARCHAR2(100 CHAR)  NOT NULL,
    descripcion   CLOB,
    obligatorio   NUMBER(1, 0)        DEFAULT 0 NOT NULL,
    CONSTRAINT pk_tipos_documento PRIMARY KEY (id),
    CONSTRAINT uk_tipos_documento_nombre UNIQUE (nombre),
    CONSTRAINT ck_tipos_documento_obligatorio CHECK (obligatorio IN (0, 1))
);

CREATE SEQUENCE seq_documentos_digitales START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE documentos_digitales (
    id                   NUMBER(19, 0)       NOT NULL,
    tipo_documento_id    NUMBER(19, 0),
    personal_militar_id  NUMBER(19, 0)       NOT NULL,
    ficha_psicologica_id NUMBER(19, 0),
    ficha_historica_id   NUMBER(19, 0),
    nombre_original      VARCHAR2(255 CHAR)  NOT NULL,
    ruta_almacenamiento  VARCHAR2(500 CHAR)  NOT NULL,
    tipo_mime            VARCHAR2(150 CHAR),
    tamano_bytes         NUMBER(19, 0),
    descripcion          CLOB,
    origen_modulo        VARCHAR2(120 CHAR),
    referencia_externa   VARCHAR2(150 CHAR),
    origen_registro      VARCHAR2(100 CHAR),
    notas                CLOB,
    metadatos            CLOB,
    checksum             VARCHAR2(128 CHAR),
    version_documento    NUMBER(5, 0)        DEFAULT 1 NOT NULL,
    activo               NUMBER(1, 0)        DEFAULT 1 NOT NULL,
    fecha_subida         TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at           TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP(6)        DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_documentos_digitales PRIMARY KEY (id),
    CONSTRAINT ck_documentos_activo CHECK (activo IN (0, 1)),
    CONSTRAINT ck_documentos_relacion CHECK (ficha_psicologica_id IS NOT NULL OR ficha_historica_id IS NOT NULL)
);

ALTER TABLE documentos_digitales
    ADD CONSTRAINT fk_documentos_tipo FOREIGN KEY (tipo_documento_id)
        REFERENCES tipos_documento (id);

ALTER TABLE documentos_digitales
    ADD CONSTRAINT fk_documentos_personal FOREIGN KEY (personal_militar_id)
        REFERENCES personal_militar (id);

ALTER TABLE documentos_digitales
    ADD CONSTRAINT fk_documentos_ficha FOREIGN KEY (ficha_psicologica_id)
        REFERENCES fichas_psicologicas (id);

PROMPT === Recreating fichas_historicas ===
CREATE SEQUENCE seq_fichas_historicas START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE fichas_historicas (
    id                 NUMBER(19, 0)      NOT NULL,
    personal_militar_id NUMBER(19, 0)      NOT NULL,
    numero_ficha       VARCHAR2(50 CHAR),
    numero_cedula      VARCHAR2(20 CHAR)  NOT NULL,
    apellidos_nombres  VARCHAR2(200 CHAR) NOT NULL,
    estado_ficha       VARCHAR2(20 CHAR),
    fecha_evaluacion   DATE,
    diagnostico_cie10  CLOB,
    resumen_clinico    CLOB,
    observaciones      CLOB,
    fuente_registro    VARCHAR2(100 CHAR),
    referencia_archivo VARCHAR2(255 CHAR),
    created_at         TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at         TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_fichas_historicas PRIMARY KEY (id),
    CONSTRAINT fk_fichas_historicas_personal FOREIGN KEY (personal_militar_id) REFERENCES personal_militar (id)
);

CREATE OR REPLACE TRIGGER tr_fichas_historicas_audit
BEFORE INSERT OR UPDATE ON fichas_historicas
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        IF :NEW.created_at IS NULL THEN
            :NEW.created_at := CURRENT_TIMESTAMP;
        END IF;
    END IF;
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

ALTER TABLE documentos_digitales
    ADD CONSTRAINT fk_documentos_ficha_historica FOREIGN KEY (ficha_historica_id)
        REFERENCES fichas_historicas (id);

CREATE INDEX ix_documentos_ficha ON documentos_digitales (ficha_psicologica_id);
CREATE INDEX ix_documentos_historica ON documentos_digitales (ficha_historica_id);
CREATE INDEX ix_documentos_personal ON documentos_digitales (personal_militar_id);
CREATE INDEX ix_fichas_historicas_personal ON fichas_historicas (personal_militar_id);

PROMPT === Audit bootstrap for existing fichas ===
-- If you migrated data from the previous schema, sync the audit columns so
-- historic fichas keep their responsible psychologist references.
UPDATE fichas_psicologicas f
SET creado_por_psicologo_id = NVL(f.creado_por_psicologo_id, f.psicologo_id),
    actualizado_por_psicologo_id = NVL(f.actualizado_por_psicologo_id, f.psicologo_id)
WHERE f.id IS NOT NULL;

COMMIT;

PROMPT === Schema refactor completed ===
