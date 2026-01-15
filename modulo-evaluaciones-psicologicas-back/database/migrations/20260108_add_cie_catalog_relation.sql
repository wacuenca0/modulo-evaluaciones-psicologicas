-- agrega trazabilidad al catálogo CIE-10 y vincula fichas con diagnósticos registrados
ALTER TABLE catalogo_cie10 ADD (updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE catalogo_cie10 MODIFY (activo NUMBER(1) DEFAULT 1 NOT NULL);

UPDATE catalogo_cie10
SET updated_at = NVL(updated_at, created_at);

CREATE OR REPLACE TRIGGER tr_catalogo_cie10_audit
BEFORE INSERT OR UPDATE ON catalogo_cie10
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        IF :NEW.created_at IS NULL THEN
            :NEW.created_at := CURRENT_TIMESTAMP;
        END IF;
        IF :NEW.updated_at IS NULL THEN
            :NEW.updated_at := CURRENT_TIMESTAMP;
        END IF;
    ELSE
        :NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;
END;
/

ALTER TABLE fichas_psicologicas ADD (catalogo_cie10_id NUMBER);
ALTER TABLE fichas_psicologicas ADD CONSTRAINT fk_fichas_psicologicas_catalogo_cie FOREIGN KEY (catalogo_cie10_id) REFERENCES catalogo_cie10(id);
CREATE INDEX ix_fichas_psicologicas_cie ON fichas_psicologicas(catalogo_cie10_id);
