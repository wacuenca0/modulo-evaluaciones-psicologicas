package ec.mil.dsndft.servicio_documentos.model.dto.component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionPsicologicaDTO {
    private String evaluacionCognitiva;
    private String evaluacionEmocional;
    private String evaluacionConductual;
    private String evaluacionFamiliar;
    private String pruebasAplicadas;
    private String resultadosPruebas;
    private String diagnosticoDsm;
    private String diagnosticoCie10;
    private String reporteRiesgos;
    private String observacionesEvaluacion;
}
