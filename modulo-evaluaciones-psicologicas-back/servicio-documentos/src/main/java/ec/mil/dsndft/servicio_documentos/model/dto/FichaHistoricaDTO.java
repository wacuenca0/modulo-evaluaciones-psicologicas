package ec.mil.dsndft.servicio_documentos.model.dto;

import ec.mil.dsndft.servicio_documentos.entity.enums.EstadoFicha;
import ec.mil.dsndft.servicio_documentos.model.dto.component.DatosIdentificacionDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.EvaluacionPsicologicaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.HistoriaClinicaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.HistoriaPsicologicaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.RecomendacionProfesionalDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FichaHistoricaDTO {
    private Long id;
    private DatosIdentificacionDTO datosIdentificacion;
    private HistoriaClinicaDTO historiaClinica;
    private HistoriaPsicologicaDTO historiaPsicologica;
    private EvaluacionPsicologicaDTO evaluacionPsicologica;
    private RecomendacionProfesionalDTO recomendacionProfesional;
    private EstadoFicha estadoFicha;
    private LocalDate fechaEvaluacion;
    private String psicologoResponsable;
    private String dependenciaSolicitante;
    private String observacionesGenerales;
    private String creadoPor;
    private String actualizadoPor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
