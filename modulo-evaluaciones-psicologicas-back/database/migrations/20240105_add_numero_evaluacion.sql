-- agrega la columna requerida por el backend para el identificador único de cada ficha
ALTER TABLE fichas_psicologicas ADD (
    numero_evaluacion VARCHAR2(40)
);

-- genera un valor inicial para registros existentes usando el ID como semilla
UPDATE fichas_psicologicas
SET numero_evaluacion = 'FIC-' || TO_CHAR(NVL(fecha_evaluacion, SYSDATE), 'YYYYMMDD') || '-' || LPAD(id, 8, '0')
WHERE numero_evaluacion IS NULL;

-- asegura la restricción NOT NULL y la unicidad del nuevo identificador
ALTER TABLE fichas_psicologicas MODIFY (numero_evaluacion VARCHAR2(40) NOT NULL);
CREATE UNIQUE INDEX uk_fichas_psicologicas_numero_eval ON fichas_psicologicas(numero_evaluacion);
