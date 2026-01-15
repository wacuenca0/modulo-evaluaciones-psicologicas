ALTER TABLE fichas_psicologicas ADD (
    ultima_fecha_seguimiento DATE,
    proximo_seguimiento DATE,
    transferencia_fecha DATE,
    transferencia_unidad VARCHAR2(150),
    transferencia_observacion CLOB
);
