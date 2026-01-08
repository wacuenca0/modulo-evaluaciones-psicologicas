-- =============================================
-- SISTEMA HISTORIAL PSICOLÓGICO MILITAR
-- Base de Datos Oracle - Enfocado en Entrevistas Personalizadas
-- =============================================

-- Crear tablespace (opcional, ajusta según tu configuración)
CREATE TABLESPACE ts_psicologico_militar
DATAFILE 'ts_psicologico_militar.dbf'
SIZE 500M AUTOEXTEND ON NEXT 100M MAXSIZE UNLIMITED;

-- Crear usuario
CREATE USER user_hc IDENTIFIED BY "tu_password_here"
DEFAULT TABLESPACE ts_psicologico_militar
QUOTA UNLIMITED ON ts_psicologico_militar;

-- Conceder privilegios
GRANT CONNECT, RESOURCE TO user_hc;
GRANT CREATE VIEW TO user_hc;

-- Conectar con el usuario creado
-- CONNECT user_hc/tu_password_here@localhost:1521/xepdb1

-- =============================================
-- TABLAS MAESTRAS Y CATÁLOGOS
-- =============================================

-- Catálogo de enfermedades CIE-10 (RF002)
CREATE TABLE catalogo_cie10 (
    id NUMBER PRIMARY KEY,
    codigo VARCHAR2(10) NOT NULL UNIQUE,
    descripcion CLOB NOT NULL,
    activo NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secuencia para catalogo_cie10
CREATE SEQUENCE seq_catalogo_cie10 START WITH 1 INCREMENT BY 1;

-- Catálogo de condiciones del paciente (RF007, RF010)
CREATE TABLE catalogo_condiciones (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL UNIQUE,
    descripcion CLOB,
    color_indicador VARCHAR2(7) DEFAULT '#000000'
);

-- Secuencia para catalogo_condiciones
CREATE SEQUENCE seq_catalogo_condiciones START WITH 1 INCREMENT BY 1;

-- Catálogo de tipos de documento (RF009)
CREATE TABLE tipos_documento (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL UNIQUE,
    descripcion CLOB,
    obligatorio NUMBER(1) DEFAULT 0
);

-- Secuencia para tipos_documento
CREATE SEQUENCE seq_tipos_documento START WITH 1 INCREMENT BY 1;

-- =============================================
-- SISTEMA DE USUARIOS Y ROLES
-- =============================================

-- Tabla de roles del sistema
CREATE TABLE roles (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL UNIQUE,
    descripcion CLOB,
    nivel_permisos NUMBER DEFAULT 1,
    activo NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secuencia para roles
CREATE SEQUENCE seq_roles START WITH 1 INCREMENT BY 1;

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    email VARCHAR2(100),
    rol_id NUMBER NOT NULL,
    activo NUMBER(1) DEFAULT 1,
    fecha_ultimo_login TIMESTAMP,
    intentos_login NUMBER DEFAULT 0,
    bloqueado NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Secuencia para usuarios
CREATE SEQUENCE seq_usuarios START WITH 1 INCREMENT BY 1;

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER tr_usuarios_updated
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLAS PRINCIPALES DEL SISTEMA
-- =============================================

-- Tabla de personal militar (RF005, RF011, RF012, RF014)
CREATE TABLE personal_militar (
    id NUMBER PRIMARY KEY,
    cedula VARCHAR2(20) UNIQUE NOT NULL,
    apellidos_nombres VARCHAR2(200) NOT NULL,
    tipo_persona VARCHAR2(20) NOT NULL,
    es_militar NUMBER(1) DEFAULT 0 NOT NULL,
    fecha_nacimiento DATE,
    edad NUMBER,
    sexo VARCHAR2(10) CHECK (sexo IN ('Hombre', 'Mujer', 'Otro')),
    etnia VARCHAR2(50),
    estado_civil VARCHAR2(50),
    nro_hijos NUMBER DEFAULT 0,
    ocupacion VARCHAR2(100),
    servicio_activo NUMBER(1) DEFAULT 1 NOT NULL,
    servicio_pasivo NUMBER(1) DEFAULT 0 NOT NULL,
    seguro VARCHAR2(100),
    grado VARCHAR2(50),
    especialidad VARCHAR2(100),
    provincia VARCHAR2(100),
    canton VARCHAR2(100),
    parroquia VARCHAR2(100),
    barrio_sector VARCHAR2(100),
    telefono VARCHAR2(20),
    celular VARCHAR2(20),
    email VARCHAR2(100),
    activo NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secuencia para personal_militar
CREATE SEQUENCE seq_personal_militar START WITH 1 INCREMENT BY 1;

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER tr_personal_militar_updated
BEFORE UPDATE ON personal_militar
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Tabla de psicólogos (RF003, RF004)
CREATE TABLE psicologos (
    id NUMBER PRIMARY KEY,
    usuario_id NUMBER NOT NULL,
    cedula VARCHAR2(20) UNIQUE NOT NULL,
    apellidos_nombres VARCHAR2(200) NOT NULL,
    grado VARCHAR2(50),
    especialidad VARCHAR2(100),
    telefono VARCHAR2(20),
    celular VARCHAR2(20),
    email VARCHAR2(100),
    activo NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_psicologos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Secuencia para psicologos
CREATE SEQUENCE seq_psicologos START WITH 1 INCREMENT BY 1;

-- Tabla de asignación de pacientes a psicólogos (RF004, RF019)
CREATE TABLE asignaciones_psicologos (
    id NUMBER PRIMARY KEY,
    psicologo_id NUMBER NOT NULL,
    personal_militar_id NUMBER NOT NULL,
    fecha_asignacion DATE NOT NULL,
    motivo_asignacion CLOB,
    activo NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_psicologo_paciente_activo UNIQUE (psicologo_id, personal_militar_id, activo),
    CONSTRAINT fk_asignaciones_psicologo FOREIGN KEY (psicologo_id) REFERENCES psicologos(id),
    CONSTRAINT fk_asignaciones_personal FOREIGN KEY (personal_militar_id) REFERENCES personal_militar(id)
);

-- Secuencia para asignaciones_psicologos
CREATE SEQUENCE seq_asignaciones_psicologos START WITH 1 INCREMENT BY 1;

-- Tabla de fichas históricas de valoración psicológica
CREATE TABLE fichas_historicas (
    id NUMBER PRIMARY KEY,
    numero_ficha VARCHAR2(50),
    numero_cedula VARCHAR2(20) NOT NULL,
    apellidos_nombres VARCHAR2(200) NOT NULL,
    sexo VARCHAR2(20),
    estado_civil VARCHAR2(30),
    nivel_instruccion VARCHAR2(30),
    grado VARCHAR2(50),
    arma_servicio VARCHAR2(100),
    unidad VARCHAR2(150),
    grupo_compania VARCHAR2(150),
    cargo_actual VARCHAR2(150),
    fecha_ingreso DATE,
    tiempo_servicio_anios NUMBER,
    fecha_nacimiento DATE,
    edad_actual NUMBER,
    numero_hijos NUMBER,
    ocupacion VARCHAR2(150),
    especialidad VARCHAR2(150),
    religion VARCHAR2(30),
    tipo_sangre VARCHAR2(10),
    domicilio_provincia VARCHAR2(100),
    domicilio_canton VARCHAR2(100),
    domicilio_parroquia VARCHAR2(100),
    domicilio_barrio VARCHAR2(150),
    telefono VARCHAR2(20),
    celular VARCHAR2(20),
    email VARCHAR2(150),
    contacto_emergencia VARCHAR2(200),
    telefono_emergencia VARCHAR2(20),
    antecedentes_personales CLOB,
    antecedentes_familiares CLOB,
    enfermedades_actuales CLOB,
    tratamientos_previos CLOB,
    cirugias_previas CLOB,
    hospitalizaciones_previas CLOB,
    alergias CLOB,
    medicacion_actual CLOB,
    consumo_sustancias CLOB,
    habitos_salud CLOB,
    sueno_descripcion CLOB,
    horas_sueno NUMBER,
    alimentacion CLOB,
    actividad_fisica CLOB,
    motivo_consulta CLOB,
    historia_problema CLOB,
    contexto_familiar CLOB,
    contexto_social CLOB,
    contexto_laboral CLOB,
    eventos_significativos CLOB,
    antecedentes_psicologicos CLOB,
    antecedentes_psiquiatricos CLOB,
    red_apoyo CLOB,
    intervenciones_previas CLOB,
    observaciones_psicosociales CLOB,
    evaluacion_cognitiva CLOB,
    evaluacion_emocional CLOB,
    evaluacion_conductual CLOB,
    evaluacion_familiar CLOB,
    pruebas_aplicadas CLOB,
    resultados_pruebas CLOB,
    diagnostico_dsm CLOB,
    diagnostico_cie10 CLOB,
    reporte_riesgos CLOB,
    observaciones_evaluacion CLOB,
    plan_intervencion CLOB,
    objetivos_terapeuticos CLOB,
    intervenciones_propuestas CLOB,
    derivaciones CLOB,
    recomendaciones_generales CLOB,
    fecha_proxima_cita DATE,
    responsable_nombre VARCHAR2(200),
    responsable_cargo VARCHAR2(150),
    responsable_identificacion VARCHAR2(50),
    firma_digital_hash VARCHAR2(255),
    observaciones_finales CLOB,
    estado_ficha VARCHAR2(20) DEFAULT 'BORRADOR' NOT NULL,
    fecha_evaluacion DATE,
    psicologo_responsable VARCHAR2(200),
    dependencia_solicitante VARCHAR2(200),
    observaciones_generales CLOB,
    creado_por VARCHAR2(100),
    actualizado_por VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE SEQUENCE seq_fichas_historicas START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER tr_fichas_historicas_ts
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

-- Tabla de documentos asociados a fichas
CREATE TABLE documentos_ficha (
    id NUMBER PRIMARY KEY,
    ficha_id NUMBER NOT NULL,
    tipo_documento_id NUMBER NOT NULL,
    nombre_archivo VARCHAR2(255) NOT NULL,
    ruta_archivo VARCHAR2(500) NOT NULL,
    descripcion CLOB,
    fecha_subida DATE,
    tamano NUMBER,
    activo NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documentos_ficha_ficha FOREIGN KEY (ficha_id) REFERENCES fichas_historicas(id),
    CONSTRAINT fk_documentos_ficha_tipo FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento(id)
);

CREATE SEQUENCE seq_documentos_ficha START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER tr_documentos_ficha_ts
BEFORE INSERT OR UPDATE ON documentos_ficha
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        IF :NEW.created_at IS NULL THEN
            :NEW.created_at := CURRENT_TIMESTAMP;
        END IF;
        IF :NEW.fecha_subida IS NULL THEN
            :NEW.fecha_subida := TRUNC(SYSDATE);
        END IF;
    END IF;
END;
/

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar roles del sistema
INSERT INTO roles (id, nombre, descripcion, nivel_permisos) VALUES
(seq_roles.NEXTVAL, 'Administrador', 'Acceso completo al sistema', 100);

INSERT INTO roles (id, nombre, descripcion, nivel_permisos) VALUES
(seq_roles.NEXTVAL, 'Psicologo', 'Psicólogo que realiza evaluaciones', 50);

INSERT INTO roles (id, nombre, descripcion, nivel_permisos) VALUES
(seq_roles.NEXTVAL, 'Observador', 'Solo puede visualizar reportes', 10);

-- Insertar usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (id, username, password_hash, email, rol_id) VALUES
(seq_usuarios.NEXTVAL, 'admin', '$2b$10$8K1p/a0dRa1C5x0e0w0K3eZ0b8Qa8Z5Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'admin@sistema.com', 1);

COMMIT;