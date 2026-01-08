package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteEpidemiologiaDTO {
    private long totalFichas;
    private long personasEvaluadas;
    private long fichasActivas;
    private long fichasObservacion;
    private long conDiscapacidadIntelectual;
    private long conTrastornos;
    private long conTratamientosPsicologicos;
    private List<DistribucionCategoriaDTO> distribucionPorSexo = new ArrayList<>();
    private List<DistribucionCategoriaDTO> distribucionPorEstado = new ArrayList<>();
}
