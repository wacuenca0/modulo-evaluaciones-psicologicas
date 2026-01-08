package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.entity.SeguimientoPsicologico;
import ec.mil.dsndft.servicio_gestion.model.dto.ObservacionClinicaSectionDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisInfanciaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisNatalDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicoanamnesisPrenatalDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.DistribucionCategoriaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteEpidemiologiaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialFichaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalObservacionDTO;
import ec.mil.dsndft.servicio_gestion.model.mapper.SeguimientoPsicologicoMapper;
import ec.mil.dsndft.servicio_gestion.repository.FichaPsicologicaRepository;
import ec.mil.dsndft.servicio_gestion.repository.PersonalMilitarRepository;
import ec.mil.dsndft.servicio_gestion.repository.PsicologoRepository;
import ec.mil.dsndft.servicio_gestion.repository.SeguimientoPsicologicoRepository;
import ec.mil.dsndft.servicio_gestion.service.ReporteGestionService;
import ec.mil.dsndft.servicio_gestion.service.support.AuthenticatedPsicologoProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteGestionServiceImpl implements ReporteGestionService {

    private final PsicologoRepository psicologoRepository;
    private final FichaPsicologicaRepository fichaPsicologicaRepository;
    private final SeguimientoPsicologicoRepository seguimientoPsicologicoRepository;
    private final PersonalMilitarRepository personalMilitarRepository;
    private final SeguimientoPsicologicoMapper seguimientoPsicologicoMapper;
    private final AuthenticatedPsicologoProvider psicologoAutenticadoProvider;

    @Override
    @Transactional(readOnly = true)
    public List<ReporteAtencionPsicologoDTO> obtenerAtencionesPorPsicologo(Long psicologoId,
                                                                           LocalDate fechaDesde,
                                                                           LocalDate fechaHasta,
                                                                           String diagnosticoCodigo,
                                                                           String diagnosticoTexto) {
        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        String codigoFiltro = normalizarFiltro(diagnosticoCodigo);
        String textoFiltro = normalizarFiltro(diagnosticoTexto);

        List<ReporteAtencionPsicologoDTO> resultado = psicologoRepository
            .obtenerReporteAtenciones(psicologoFiltro, fechaDesde, fechaHasta, codigoFiltro, textoFiltro);

        resultado.forEach(dto -> {
            dto.setFiltroDiagnosticoCodigo(codigoFiltro);
            dto.setFiltroDiagnosticoTexto(textoFiltro);
        });

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportePersonalObservacionDTO> obtenerPersonalEnObservacion(Long psicologoId,
                                                                            LocalDate fechaDesde,
                                                                            LocalDate fechaHasta) {
        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        return fichaPsicologicaRepository.obtenerPersonalEnObservacion(psicologoFiltro, fechaDesde, fechaHasta);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteEpidemiologiaDTO obtenerEstadisticaEpidemiologica(LocalDate fechaDesde, LocalDate fechaHasta) {
        Object[] indicadores = fichaPsicologicaRepository.obtenerIndicadoresEpidemiologicos(fechaDesde, fechaHasta);
        ReporteEpidemiologiaDTO dto = new ReporteEpidemiologiaDTO();
        if (indicadores != null && indicadores.length >= 7) {
            dto.setTotalFichas(toLong(indicadores[0]));
            dto.setPersonasEvaluadas(toLong(indicadores[1]));
            dto.setFichasActivas(toLong(indicadores[2]));
            dto.setFichasObservacion(toLong(indicadores[3]));
            dto.setConDiscapacidadIntelectual(toLong(indicadores[4]));
            dto.setConTrastornos(toLong(indicadores[5]));
            dto.setConTratamientosPsicologicos(toLong(indicadores[6]));
        }

        List<Object[]> porSexo = fichaPsicologicaRepository.obtenerDistribucionPorSexo(fechaDesde, fechaHasta);
        dto.setDistribucionPorSexo(porSexo.stream()
            .map(row -> new DistribucionCategoriaDTO(formatCategoria(row[0]), toLong(row[1])))
            .collect(Collectors.toList()));

        List<Object[]> porEstado = fichaPsicologicaRepository.obtenerDistribucionPorEstado(fechaDesde, fechaHasta);
        dto.setDistribucionPorEstado(porEstado.stream()
            .map(row -> new DistribucionCategoriaDTO(formatCategoria(row[0]), toLong(row[1])))
            .collect(Collectors.toList()));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteHistorialPsicologicoDTO obtenerHistorialPsicologico(Long personalMilitarId, boolean incluirSeguimientos) {
        PersonalMilitar personal = personalMilitarRepository.findById(personalMilitarId)
            .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado"));

        List<FichaPsicologica> fichas = fichaPsicologicaRepository
            .findByPersonalMilitarIdOrderByFechaEvaluacionDesc(personalMilitarId);

        ReporteHistorialPsicologicoDTO historial = new ReporteHistorialPsicologicoDTO();
        historial.setPersonalMilitarId(personal.getId());
        historial.setPersonalMilitarNombre(personal.getApellidosNombres());
        historial.setPersonalMilitarCedula(personal.getCedula());

        historial.setFichas(fichas.stream()
            .map(ficha -> mapFicha(ficha, incluirSeguimientos))
            .collect(Collectors.toList()));

        return historial;
    }

    private Long ajustarFiltroPsicologo(Long solicitado) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return solicitado;
        }

        boolean esAdmin = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMINISTRADOR".equalsIgnoreCase(authority.getAuthority()));
        if (esAdmin) {
            return solicitado;
        }

        boolean esPsicologo = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_PSICOLOGO".equalsIgnoreCase(authority.getAuthority()));
        if (!esPsicologo) {
            return solicitado;
        }

        return psicologoAutenticadoProvider.findCurrent()
            .map(psicologo -> {
                if (solicitado != null && !solicitado.equals(psicologo.getId())) {
                    log.warn("El filtro de psicólogo {} no coincide con el autenticado ({}). Se aplicará el autenticado.", solicitado, psicologo.getId());
                }
                return psicologo.getId();
            })
            .orElse(solicitado);
    }

    private ReporteHistorialFichaDTO mapFicha(FichaPsicologica ficha, boolean incluirSeguimientos) {
        ReporteHistorialFichaDTO dto = new ReporteHistorialFichaDTO();
        dto.setFichaId(ficha.getId());
        dto.setFechaEvaluacion(ficha.getFechaEvaluacion());
        dto.setEstado(ficha.getEstado() != null ? ficha.getEstado().getCanonical() : null);
        dto.setTipoEvaluacion(ficha.getTipoEvaluacion() != null ? ficha.getTipoEvaluacion().getCanonical() : null);
        dto.setPsicologoId(Objects.nonNull(ficha.getPsicologo()) ? ficha.getPsicologo().getId() : null);
        dto.setPsicologoNombre(Objects.nonNull(ficha.getPsicologo()) ? ficha.getPsicologo().getApellidosNombres() : null);
        dto.setCondicion(ficha.getCondicionClinica() != null ? ficha.getCondicionClinica().getCanonical() : null);
        if (ficha.getDiagnosticoCie10() != null) {
            dto.setDiagnosticoCodigo(ficha.getDiagnosticoCie10().getCodigo());
            dto.setDiagnosticoDescripcion(ficha.getDiagnosticoCie10().getDescripcion());
        }
        if (ficha.getPlanSeguimiento() != null) {
            dto.setPlanFrecuencia(ficha.getPlanSeguimiento().getFrecuencia() != null
                ? ficha.getPlanSeguimiento().getFrecuencia().getCanonical()
                : null);
            dto.setPlanTipoSesion(ficha.getPlanSeguimiento().getTipoSesion() != null
                ? ficha.getPlanSeguimiento().getTipoSesion().getCanonical()
                : null);
            dto.setPlanDetalle(ficha.getPlanSeguimiento().getDetalle());
        }
        if (ficha.getSeccionObservacion() != null) {
            ObservacionClinicaSectionDTO observacion = new ObservacionClinicaSectionDTO();
            observacion.setObservacionClinica(ficha.getSeccionObservacion().getObservacionClinica());
            observacion.setMotivoConsulta(ficha.getSeccionObservacion().getMotivoConsulta());
            observacion.setEnfermedadActual(ficha.getSeccionObservacion().getEnfermedadActual());
            dto.setSeccionObservacion(observacion);
        }
        if (ficha.getSeccionPrenatal() != null) {
            PsicoanamnesisPrenatalDTO prenatal = new PsicoanamnesisPrenatalDTO();
            prenatal.setCondicionesBiologicasPadres(ficha.getSeccionPrenatal().getCondicionesBiologicasPadres());
            prenatal.setCondicionesPsicologicasPadres(ficha.getSeccionPrenatal().getCondicionesPsicologicasPadres());
            prenatal.setObservacion(ficha.getSeccionPrenatal().getObservacion());
            dto.setSeccionPrenatal(prenatal);
        }
        if (ficha.getSeccionNatal() != null) {
            PsicoanamnesisNatalDTO natal = new PsicoanamnesisNatalDTO();
            natal.setPartoNormal(ficha.getSeccionNatal().getPartoNormal());
            natal.setTermino(ficha.getSeccionNatal().getTermino());
            natal.setComplicaciones(ficha.getSeccionNatal().getComplicaciones());
            natal.setObservacion(ficha.getSeccionNatal().getObservacion());
            dto.setSeccionNatal(natal);
        }
        if (ficha.getSeccionInfancia() != null) {
            PsicoanamnesisInfanciaDTO infancia = new PsicoanamnesisInfanciaDTO();
            infancia.setGradoSociabilidad(ficha.getSeccionInfancia().getGradoSociabilidad() != null
                ? ficha.getSeccionInfancia().getGradoSociabilidad().getCanonical()
                : null);
            infancia.setRelacionPadresHermanos(ficha.getSeccionInfancia().getRelacionPadresHermanos() != null
                ? ficha.getSeccionInfancia().getRelacionPadresHermanos().getCanonical()
                : null);
            infancia.setDiscapacidadIntelectual(ficha.getSeccionInfancia().getDiscapacidadIntelectual());
            infancia.setGradoDiscapacidad(ficha.getSeccionInfancia().getGradoDiscapacidad() != null
                ? ficha.getSeccionInfancia().getGradoDiscapacidad().getCanonical()
                : null);
            infancia.setTrastornos(ficha.getSeccionInfancia().getTrastornos());
            infancia.setTratamientosPsicologicosPsiquiatricos(ficha.getSeccionInfancia().getTratamientosPsicologicosPsiquiatricos());
            infancia.setObservacion(ficha.getSeccionInfancia().getObservacion());
            dto.setSeccionInfancia(infancia);
        }
        dto.setCreadaEn(ficha.getCreatedAt());
        dto.setActualizadaEn(ficha.getUpdatedAt());

        if (incluirSeguimientos) {
            List<SeguimientoPsicologico> seguimientos = seguimientoPsicologicoRepository
                .findByFichaPsicologicaIdOrderByFechaSeguimientoAsc(ficha.getId());
            List<SeguimientoPsicologicoDTO> seguimientoDTOs = seguimientoPsicologicoMapper.toDTOs(seguimientos);
            dto.setSeguimientos(seguimientoDTOs);
        }

        return dto;
    }

    private long toLong(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private String formatCategoria(Object value) {
        if (value == null) {
            return "SIN_REGISTRO";
        }
        String text = value instanceof ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum estadoFicha
            ? estadoFicha.getCanonical()
            : value.toString().trim();
        if (text.isEmpty()) {
            return "SIN_REGISTRO";
        }
        return text.toUpperCase(Locale.ROOT);
    }

    private String normalizarFiltro(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
