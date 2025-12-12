package ec.mil.dsndft.servicio_documentos.entity.component;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class EvaluacionPsicologica {

    @Column(name = "evaluacion_cognitiva", columnDefinition = "CLOB")
    private String evaluacionCognitiva;

    @Column(name = "evaluacion_emocional", columnDefinition = "CLOB")
    private String evaluacionEmocional;

    @Column(name = "evaluacion_conductual", columnDefinition = "CLOB")
    private String evaluacionConductual;

    @Column(name = "evaluacion_familiar", columnDefinition = "CLOB")
    private String evaluacionFamiliar;

    @Column(name = "pruebas_aplicadas", columnDefinition = "CLOB")
    private String pruebasAplicadas;

    @Column(name = "resultados_pruebas", columnDefinition = "CLOB")
    private String resultadosPruebas;

    @Column(name = "diagnostico_dsm", columnDefinition = "CLOB")
    private String diagnosticoDsm;

    @Column(name = "diagnostico_cie10", columnDefinition = "CLOB")
    private String diagnosticoCie10;

    @Column(name = "reporte_riesgos", columnDefinition = "CLOB")
    private String reporteRiesgos;

    @Column(name = "observaciones_evaluacion", columnDefinition = "CLOB")
    private String observacionesEvaluacion;
}
