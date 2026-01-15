-- =============================================
-- SISTEMA HISTORIAL PSICOLÓGICO MILITAR
-- Base de Datos Oracle - Enfocado en Entrevistas Personalizadas
-- =============================================

-- Crear tablespace (opcional, ajusta según tu configuración)
CREATE TABLESPACE ts_psicologico_militar
DATAFILE 'ts_psicologico_militar.dbf'
-- =============================================
-- SISTEMA HISTORIAL PSICOLOGICO MILITAR
-- Script inicial de base de datos para Oracle
-- =============================================

-- Ajusta (o elimina) la seccion de tablespace y usuario segun tu instancia.
-- Las tablas y secuencias definidas aqui siguen exactamente el modelo usado
-- por los microservicios modulo-evaluaciones-psicologicas (enero 2026).

-- =============================================
-- TABLESPACE Y USUARIO (OPCIONAL)
-- =============================================

-- CREATE TABLESPACE ts_psicologico_militar
-- DATAFILE 'ts_psicologico_militar.dbf'
-- SIZE 500M AUTOEXTEND ON NEXT 100M MAXSIZE UNLIMITED;

-- CREATE USER user_hc IDENTIFIED BY "tu_password_here"
-- DEFAULT TABLESPACE ts_psicologico_militar
-- QUOTA UNLIMITED ON ts_psicologico_militar;

-- GRANT CONNECT, RESOURCE, CREATE VIEW TO user_hc;

-- CONNECT user_hc/tu_password_here@localhost:1521/xepdb1

SET DEFINE OFF;
SET ECHO ON;

-- =============================================
-- LIMPIEZA OPCIONAL DE OBJETOS (IGNORA ERRORES SI YA EXISTEN)
-- =============================================

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE documentos_digitales CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE tipos_documento CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE password_change_requests CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE usuarios CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE roles CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE seguimientos_psicologicos CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE fichas_psicologicas CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE psicologos CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE personal_militar CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE catalogo_condiciones CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE catalogo_cie10 CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE fichas_historicas CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_documentos_digitales';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_tipos_documento';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_password_change_requests';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_usuarios';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_roles';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_seguimientos_psicologicos';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_fichas_psicologicas';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_psicologos';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_personal_militar';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_catalogo_condiciones';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_catalogo_cie10';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_fichas_historicas';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2289 THEN RAISE; END IF; END;
/


CREATE SEQUENCE seq_catalogo_cie10 START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE catalogo_cie10 (
    id          NUMBER(19, 0)      NOT NULL,
    codigo      VARCHAR2(10 CHAR)  NOT NULL,
    descripcion CLOB               NOT NULL,
    activo      NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    created_at  TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_catalogo_cie10 PRIMARY KEY (id),
    CONSTRAINT uk_catalogo_cie10_codigo UNIQUE (codigo),
    CONSTRAINT ck_catalogo_cie10_activo CHECK (activo IN (0, 1))
);

CREATE OR REPLACE TRIGGER tr_catalogo_cie10_audit
BEFORE INSERT OR UPDATE ON catalogo_cie10
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

-- =============================================
-- USUARIOS Y ROLES (SERVICIO CATALOGOS)
-- =============================================

CREATE SEQUENCE seq_roles START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE roles (
    id             NUMBER(19, 0)      NOT NULL,
    nombre         VARCHAR2(50 CHAR)  NOT NULL,
    descripcion    VARCHAR2(255 CHAR),
    nivel_permisos NUMBER(3, 0)       DEFAULT 1 NOT NULL,
    activo         NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    created_at     TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_nombre UNIQUE (nombre),
    CONSTRAINT ck_roles_activo CHECK (activo IN (0, 1))
);

