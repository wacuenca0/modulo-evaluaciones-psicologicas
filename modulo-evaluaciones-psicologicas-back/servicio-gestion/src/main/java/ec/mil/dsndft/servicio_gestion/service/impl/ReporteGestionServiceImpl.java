package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.FichaHistorica;
import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteAtencionPsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteHistorialFichaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReportePersonalDiagnosticoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.reportes.ReporteSeguimientoTransferenciaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10DTO;
import ec.mil.dsndft.servicio_gestion.repository.FichaPsicologicaRepository;
import ec.mil.dsndft.servicio_gestion.repository.FichaHistoricaRepository;
import ec.mil.dsndft.servicio_gestion.repository.PersonalMilitarRepository;
import ec.mil.dsndft.servicio_gestion.repository.PsicologoRepository;
import ec.mil.dsndft.servicio_gestion.repository.SeguimientoPsicologicoRepository;
import ec.mil.dsndft.servicio_gestion.service.ReporteGestionService;
import ec.mil.dsndft.servicio_gestion.service.support.AuthenticatedPsicologoProvider;
import ec.mil.dsndft.servicio_gestion.model.mapper.SeguimientoPsicologicoMapper;
import ec.mil.dsndft.servicio_gestion.service.CatalogoDiagnosticoCie10Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteGestionServiceImpl implements ReporteGestionService {

    private final PsicologoRepository psicologoRepository;
    private final FichaPsicologicaRepository fichaPsicologicaRepository;
    private final AuthenticatedPsicologoProvider psicologoAutenticadoProvider;
    private final PersonalMilitarRepository personalMilitarRepository;
    private final FichaHistoricaRepository fichaHistoricaRepository;
    private final SeguimientoPsicologicoRepository seguimientoPsicologicoRepository;
    private final SeguimientoPsicologicoMapper seguimientoPsicologicoMapper;
    private final CatalogoDiagnosticoCie10Service catalogoDiagnosticoCie10Service;

    @Override
    @Transactional(readOnly = true)
    public List<ReporteAtencionPsicologoDTO> obtenerAtencionesPorPsicologo(Long psicologoId,
                                                                           LocalDate fechaDesde,
                                                                           LocalDate fechaHasta,
                                                                           Long diagnosticoId,
                                                                           String cedula,
                                                                           String unidadMilitar) {
        validarRangoFechas(fechaDesde, fechaHasta);

        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        CatalogoDiagnosticoCie10DTO diagnostico = resolverDiagnostico(diagnosticoId);
        Long diagnosticoFiltro = diagnostico != null ? diagnostico.getId() : null;
        String unidadFiltro = normalizarFiltro(unidadMilitar);
        String cedulaFiltro = normalizarCedula(cedula);

        List<ReporteAtencionPsicologoDTO> resultado = psicologoRepository
            .obtenerReporteAtenciones(psicologoFiltro, fechaDesde, fechaHasta, diagnosticoFiltro, cedulaFiltro, unidadFiltro);

        resultado.forEach(dto -> {
            dto.setFiltroDiagnosticoId(diagnosticoFiltro);
            dto.setFiltroDiagnosticoCodigo(diagnostico != null ? diagnostico.getCodigo() : null);
            dto.setFiltroDiagnosticoTexto(diagnostico != null ? diagnostico.getDescripcion() : null);
            dto.setFiltroCedula(cedulaFiltro);
            dto.setFiltroUnidadMilitar(unidadFiltro);
            dto.setFiltroFechaDesde(fechaDesde);
            dto.setFiltroFechaHasta(fechaHasta);
        });

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteSeguimientoTransferenciaDTO> obtenerPersonasEnSeguimientoOTransferencia(Long psicologoId,
                                                                                               LocalDate fechaDesde,
                                                                                               LocalDate fechaHasta,
                                                                                               String cedula,
                                                                                               String unidadMilitar) {
        validarRangoFechas(fechaDesde, fechaHasta);

        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        String unidadFiltro = normalizarFiltro(unidadMilitar);
        String cedulaFiltro = normalizarCedula(cedula);

        List<ReporteSeguimientoTransferenciaDTO> resultado = fichaPsicologicaRepository
            .obtenerSeguimientoOTransferencia(psicologoFiltro, fechaDesde, fechaHasta, cedulaFiltro, unidadFiltro);

        resultado.forEach(dto -> {
            dto.setFiltroCedula(cedulaFiltro);
            dto.setFiltroUnidadMilitar(unidadFiltro);
            dto.setFiltroFechaDesde(fechaDesde);
            dto.setFiltroFechaHasta(fechaHasta);
            if (dto.getCondicionClinica() != null) {
                dto.setCondicionClinicaCanonical(dto.getCondicionClinica().getCanonical());
            } else {
                dto.setCondicionClinicaCanonical(null);
            }
        });

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportePersonalDiagnosticoDTO> obtenerReportePersonalDiagnostico(LocalDate fechaDesde,
                                                                                 LocalDate fechaHasta,
                                                                                 Long diagnosticoId,
                                                                                 String cedula,
                                                                                 String grado,
                                                                                 String unidadMilitar) {
        validarRangoFechas(fechaDesde, fechaHasta);

        CatalogoDiagnosticoCie10DTO diagnostico = resolverDiagnostico(diagnosticoId);
        Long diagnosticoFiltro = diagnostico != null ? diagnostico.getId() : null;
        String gradoFiltro = normalizarFiltro(grado);
        String unidadFiltro = normalizarFiltro(unidadMilitar);
        String cedulaFiltro = normalizarCedula(cedula);

        List<ReportePersonalDiagnosticoDTO> resultado = fichaPsicologicaRepository
            .obtenerReportePersonalDiagnostico(fechaDesde, fechaHasta, diagnosticoFiltro, cedulaFiltro, gradoFiltro, unidadFiltro);

        resultado.forEach(dto -> {
            dto.setFiltroFechaDesde(fechaDesde);
            dto.setFiltroFechaHasta(fechaHasta);
            dto.setFiltroDiagnosticoId(diagnosticoFiltro);
            dto.setFiltroDiagnosticoCodigo(diagnostico != null ? diagnostico.getCodigo() : null);
            dto.setFiltroDiagnosticoTexto(diagnostico != null ? diagnostico.getDescripcion() : null);
            dto.setFiltroCedula(cedulaFiltro);
            dto.setFiltroGrado(gradoFiltro);
            dto.setFiltroUnidadMilitar(unidadFiltro);
        });

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteHistorialFichaDTO> obtenerHistorialFichas(Long personalMilitarId,
                                                                 String cedula,
                                                                 boolean incluirSeguimientos) {
        PersonalMilitar personal = resolverPersonal(personalMilitarId, cedula);
        Long personalId = personal.getId();
        String cedulaFiltro = personal.getCedula() != null ? personal.getCedula() : normalizarCedula(cedula);

        Long filtroPersonalId = personalMilitarId != null ? personalMilitarId : personalId;

        List<ReporteHistorialFichaDTO> registros = new ArrayList<>();

        List<FichaPsicologica> fichasActuales = fichaPsicologicaRepository
            .findByPersonalMilitarIdOrderByFechaEvaluacionDesc(personalId);

        for (FichaPsicologica ficha : fichasActuales) {
            ReporteHistorialFichaDTO dto = new ReporteHistorialFichaDTO();
            dto.setOrigen("ACTUAL");
            dto.setPersonalMilitarId(personalId);
            PersonalMilitar personalFicha = ficha.getPersonalMilitar();
            if (personalFicha != null) {
                dto.setPersonalMilitarCedula(personalFicha.getCedula());
                dto.setPersonalMilitarNombre(personalFicha.getApellidosNombres());
            } else {
                dto.setPersonalMilitarCedula(personal.getCedula());
                dto.setPersonalMilitarNombre(personal.getApellidosNombres());
            }
            dto.setFichaId(ficha.getId());
            dto.setNumeroFicha(ficha.getNumeroEvaluacion());
            dto.setFechaEvaluacion(ficha.getFechaEvaluacion());
            dto.setEstadoFicha(ficha.getEstado() != null ? ficha.getEstado().getCanonical() : null);
            dto.setCondicionClinica(ficha.getCondicionClinica() != null ? ficha.getCondicionClinica().getCanonical() : null);
            if (ficha.getDiagnosticoCie10() != null) {
                dto.setDiagnosticoCodigo(ficha.getDiagnosticoCie10().getCodigo());
                dto.setDiagnosticoNombre(ficha.getDiagnosticoCie10().getNombre());
                dto.setDiagnosticoCategoriaPadre(ficha.getDiagnosticoCie10().getCategoriaPadre());
                dto.setDiagnosticoNivel(ficha.getDiagnosticoCie10().getNivel());
                dto.setDiagnosticoDescripcion(ficha.getDiagnosticoCie10().getDescripcion());
            }
            if (ficha.getPsicologo() != null) {
                dto.setPsicologoId(ficha.getPsicologo().getId());
                dto.setPsicologoNombre(ficha.getPsicologo().getApellidosNombres());
                dto.setPsicologoUnidadMilitar(ficha.getPsicologo().getUnidadMilitar());
            }

            long totalSeguimientos = seguimientoPsicologicoRepository.countByFichaPsicologicaId(ficha.getId());
            dto.setSeguimientosCantidad(totalSeguimientos);
            dto.setTieneSeguimientos(totalSeguimientos > 0);
            dto.setFiltroPersonalMilitarId(filtroPersonalId);
            dto.setFiltroCedula(cedulaFiltro);
            dto.setFiltroIncluirSeguimientos(incluirSeguimientos);

            if (incluirSeguimientos && totalSeguimientos > 0) {
                List<SeguimientoPsicologicoDTO> seguimientos = seguimientoPsicologicoMapper.toDTOs(
                    seguimientoPsicologicoRepository.findByFichaPsicologicaIdOrderByFechaSeguimientoAsc(ficha.getId())
                );
                dto.setSeguimientos(seguimientos);
            }

            registros.add(dto);
        }

        if (personal.getCedula() != null && !personal.getCedula().isBlank()) {
            List<FichaHistorica> historicas = fichaHistoricaRepository
                .findByNumeroCedulaOrderByFechaEvaluacionDesc(personal.getCedula().trim());

            for (FichaHistorica historica : historicas) {
                ReporteHistorialFichaDTO dto = new ReporteHistorialFichaDTO();
                dto.setOrigen("HISTORICO");
                dto.setPersonalMilitarId(personalId);
                dto.setPersonalMilitarCedula(personal.getCedula());
                dto.setPersonalMilitarNombre(personal.getApellidosNombres());
                dto.setFichaHistoricaId(historica.getId());
                dto.setNumeroFicha(historica.getNumeroFicha());
                dto.setFechaEvaluacion(historica.getFechaEvaluacion());
                dto.setEstadoFicha(historica.getEstadoFicha());
                dto.setCondicionClinica(historica.getEstadoFicha());
                dto.setDiagnosticoDescripcion(historica.getDiagnosticoCie10());
                dto.setSeguimientosCantidad(0L);
                dto.setTieneSeguimientos(false);
                dto.setFiltroPersonalMilitarId(filtroPersonalId);
                dto.setFiltroCedula(cedulaFiltro);
                dto.setFiltroIncluirSeguimientos(incluirSeguimientos);
                registros.add(dto);
            }
        }

        return registros.stream()
            .sorted(Comparator.comparing(ReporteHistorialFichaDTO::getFechaEvaluacion,
                Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(ReporteHistorialFichaDTO::getNumeroFicha, Comparator.nullsLast(String::compareTo)))
            .collect(Collectors.toList());
    }

    private void validarRangoFechas(LocalDate fechaDesde, LocalDate fechaHasta) {
        if (fechaDesde != null && fechaHasta != null && fechaDesde.isAfter(fechaHasta)) {
            throw new IllegalArgumentException("La fecha inicial no puede ser posterior a la fecha final");
        }
    }

    private CatalogoDiagnosticoCie10DTO resolverDiagnostico(Long diagnosticoId) {
        if (diagnosticoId == null) {
            return null;
        }
        return catalogoDiagnosticoCie10Service.obtenerPorId(diagnosticoId);
    }

    private PersonalMilitar resolverPersonal(Long personalMilitarId, String cedula) {
        if (personalMilitarId != null) {
            PersonalMilitar personal = personalMilitarRepository.findById(personalMilitarId)
                .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado"));
            String cedulaNormalizada = normalizarCedula(cedula);
            if (cedulaNormalizada != null && personal.getCedula() != null
                && !personal.getCedula().equalsIgnoreCase(cedulaNormalizada)) {
                throw new IllegalArgumentException("La cédula indicada no coincide con el registro del personal");
            }
            return personal;
        }

        String cedulaNormalizada = normalizarCedula(cedula);
        if (cedulaNormalizada == null) {
            throw new IllegalArgumentException("Debe proporcionar el identificador del personal o la cédula");
        }

        return personalMilitarRepository.findByCedulaIgnoreCase(cedulaNormalizada)
            .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado para la cédula indicada"));
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

    private String normalizarFiltro(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizarCedula(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed.toUpperCase(Locale.ROOT);
    }
}
