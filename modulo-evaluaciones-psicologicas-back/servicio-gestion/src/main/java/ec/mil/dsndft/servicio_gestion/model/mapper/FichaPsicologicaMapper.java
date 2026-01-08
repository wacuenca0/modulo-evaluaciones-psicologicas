package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.ObservacionClinicaSectionDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisInfanciaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisNatalDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisPrenatalDTO;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, builder = @Builder(disableBuilder = true))
public interface FichaPsicologicaMapper {

    @Mapping(target = "personalMilitarId", source = "personalMilitar.id")
    @Mapping(target = "personalMilitarNombre", source = "personalMilitar.apellidosNombres")
    @Mapping(target = "personalMilitarCedula", source = "personalMilitar.cedula")
    @Mapping(target = "psicologoId", source = "psicologo.id")
    @Mapping(target = "psicologoNombre", source = "psicologo.apellidosNombres")
    @Mapping(target = "psicologoUsername", source = "psicologo.username")
    @Mapping(target = "tipoEvaluacion", expression = "java(mapTipoEvaluacion(entity.getTipoEvaluacion()))")
    @Mapping(target = "seccionObservacion", expression = "java(mapObservacion(entity.getSeccionObservacion()))")
    @Mapping(target = "seccionPrenatal", expression = "java(mapPrenatal(entity.getSeccionPrenatal()))")
    @Mapping(target = "seccionNatal", expression = "java(mapNatal(entity.getSeccionNatal()))")
    @Mapping(target = "seccionInfancia", expression = "java(mapInfancia(entity.getSeccionInfancia()))")
    @Mapping(target = "estado", expression = "java(mapEstado(entity.getEstado()))")
    @Mapping(target = "condicion", expression = "java(mapCondicion(entity.getCondicionClinica()))")
    @Mapping(target = "diagnosticoCie10Codigo", expression = "java(mapDiagnosticoCodigo(entity.getDiagnosticoCie10()))")
    @Mapping(target = "diagnosticoCie10Descripcion", expression = "java(mapDiagnosticoDescripcion(entity.getDiagnosticoCie10()))")
    @Mapping(target = "planFrecuencia", expression = "java(mapPlanFrecuencia(entity.getPlanSeguimiento()))")
    @Mapping(target = "planTipoSesion", expression = "java(mapPlanTipoSesion(entity.getPlanSeguimiento()))")
    @Mapping(target = "planDetalle", expression = "java(mapPlanDetalle(entity.getPlanSeguimiento()))")
    FichaPsicologicaDTO toDTO(FichaPsicologica entity);

    List<FichaPsicologicaDTO> toDTOs(List<FichaPsicologica> entities);

    default String mapTipoEvaluacion(ec.mil.dsndft.servicio_gestion.model.enums.TipoEvaluacionEnum tipo) {
        return tipo != null ? tipo.getCanonical() : null;
    }

    default String mapEstado(ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum estado) {
        return estado != null ? estado.getCanonical() : null;
    }

    default String mapCondicion(ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum condicion) {
        return condicion != null ? condicion.getCanonical() : null;
    }

    default ObservacionClinicaSectionDTO mapObservacion(ec.mil.dsndft.servicio_gestion.model.value.ObservacionClinica observacion) {
        if (observacion == null) {
            return null;
        }
        ObservacionClinicaSectionDTO dto = new ObservacionClinicaSectionDTO();
        dto.setObservacionClinica(observacion.getObservacionClinica());
        dto.setMotivoConsulta(observacion.getMotivoConsulta());
        dto.setEnfermedadActual(observacion.getEnfermedadActual());
        return dto;
    }

    default PsicoanamnesisPrenatalDTO mapPrenatal(ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisPrenatal prenatal) {
        if (prenatal == null) {
            return null;
        }
        PsicoanamnesisPrenatalDTO dto = new PsicoanamnesisPrenatalDTO();
        dto.setCondicionesBiologicasPadres(prenatal.getCondicionesBiologicasPadres());
        dto.setCondicionesPsicologicasPadres(prenatal.getCondicionesPsicologicasPadres());
        dto.setObservacion(prenatal.getObservacion());
        return dto;
    }

    default PsicoanamnesisNatalDTO mapNatal(ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisNatal natal) {
        if (natal == null) {
            return null;
        }
        PsicoanamnesisNatalDTO dto = new PsicoanamnesisNatalDTO();
        dto.setPartoNormal(natal.getPartoNormal());
        dto.setTermino(natal.getTermino());
        dto.setComplicaciones(natal.getComplicaciones());
        dto.setObservacion(natal.getObservacion());
        return dto;
    }

    default PsicoanamnesisInfanciaDTO mapInfancia(ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisInfancia infancia) {
        if (infancia == null) {
            return null;
        }
        PsicoanamnesisInfanciaDTO dto = new PsicoanamnesisInfanciaDTO();
        dto.setGradoSociabilidad(infancia.getGradoSociabilidad() != null ? infancia.getGradoSociabilidad().getCanonical() : null);
        dto.setRelacionPadresHermanos(infancia.getRelacionPadresHermanos() != null ? infancia.getRelacionPadresHermanos().getCanonical() : null);
        dto.setDiscapacidadIntelectual(infancia.getDiscapacidadIntelectual());
        dto.setGradoDiscapacidad(infancia.getGradoDiscapacidad() != null ? infancia.getGradoDiscapacidad().getCanonical() : null);
        dto.setTrastornos(infancia.getTrastornos());
        dto.setTratamientosPsicologicosPsiquiatricos(infancia.getTratamientosPsicologicosPsiquiatricos());
        dto.setObservacion(infancia.getObservacion());
        return dto;
    }

    default String mapDiagnosticoCodigo(ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10 diagnostico) {
        return diagnostico != null ? diagnostico.getCodigo() : null;
    }

    default String mapDiagnosticoDescripcion(ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10 diagnostico) {
        return diagnostico != null ? diagnostico.getDescripcion() : null;
    }

    default String mapPlanFrecuencia(ec.mil.dsndft.servicio_gestion.model.value.PlanSeguimiento plan) {
        return plan != null && plan.getFrecuencia() != null ? plan.getFrecuencia().getCanonical() : null;
    }

    default String mapPlanTipoSesion(ec.mil.dsndft.servicio_gestion.model.value.PlanSeguimiento plan) {
        return plan != null && plan.getTipoSesion() != null ? plan.getTipoSesion().getCanonical() : null;
    }

    default String mapPlanDetalle(ec.mil.dsndft.servicio_gestion.model.value.PlanSeguimiento plan) {
        return plan != null ? plan.getDetalle() : null;
    }
}