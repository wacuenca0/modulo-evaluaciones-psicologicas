package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.CatalogoDiagnosticoCie10;
import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.entity.SeguimientoPsicologico;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.FrecuenciaSeguimientoEnum;
import ec.mil.dsndft.servicio_gestion.model.mapper.SeguimientoPsicologicoMapper;
import ec.mil.dsndft.servicio_gestion.model.value.PlanSeguimiento;
import ec.mil.dsndft.servicio_gestion.model.value.TransferenciaInfo;
import ec.mil.dsndft.servicio_gestion.repository.FichaPsicologicaRepository;
import ec.mil.dsndft.servicio_gestion.repository.SeguimientoPsicologicoRepository;
import ec.mil.dsndft.servicio_gestion.repository.CatalogoDiagnosticoCie10Repository;
import ec.mil.dsndft.servicio_gestion.service.SeguimientoPsicologicoService;
import ec.mil.dsndft.servicio_gestion.service.support.AuthenticatedPsicologoProvider;
import ec.mil.dsndft.servicio_gestion.service.support.FichaCondicionManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeguimientoPsicologicoServiceImpl implements SeguimientoPsicologicoService {

    private final SeguimientoPsicologicoRepository seguimientoRepository;
    private final FichaPsicologicaRepository fichaPsicologicaRepository;
    private final SeguimientoPsicologicoMapper mapper;
    private final FichaCondicionManager fichaCondicionManager;
    private final AuthenticatedPsicologoProvider psicologoAutenticadoProvider;
    private final CatalogoDiagnosticoCie10Repository catalogoDiagnosticoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SeguimientoPsicologicoDTO> listar(Long fichaPsicologicaId,
                                                  Long psicologoId,
                                                  Long personalMilitarId,
                                                  LocalDate fechaDesde,
                                                  LocalDate fechaHasta) {
        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        return mapper.toDTOs(
            seguimientoRepository.findByFilters(fichaPsicologicaId, psicologoFiltro, personalMilitarId, fechaDesde, fechaHasta)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SeguimientoPsicologicoDTO obtenerPorId(Long id) {
        SeguimientoPsicologico seguimiento = seguimientoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Seguimiento psicológico no encontrado"));
        return mapper.toDTO(seguimiento);
    }

    @Override
    @Transactional
    public SeguimientoPsicologicoDTO crear(SeguimientoPsicologicoRequestDTO request) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(request.getFichaPsicologicaId())
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));
        Psicologo psicologo = psicologoAutenticadoProvider.requireCurrent();

        validarPsicologoAsignado(psicologo, ficha);
        actualizarCondicionSiCorresponde(ficha, request);

        SeguimientoPsicologico nuevo = new SeguimientoPsicologico();
        nuevo.setFichaPsicologica(ficha);
        nuevo.setPsicologo(psicologo);
        nuevo.setFechaSeguimiento(normalizarFecha(request.getFechaSeguimiento()));
        nuevo.setObservaciones(normalizarObservaciones(request.getObservaciones()));
        nuevo.setCreatedAt(LocalDateTime.now());
        nuevo.setUpdatedAt(LocalDateTime.now());

        SeguimientoPsicologico guardado = seguimientoRepository.save(nuevo);
        seguimientoRepository.flush();
        actualizarProgramacionSeguimiento(ficha.getId(), request.getProximoSeguimiento());
        return mapper.toDTO(guardado);
    }

    @Override
    @Transactional
    public SeguimientoPsicologicoDTO actualizar(Long id, SeguimientoPsicologicoRequestDTO request) {
        SeguimientoPsicologico existente = seguimientoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Seguimiento psicológico no encontrado"));

        if (!existente.getFichaPsicologica().getId().equals(request.getFichaPsicologicaId())) {
            throw new IllegalArgumentException("No es posible cambiar la ficha psicológica asociada al seguimiento");
        }

        Psicologo psicologo = psicologoAutenticadoProvider.requireCurrent();

        FichaPsicologica ficha = existente.getFichaPsicologica();
        validarPsicologoAsignado(psicologo, ficha);
        actualizarCondicionSiCorresponde(ficha, request);

        existente.setPsicologo(psicologo);
        existente.setFechaSeguimiento(normalizarFecha(request.getFechaSeguimiento()));
        existente.setObservaciones(normalizarObservaciones(request.getObservaciones()));
        existente.setUpdatedAt(LocalDateTime.now());

        SeguimientoPsicologico actualizado = seguimientoRepository.save(existente);
        seguimientoRepository.flush();
        actualizarProgramacionSeguimiento(ficha.getId(), request.getProximoSeguimiento());
        return mapper.toDTO(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        SeguimientoPsicologico seguimiento = seguimientoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Seguimiento psicológico no encontrado"));
        Long fichaId = seguimiento.getFichaPsicologica() != null ? seguimiento.getFichaPsicologica().getId() : null;
        seguimientoRepository.delete(seguimiento);
        seguimientoRepository.flush();
        if (fichaId != null) {
            actualizarProgramacionSeguimiento(fichaId, null);
        }
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

        Psicologo actual = psicologoAutenticadoProvider.requireCurrent();
        if (solicitado != null && !solicitado.equals(actual.getId())) {
            log.warn("El filtro de psicólogo {} no coincide con el autenticado ({}). Se aplicará el autenticado.", solicitado, actual.getId());
        }
        return actual.getId();
    }

    private void actualizarCondicionSiCorresponde(FichaPsicologica ficha, SeguimientoPsicologicoRequestDTO request) {
        if (!tieneDatosCondicion(request)) {
            return;
        }
        CondicionClinicaEnum condicionSolicitada = CondicionClinicaEnum.normalizeOptional(request.getCondicionFicha());
        CatalogoDiagnosticoCie10 diagnosticoCatalogo = resolverDiagnosticoCatalogo(ficha, condicionSolicitada, request.getDiagnosticoCie10Id());
        fichaCondicionManager.aplicarCondicionOpcional(
            ficha,
            condicionSolicitada,
            diagnosticoCatalogo,
            request.getDiagnosticoCie10Codigo(),
            request.getDiagnosticoCie10Nombre(),
            request.getDiagnosticoCie10CategoriaPadre(),
            request.getDiagnosticoCie10Nivel(),
            request.getDiagnosticoCie10Descripcion(),
            request.getPlanFrecuencia(),
            request.getPlanTipoSesion(),
            request.getPlanDetalle()
        );
        aplicarMetadatosCondicion(
            ficha,
            condicionSolicitada,
            request.getProximoSeguimiento(),
            request.getTransferenciaUnidad(),
            request.getTransferenciaObservacion()
        );
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
    }

    private boolean tieneDatosCondicion(SeguimientoPsicologicoRequestDTO request) {
        return request.getDiagnosticoCie10Id() != null
            || esTextoConContenido(request.getCondicionFicha())
            || esTextoConContenido(request.getDiagnosticoCie10Codigo())
            || esTextoConContenido(request.getDiagnosticoCie10Nombre())
            || esTextoConContenido(request.getDiagnosticoCie10CategoriaPadre())
            || request.getDiagnosticoCie10Nivel() != null
            || esTextoConContenido(request.getDiagnosticoCie10Descripcion())
            || esTextoConContenido(request.getPlanFrecuencia())
            || esTextoConContenido(request.getPlanTipoSesion())
            || esTextoConContenido(request.getPlanDetalle())
            || request.getProximoSeguimiento() != null
            || esTextoConContenido(request.getTransferenciaUnidad())
            || esTextoConContenido(request.getTransferenciaObservacion());
    }

    private boolean esTextoConContenido(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private void validarPsicologoAsignado(Psicologo psicologo, FichaPsicologica ficha) {
        if (ficha.getPsicologo() == null) {
            throw new IllegalStateException("La ficha psicológica no tiene un psicólogo asignado");
        }
        if (!ficha.getPsicologo().getId().equals(psicologo.getId())) {
            throw new IllegalArgumentException("El psicólogo seleccionado no está asociado a la ficha psicológica");
        }
    }

    private LocalDate normalizarFecha(LocalDate fecha) {
        return fecha != null ? fecha : LocalDate.now();
    }

    private String normalizarObservaciones(String observaciones) {
        if (observaciones == null) {
            throw new IllegalArgumentException("Las observaciones del seguimiento no pueden estar vacías");
        }
        String trimmed = observaciones.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Las observaciones del seguimiento no pueden estar vacías");
        }
        return trimmed;
    }

    private CatalogoDiagnosticoCie10 resolverDiagnosticoCatalogo(FichaPsicologica ficha,
                                                                  CondicionClinicaEnum condicion,
                                                                  Long diagnosticoId) {
        boolean requiereDiagnostico = condicion != null && condicion.requierePlan();
        if (diagnosticoId == null) {
            if (requiereDiagnostico && ficha.getDiagnosticoCie10Catalogo() == null) {
                throw new IllegalArgumentException("Debe seleccionar un diagnóstico CIE-10 válido para la condición clínica");
            }
            return null;
        }

        return catalogoDiagnosticoRepository.findByIdAndActivoTrue(diagnosticoId)
            .orElseThrow(() -> new IllegalArgumentException("Diagnóstico CIE-10 no encontrado o inactivo"));
    }

    private void aplicarMetadatosCondicion(FichaPsicologica ficha,
                                           CondicionClinicaEnum condicionSolicitada,
                                           LocalDate proximoSeguimientoSolicitado,
                                           String transferenciaUnidad,
                                           String transferenciaObservacion) {
        CondicionClinicaEnum condicionActual = condicionSolicitada != null ? condicionSolicitada : ficha.getCondicionClinica();
        if (condicionActual == null) {
            return;
        }

        if (CondicionClinicaEnum.TRANSFERENCIA.equals(condicionActual)) {
            String unidad = trimOrNull(transferenciaUnidad);
            if (unidad == null) {
                throw new IllegalArgumentException("Debe indicar la unidad o lugar donde se realizó la transferencia");
            }
            TransferenciaInfo transferencia = Optional.ofNullable(ficha.getTransferenciaInfo())
                .orElseGet(TransferenciaInfo::new);
            transferencia.setUnidadDestino(unidad);
            transferencia.setObservacion(trimOrNull(transferenciaObservacion));
            transferencia.setFechaTransferencia(LocalDate.now());
            ficha.setTransferenciaInfo(transferencia);
            ficha.setProximoSeguimiento(null);
        } else {
            ficha.setTransferenciaInfo(null);
        }

        if (CondicionClinicaEnum.SEGUIMIENTO.equals(condicionActual) && proximoSeguimientoSolicitado != null) {
            ficha.setProximoSeguimiento(proximoSeguimientoSolicitado);
        } else if (!CondicionClinicaEnum.SEGUIMIENTO.equals(condicionActual)) {
            ficha.setProximoSeguimiento(null);
        }

        if (!CondicionClinicaEnum.SEGUIMIENTO.equals(condicionActual)) {
            if (!CondicionClinicaEnum.TRANSFERENCIA.equals(condicionActual)) {
                ficha.setUltimaFechaSeguimiento(null);
            }
        }
    }

    private void actualizarProgramacionSeguimiento(Long fichaId, LocalDate proximoSolicitado) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(fichaId)
            .orElse(null);
        if (ficha == null) {
            return;
        }

        CondicionClinicaEnum condicion = ficha.getCondicionClinica();
        if (condicion == null || !CondicionClinicaEnum.SEGUIMIENTO.equals(condicion)) {
            if (condicion == null || !CondicionClinicaEnum.TRANSFERENCIA.equals(condicion)) {
                ficha.setUltimaFechaSeguimiento(null);
            }
            ficha.setProximoSeguimiento(null);
            fichaPsicologicaRepository.save(ficha);
            return;
        }

        Optional<SeguimientoPsicologico> ultimo = seguimientoRepository
            .findTopByFichaPsicologicaIdOrderByFechaSeguimientoDescIdDesc(fichaId);
        LocalDate ultimaFecha = ultimo.map(SeguimientoPsicologico::getFechaSeguimiento).orElse(null);
        ficha.setUltimaFechaSeguimiento(ultimaFecha);

        LocalDate proximoCalculado = calcularProximoSeguimiento(ficha, ultimaFecha, proximoSolicitado);
        ficha.setProximoSeguimiento(proximoCalculado);
        fichaPsicologicaRepository.save(ficha);
    }

    private LocalDate calcularProximoSeguimiento(FichaPsicologica ficha,
                                                 LocalDate ultimaFechaSeguimiento,
                                                 LocalDate proximoSolicitado) {
        PlanSeguimiento plan = ficha.getPlanSeguimiento();
        if (plan == null || plan.getFrecuencia() == null) {
            return proximoSolicitado;
        }

        FrecuenciaSeguimientoEnum frecuencia = plan.getFrecuencia();
        if (FrecuenciaSeguimientoEnum.PERSONALIZADA.equals(frecuencia)) {
            if (proximoSolicitado == null) {
                throw new IllegalArgumentException("Debe proporcionar la próxima fecha de seguimiento para planes personalizados");
            }
            if (ultimaFechaSeguimiento != null && !proximoSolicitado.isAfter(ultimaFechaSeguimiento)) {
                throw new IllegalArgumentException("La próxima fecha de seguimiento debe ser posterior a la fecha registrada");
            }
            return proximoSolicitado;
        }

        LocalDate base = ultimaFechaSeguimiento != null ? ultimaFechaSeguimiento : ficha.getFechaEvaluacion();
        if (base == null) {
            base = LocalDate.now();
        }

        LocalDate calculada = switch (frecuencia) {
            case SEMANAL -> base.plusWeeks(1);
            case QUINCENAL -> base.plusDays(15);
            case MENSUAL -> base.plusMonths(1);
            case BIMESTRAL -> base.plusMonths(2);
            case TRIMESTRAL -> base.plusMonths(3);
            default -> base.plusWeeks(1);
        };

        if (proximoSolicitado != null && proximoSolicitado.isAfter(base)) {
            calculada = proximoSolicitado;
        }

        return calculada;
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
