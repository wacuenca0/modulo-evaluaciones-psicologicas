package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.entity.SeguimientoPsicologico;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.mapper.SeguimientoPsicologicoMapper;
import ec.mil.dsndft.servicio_gestion.repository.FichaPsicologicaRepository;
import ec.mil.dsndft.servicio_gestion.repository.SeguimientoPsicologicoRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class SeguimientoPsicologicoServiceImpl implements SeguimientoPsicologicoService {

    private final SeguimientoPsicologicoRepository seguimientoRepository;
    private final FichaPsicologicaRepository fichaPsicologicaRepository;
    private final SeguimientoPsicologicoMapper mapper;
    private final FichaCondicionManager fichaCondicionManager;
    private final AuthenticatedPsicologoProvider psicologoAutenticadoProvider;

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
        return mapper.toDTO(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        SeguimientoPsicologico seguimiento = seguimientoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Seguimiento psicológico no encontrado"));
        seguimientoRepository.delete(seguimiento);
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
        fichaCondicionManager.aplicarCondicionOpcional(
            ficha,
            request.getCondicionFicha(),
            request.getDiagnosticoCie10Codigo(),
            request.getDiagnosticoCie10Descripcion(),
            request.getPlanFrecuencia(),
            request.getPlanTipoSesion(),
            request.getPlanDetalle()
        );
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
    }

    private boolean tieneDatosCondicion(SeguimientoPsicologicoRequestDTO request) {
        return esTextoConContenido(request.getCondicionFicha())
            || esTextoConContenido(request.getDiagnosticoCie10Codigo())
            || esTextoConContenido(request.getDiagnosticoCie10Descripcion())
            || esTextoConContenido(request.getPlanFrecuencia())
            || esTextoConContenido(request.getPlanTipoSesion())
            || esTextoConContenido(request.getPlanDetalle());
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
}
