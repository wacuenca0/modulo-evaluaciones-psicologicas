package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import ec.mil.dsndft.servicio_gestion.model.value.TransferenciaInfo;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class FichaPsicologicaMapperImpl implements FichaPsicologicaMapper {

    @Override
    public FichaPsicologicaDTO toDTO(FichaPsicologica entity) {
        if (entity == null) {
            return null;
        }

        FichaPsicologicaDTO dto = new FichaPsicologicaDTO();
        dto.setId(entity.getId());
        if (entity.getPersonalMilitar() != null) {
            dto.setPersonalMilitarId(entity.getPersonalMilitar().getId());
            dto.setPersonalMilitarNombre(entity.getPersonalMilitar().getApellidosNombres());
            dto.setPersonalMilitarCedula(entity.getPersonalMilitar().getCedula());
        }
        if (entity.getPsicologo() != null) {
            dto.setPsicologoId(entity.getPsicologo().getId());
            dto.setPsicologoNombre(entity.getPsicologo().getApellidosNombres());
            dto.setPsicologoUsername(entity.getPsicologo().getUsername());
        }
        if (entity.getCreadoPor() != null) {
            dto.setCreadoPorId(entity.getCreadoPor().getId());
            dto.setCreadoPorNombre(entity.getCreadoPor().getApellidosNombres());
            dto.setCreadoPorUsername(entity.getCreadoPor().getUsername());
        }
        if (entity.getActualizadoPor() != null) {
            dto.setActualizadoPorId(entity.getActualizadoPor().getId());
            dto.setActualizadoPorNombre(entity.getActualizadoPor().getApellidosNombres());
            dto.setActualizadoPorUsername(entity.getActualizadoPor().getUsername());
        }
        dto.setNumeroEvaluacion(entity.getNumeroEvaluacion());
        dto.setFechaEvaluacion(entity.getFechaEvaluacion());
        dto.setTipoEvaluacion(mapTipoEvaluacion(entity.getTipoEvaluacion()));
        dto.setSeccionObservacion(mapObservacion(entity.getSeccionObservacion()));
        dto.setSeccionPrenatal(mapPrenatal(entity.getSeccionPrenatal()));
        dto.setSeccionNatal(mapNatal(entity.getSeccionNatal()));
        dto.setSeccionInfancia(mapInfancia(entity.getSeccionInfancia()));
        dto.setEstado(mapEstado(entity.getEstado()));
        dto.setCondicion(mapCondicion(entity.getCondicionClinica()));
        dto.setDiagnosticoCie10Id(mapDiagnosticoId(entity.getDiagnosticoCie10Catalogo()));
        dto.setDiagnosticoCie10Codigo(mapDiagnosticoCodigo(entity.getDiagnosticoCie10()));
        dto.setDiagnosticoCie10Nombre(mapDiagnosticoNombre(entity.getDiagnosticoCie10()));
        dto.setDiagnosticoCie10CategoriaPadre(mapDiagnosticoCategoriaPadre(entity.getDiagnosticoCie10()));
        dto.setDiagnosticoCie10Nivel(mapDiagnosticoNivel(entity.getDiagnosticoCie10()));
        dto.setDiagnosticoCie10Descripcion(mapDiagnosticoDescripcion(entity.getDiagnosticoCie10()));
        dto.setPlanFrecuencia(mapPlanFrecuencia(entity.getPlanSeguimiento()));
        dto.setPlanTipoSesion(mapPlanTipoSesion(entity.getPlanSeguimiento()));
        dto.setPlanDetalle(mapPlanDetalle(entity.getPlanSeguimiento()));
        dto.setUltimaFechaSeguimiento(entity.getUltimaFechaSeguimiento());
        dto.setProximoSeguimiento(entity.getProximoSeguimiento());
        TransferenciaInfo transferencia = entity.getTransferenciaInfo();
        if (transferencia != null) {
            dto.setTransferenciaFecha(transferencia.getFechaTransferencia());
            dto.setTransferenciaUnidad(transferencia.getUnidadDestino());
            dto.setTransferenciaObservacion(transferencia.getObservacion());
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public List<FichaPsicologicaDTO> toDTOs(List<FichaPsicologica> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
            .filter(Objects::nonNull)
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
}
