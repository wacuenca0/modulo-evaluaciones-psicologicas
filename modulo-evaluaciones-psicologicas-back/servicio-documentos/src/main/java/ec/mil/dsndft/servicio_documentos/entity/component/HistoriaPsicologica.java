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
public class HistoriaPsicologica {

    @Column(name = "motivo_consulta", columnDefinition = "CLOB")
    private String motivoConsulta;

    @Column(name = "historia_problema", columnDefinition = "CLOB")
    private String historiaProblema;

    @Column(name = "contexto_familiar", columnDefinition = "CLOB")
    private String contextoFamiliar;

    @Column(name = "contexto_social", columnDefinition = "CLOB")
    private String contextoSocial;

    @Column(name = "contexto_laboral", columnDefinition = "CLOB")
    private String contextoLaboral;

    @Column(name = "eventos_significativos", columnDefinition = "CLOB")
    private String eventosSignificativos;

    @Column(name = "antecedentes_psicologicos", columnDefinition = "CLOB")
    private String antecedentesPsicologicos;

    @Column(name = "antecedentes_psiquiatricos", columnDefinition = "CLOB")
    private String antecedentesPsiquiatricos;

    @Column(name = "red_apoyo", columnDefinition = "CLOB")
    private String redApoyo;

    @Column(name = "intervenciones_previas", columnDefinition = "CLOB")
    private String intervencionesPrevias;

    @Column(name = "observaciones_psicosociales", columnDefinition = "CLOB")
    private String observacionesPsicosociales;
}