CREATE SEQUENCE seq_usuarios START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE usuarios (
    id               NUMBER(19, 0)      NOT NULL,
    username         VARCHAR2(50 CHAR)  NOT NULL,
    password_hash    VARCHAR2(255 CHAR) NOT NULL,
    email            VARCHAR2(100 CHAR),
    rol_id           NUMBER(19, 0),
    activo           NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    fecha_ultimo_login TIMESTAMP(6),
    intentos_login   NUMBER(4, 0)       DEFAULT 0 NOT NULL,
    bloqueado        NUMBER(1, 0)       DEFAULT 0 NOT NULL,
    created_at       TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_username UNIQUE (username),
    CONSTRAINT ck_usuarios_activo CHECK (activo IN (0, 1)),
    CONSTRAINT ck_usuarios_bloqueado CHECK (bloqueado IN (0, 1)),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles (id)
);

CREATE OR REPLACE TRIGGER tr_usuarios_audit
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE SEQUENCE seq_password_change_requests START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE password_change_requests (
    id               NUMBER(19, 0)      NOT NULL,
    usuario_id       NUMBER(19, 0)      NOT NULL,
    username_snapshot VARCHAR2(50 CHAR) NOT NULL,
    contact_email    VARCHAR2(150 CHAR),
    motivo           VARCHAR2(500 CHAR),
    status           VARCHAR2(20 CHAR)  NOT NULL,
    requested_at     TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
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

-- =============================================
-- ENTIDADES DEL SERVICIO GESTION
-- =============================================

CREATE SEQUENCE seq_personal_militar START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE personal_militar (
    id                NUMBER(19, 0)      NOT NULL,
    cedula            VARCHAR2(20 CHAR)  NOT NULL,
    apellidos_nombres VARCHAR2(200 CHAR) NOT NULL,
    tipo_persona      VARCHAR2(20 CHAR)  NOT NULL,
    es_militar        NUMBER(1, 0)       DEFAULT 0 NOT NULL,
    fecha_nacimiento  DATE,
    edad              NUMBER(3, 0),
    sexo              VARCHAR2(10 CHAR),
    etnia             VARCHAR2(50 CHAR),
    estado_civil      VARCHAR2(50 CHAR),
    nro_hijos         NUMBER(3, 0)       DEFAULT 0 NOT NULL,
    ocupacion         VARCHAR2(100 CHAR),
    servicio_activo   NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    servicio_pasivo   NUMBER(1, 0)       DEFAULT 0 NOT NULL,
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
    activo            NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    created_at        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_personal_militar PRIMARY KEY (id),
    CONSTRAINT uk_personal_militar_cedula UNIQUE (cedula),
    CONSTRAINT ck_personal_militar_flags CHECK (es_militar IN (0,1) AND servicio_activo IN (0,1) AND servicio_pasivo IN (0,1) AND activo IN (0,1))
);

CREATE OR REPLACE TRIGGER tr_personal_militar_audit
BEFORE UPDATE ON personal_militar
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE SEQUENCE seq_psicologos START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE psicologos (
    id                NUMBER(19, 0)      NOT NULL,
    cedula            VARCHAR2(20 CHAR)  NOT NULL,
    usuario_id        NUMBER(19, 0),
    nombres           VARCHAR2(120 CHAR) NOT NULL,
    apellidos         VARCHAR2(120 CHAR) NOT NULL,
    apellidos_nombres VARCHAR2(240 CHAR) NOT NULL,
    username          VARCHAR2(50 CHAR)  NOT NULL,
    email             VARCHAR2(100 CHAR),
    telefono          VARCHAR2(20 CHAR),
    celular           VARCHAR2(20 CHAR),
    grado             VARCHAR2(80 CHAR),
    unidad_militar    VARCHAR2(120 CHAR),
    especialidad      VARCHAR2(120 CHAR),
    activo            NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    created_at        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_psicologos PRIMARY KEY (id),
    CONSTRAINT uk_psicologos_cedula UNIQUE (cedula),
    CONSTRAINT uk_psicologos_username UNIQUE (username),
    CONSTRAINT ck_psicologos_activo CHECK (activo IN (0, 1))
);

ALTER TABLE psicologos
    ADD CONSTRAINT fk_psicologos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id);

