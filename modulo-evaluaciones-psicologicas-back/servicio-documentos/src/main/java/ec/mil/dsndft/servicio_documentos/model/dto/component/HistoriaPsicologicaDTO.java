package ec.mil.dsndft.servicio_documentos.model.dto.component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriaPsicologicaDTO {
    private String motivoConsulta;
    private String historiaProblema;
    private String contextoFamiliar;
    private String contextoSocial;
    private String contextoLaboral;
    private String eventosSignificativos;
    private String antecedentesPsicologicos;
    private String antecedentesPsiquiatricos;
    private String redApoyo;
    private String intervencionesPrevias;
    private String observacionesPsicosociales;
}
