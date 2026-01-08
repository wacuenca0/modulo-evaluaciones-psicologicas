package ec.mil.dsndft.servicio_gestion.model.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteHistorialPsicologicoDTO {
    private Long personalMilitarId;
    private String personalMilitarNombre;
    private String personalMilitarCedula;
    private List<ReporteHistorialFichaDTO> fichas = new ArrayList<>();
}