CREATE OR REPLACE TRIGGER tr_psicologos_audit
BEFORE INSERT OR UPDATE ON psicologos
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

CREATE SEQUENCE seq_fichas_psicologicas START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE fichas_psicologicas (
    id                                NUMBER(19, 0)      NOT NULL,
    personal_militar_id               NUMBER(19, 0)      NOT NULL,
    psicologo_id                      NUMBER(19, 0)      NOT NULL,
    creado_por_psicologo_id           NUMBER(19, 0)      NOT NULL,
    actualizado_por_psicologo_id      NUMBER(19, 0)      NOT NULL,
    numero_evaluacion                 VARCHAR2(40 CHAR)  NOT NULL,
    fecha_evaluacion                  DATE               NOT NULL,
    tipo_evaluacion                   VARCHAR2(40 CHAR),
    estado                            VARCHAR2(30 CHAR)  DEFAULT 'ABIERTA' NOT NULL,
    condicion_clinica                 VARCHAR2(40 CHAR)  DEFAULT 'ALTA' NOT NULL,
    observacion_clinica               CLOB,
    motivo_consulta                   CLOB,
    enfermedad_actual                 CLOB,
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
    created_at                        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at                        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_fichas_psicologicas PRIMARY KEY (id),
    CONSTRAINT uk_fichas_numero UNIQUE (numero_evaluacion),
    CONSTRAINT fk_fichas_personal FOREIGN KEY (personal_militar_id) REFERENCES personal_militar (id),
    CONSTRAINT fk_fichas_psicologo FOREIGN KEY (psicologo_id) REFERENCES psicologos (id),
    CONSTRAINT fk_fichas_creado FOREIGN KEY (creado_por_psicologo_id) REFERENCES psicologos (id),
    CONSTRAINT fk_fichas_actualizado FOREIGN KEY (actualizado_por_psicologo_id) REFERENCES psicologos (id),
    CONSTRAINT fk_fichas_catalogo FOREIGN KEY (catalogo_cie10_id) REFERENCES catalogo_cie10 (id)
);

CREATE INDEX ix_fichas_personal ON fichas_psicologicas (personal_militar_id);
CREATE INDEX ix_fichas_psicologo ON fichas_psicologicas (psicologo_id);
CREATE INDEX ix_fichas_catalogo ON fichas_psicologicas (catalogo_cie10_id);

CREATE OR REPLACE TRIGGER tr_fichas_psicologicas_audit
BEFORE INSERT OR UPDATE ON fichas_psicologicas
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

CREATE SEQUENCE seq_seguimientos_psicologicos START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE seguimientos_psicologicos (
    id                    NUMBER(19, 0)      NOT NULL,
    ficha_psicologica_id  NUMBER(19, 0)      NOT NULL,
    psicologo_id          NUMBER(19, 0)      NOT NULL,
    fecha_seguimiento     DATE               NOT NULL,
    observaciones         CLOB,
    created_at            TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at            TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_seguimientos_psicologicos PRIMARY KEY (id),
    CONSTRAINT fk_seguimientos_ficha FOREIGN KEY (ficha_psicologica_id) REFERENCES fichas_psicologicas (id),
    CONSTRAINT fk_seguimientos_psicologo FOREIGN KEY (psicologo_id) REFERENCES psicologos (id)
);

CREATE OR REPLACE TRIGGER tr_seguimientos_audit
BEFORE INSERT OR UPDATE ON seguimientos_psicologicos
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

-- =============================================
-- ENTIDADES DEL SERVICIO DOCUMENTOS
-- =============================================

