-- Añade la nueva columna para registrar la unidad militar del personal
ALTER TABLE personal_militar ADD (
    unidad_militar VARCHAR2(150)
);
