package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.HistoriaPasadaEnfermedadDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.HospitalizacionRehabilitacionDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.ObservacionClinicaSectionDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisInfanciaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisNatalDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisPrenatalDTO;
import ec.mil.dsndft.servicio_gestion.model.value.TransferenciaInfo;

import java.time.LocalDate;
import java.util.List;

public interface FichaPsicologicaMapper {

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
        dto.setHistoriaPasadaEnfermedad(mapHistoriaPasada(observacion.getHistoriaPasadaEnfermedad()));
        return dto;
    }

    default HistoriaPasadaEnfermedadDTO mapHistoriaPasada(ec.mil.dsndft.servicio_gestion.model.value.HistoriaPasadaEnfermedad historia) {
        if (historia == null) {
            return null;
        }
        HistoriaPasadaEnfermedadDTO dto = new HistoriaPasadaEnfermedadDTO();
        dto.setDescripcion(historia.getDescripcion());
        dto.setTomaMedicacion(historia.getTomaMedicacion());
        dto.setTipoMedicacion(historia.getTipoMedicacion());
        dto.setHospitalizacionRehabilitacion(mapHospitalizacion(historia.getHospitalizacionRehabilitacion()));
        return dto;
    }

    default HospitalizacionRehabilitacionDTO mapHospitalizacion(ec.mil.dsndft.servicio_gestion.model.value.HospitalizacionRehabilitacion hospitalizacion) {
        if (hospitalizacion == null) {
            return null;
        }
        HospitalizacionRehabilitacionDTO dto = new HospitalizacionRehabilitacionDTO();
        dto.setRequiere(hospitalizacion.getRequiere());
        dto.setTipo(hospitalizacion.getTipo());
        dto.setDuracion(hospitalizacion.getDuracion());
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

    default Long mapDiagnosticoId(ec.mil.dsndft.servicio_gestion.entity.CatalogoDiagnosticoCie10 diagnosticoCatalogo) {
        return diagnosticoCatalogo != null ? diagnosticoCatalogo.getId() : null;
    }

    default String mapDiagnosticoDescripcion(ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10 diagnostico) {
        return diagnostico != null ? diagnostico.getDescripcion() : null;
    }

    default String mapDiagnosticoNombre(ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10 diagnostico) {
        return diagnostico != null ? diagnostico.getNombre() : null;
    }

    default String mapDiagnosticoCategoriaPadre(ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10 diagnostico) {
        return diagnostico != null ? diagnostico.getCategoriaPadre() : null;
    }

    default Integer mapDiagnosticoNivel(ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10 diagnostico) {
        return diagnostico != null ? diagnostico.getNivel() : null;
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

    default LocalDate mapTransferenciaFecha(TransferenciaInfo transferencia) {
        return transferencia != null ? transferencia.getFechaTransferencia() : null;
    }

    default String mapTransferenciaUnidad(TransferenciaInfo transferencia) {
        return transferencia != null ? transferencia.getUnidadDestino() : null;
    }

    default String mapTransferenciaObservacion(TransferenciaInfo transferencia) {
        return transferencia != null ? transferencia.getObservacion() : null;
    }
}