CREATE SEQUENCE seq_tipos_documento START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE tipos_documento (
    id           NUMBER(19, 0)      NOT NULL,
    nombre       VARCHAR2(100 CHAR) NOT NULL,
    descripcion  CLOB,
    obligatorio  NUMBER(1, 0)       DEFAULT 0 NOT NULL,
    CONSTRAINT pk_tipos_documento PRIMARY KEY (id),
    CONSTRAINT uk_tipos_documento_nombre UNIQUE (nombre),
    CONSTRAINT ck_tipos_documento_obl CHECK (obligatorio IN (0, 1))
);

CREATE SEQUENCE seq_documentos_digitales START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE documentos_digitales (
    id                  NUMBER(19, 0)      NOT NULL,
    tipo_documento_id   NUMBER(19, 0),
    personal_militar_id NUMBER(19, 0)      NOT NULL,
    ficha_psicologica_id NUMBER(19, 0),
    ficha_historica_id  NUMBER(19, 0),
    nombre_original     VARCHAR2(255 CHAR) NOT NULL,
    ruta_almacenamiento VARCHAR2(500 CHAR) NOT NULL,
    tipo_mime           VARCHAR2(150 CHAR),
    tamano_bytes        NUMBER(19, 0),
    descripcion         CLOB,
    origen_modulo       VARCHAR2(120 CHAR),
    referencia_externa  VARCHAR2(150 CHAR),
    origen_registro     VARCHAR2(100 CHAR),
    notas               CLOB,
    metadatos           CLOB,
    checksum            VARCHAR2(128 CHAR),
    version_documento   NUMBER(5, 0)       DEFAULT 1 NOT NULL,
    activo              NUMBER(1, 0)       DEFAULT 1 NOT NULL,
    fecha_subida        TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at          TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP(6)       DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
CREATE INDEX ix_documentos_ficha ON documentos_digitales (ficha_psicologica_id);
CREATE INDEX ix_documentos_personal ON documentos_digitales (personal_militar_id);

CREATE OR REPLACE TRIGGER tr_documentos_audit
BEFORE INSERT OR UPDATE ON documentos_digitales
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        IF :NEW.created_at IS NULL THEN
            :NEW.created_at := CURRENT_TIMESTAMP;
        END IF;
        IF :NEW.fecha_subida IS NULL THEN
            :NEW.fecha_subida := CURRENT_TIMESTAMP;
        END IF;
        IF :NEW.version_documento IS NULL THEN
            :NEW.version_documento := 1;
        END IF;
        IF :NEW.activo IS NULL THEN
            :NEW.activo := 1;
        END IF;
    END IF;
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- LEGADO: FICHAS HISTORICAS (LIGADAS A REPORTES)
-- =============================================

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

CREATE INDEX ix_documentos_historica ON documentos_digitales (ficha_historica_id);

CREATE INDEX ix_fichas_historicas_personal ON fichas_historicas (personal_militar_id);

-- =============================================
-- DATOS SEMILLA BASICOS
-- =============================================

INSERT INTO roles (id, nombre, descripcion, nivel_permisos, activo)
VALUES (seq_roles.NEXTVAL, 'Administrador', 'Acceso completo al sistema', 100, 1);

INSERT INTO roles (id, nombre, descripcion, nivel_permisos, activo)
VALUES (seq_roles.NEXTVAL, 'Psicologo', 'Gestion de fichas y reportes', 50, 1);

INSERT INTO roles (id, nombre, descripcion, nivel_permisos, activo)
VALUES (seq_roles.NEXTVAL, 'Observador', 'Solo lectura', 10, 1);

INSERT INTO usuarios (id, username, password_hash, email, rol_id, activo, intentos_login, bloqueado)
VALUES (
    seq_usuarios.NEXTVAL,
    'admin',
    '$2b$12$abcdefghijklmnopqrstuv', -- Reemplazar con hash real
    'admin@sistema.mil',
    (SELECT id FROM roles WHERE nombre = 'Administrador'),
    1,
    0,
    0
);

COMMIT;

SET ECHO OFF;
PROMPT Setup completado. Verifica datos seed y contraseñas antes de usar en produccion.