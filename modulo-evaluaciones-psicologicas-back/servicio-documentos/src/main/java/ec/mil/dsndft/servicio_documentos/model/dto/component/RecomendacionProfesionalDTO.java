package ec.mil.dsndft.servicio_documentos.model.dto.component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecomendacionProfesionalDTO {
    private String planIntervencion;
    private String objetivosTerapeuticos;
    private String intervencionesPropuestas;
    private String derivaciones;
    private String recomendacionesGenerales;
    private LocalDate fechaProximaCita;
    private String responsableNombre;
    private String responsableCargo;
    private String responsableIdentificacion;
    private String firmaDigitalHash;
    private String observacionesFinales;
}
