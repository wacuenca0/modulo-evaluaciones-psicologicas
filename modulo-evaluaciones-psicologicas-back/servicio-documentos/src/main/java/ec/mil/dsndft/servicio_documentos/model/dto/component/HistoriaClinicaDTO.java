package ec.mil.dsndft.servicio_documentos.model.dto.component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriaClinicaDTO {
    private String antecedentesPersonales;
    private String antecedentesFamiliares;
    private String enfermedadesActuales;
    private String tratamientosPrevios;
    private String cirugiasPrevias;
    private String hospitalizacionesPrevias;
    private String alergias;
    private String medicacionActual;
    private String consumoSustancias;
    private String habitosSalud;
    private String suenoDescripcion;
    private Integer horasSueno;
    private String alimentacion;
    private String actividadFisica;
}
