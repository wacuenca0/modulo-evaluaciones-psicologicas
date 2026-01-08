package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaCondicionRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaDatosGeneralesRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaSeccionObservacionRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaSeccionPsicoanamnesisRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.GradoDiscapacidadEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.GradoSociabilidadEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.RelacionFamiliarEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.TipoEvaluacionEnum;
import ec.mil.dsndft.servicio_gestion.model.mapper.FichaPsicologicaMapper;
import ec.mil.dsndft.servicio_gestion.model.value.ObservacionClinica;
import ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisInfancia;
import ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisNatal;
import ec.mil.dsndft.servicio_gestion.model.value.PsicoanamnesisPrenatal;
import ec.mil.dsndft.servicio_gestion.repository.FichaPsicologicaRepository;
import ec.mil.dsndft.servicio_gestion.repository.PersonalMilitarRepository;
import ec.mil.dsndft.servicio_gestion.service.FichaPsicologicaService;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FichaPsicologicaServiceImpl implements FichaPsicologicaService {

    private final FichaPsicologicaRepository fichaPsicologicaRepository;
    private final PersonalMilitarRepository personalMilitarRepository;
    private final FichaPsicologicaMapper mapper;
    private final FichaCondicionManager fichaCondicionManager;
    private final AuthenticatedPsicologoProvider psicologoAutenticadoProvider;

    @Override
    @Transactional(readOnly = true)
    public List<FichaPsicologicaDTO> listar(Long psicologoId, Long personalMilitarId, String estado, String condicion, Boolean soloActivas) {
        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        EstadoFichaEnum estadoFiltro = resolveEstadoOptional(estado);
        CondicionClinicaEnum condicionFiltro = resolveCondicionOptional(condicion);
        return mapper.toDTOs(
            fichaPsicologicaRepository.findByFilters(psicologoFiltro, personalMilitarId, estadoFiltro, condicionFiltro, soloActivas)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<FichaPsicologicaDTO> listarPorCondicion(String condicion, Long psicologoId, Long personalMilitarId) {
        CondicionClinicaEnum condicionFiltro = resolveCondicionRequired(condicion);
        Long psicologoFiltro = ajustarFiltroPsicologo(psicologoId);
        return mapper.toDTOs(
            fichaPsicologicaRepository.findByFilters(psicologoFiltro, personalMilitarId, null, condicionFiltro, null)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FichaPsicologicaDTO obtenerPorId(Long id) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional(readOnly = true)
    public FichaPsicologicaDTO obtenerPorNumeroEvaluacion(String numeroEvaluacion) {
        if (numeroEvaluacion == null || numeroEvaluacion.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de evaluación es obligatorio");
        }
        FichaPsicologica ficha = fichaPsicologicaRepository.findByNumeroEvaluacion(numeroEvaluacion.trim())
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada para el número indicado"));
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO crearFicha(FichaDatosGeneralesRequestDTO request) {
        Psicologo psicologo = obtenerPsicologoAutenticado(null);
        PersonalMilitar personal = personalMilitarRepository.findById(request.getPersonalMilitarId())
            .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado"));

        FichaPsicologica ficha = new FichaPsicologica();
        ficha.setPsicologo(psicologo);
        ficha.setPersonalMilitar(personal);
        ficha.setNumeroEvaluacion(generarNumeroEvaluacionUnico());
        aplicarDatosGenerales(ficha, request);
        ficha.setCreatedAt(LocalDateTime.now());
        ficha.setUpdatedAt(LocalDateTime.now());

        FichaPsicologica guardada = fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(guardada);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO actualizarDatosGenerales(Long id, FichaDatosGeneralesRequestDTO request) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        Psicologo psicologo = obtenerPsicologoAutenticado(ficha.getPsicologo());
        PersonalMilitar personal = personalMilitarRepository.findById(request.getPersonalMilitarId())
            .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado"));

        ficha.setPsicologo(psicologo);
        ficha.setPersonalMilitar(personal);
        aplicarDatosGenerales(ficha, request);
        ficha.setUpdatedAt(LocalDateTime.now());

        FichaPsicologica guardada = fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(guardada);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO guardarSeccionObservacion(Long id, FichaSeccionObservacionRequestDTO request) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        aplicarSeccionObservacion(ficha, request);
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO guardarSeccionPsicoanamnesis(Long id, FichaSeccionPsicoanamnesisRequestDTO request) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        aplicarSeccionPsicoanamnesis(ficha, request);
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO actualizarCondicion(Long id, FichaCondicionRequestDTO request) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        fichaCondicionManager.aplicarCondicionObligatoria(
            ficha,
            request.getCondicion(),
            request.getDiagnosticoCie10Codigo(),
            request.getDiagnosticoCie10Descripcion(),
            request.getPlanFrecuencia(),
            request.getPlanTipoSesion(),
            request.getPlanDetalle()
        );
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO actualizarEstado(Long id, String estado) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));
        obtenerPsicologoAutenticado(ficha.getPsicologo());
        ficha.setEstado(resolveEstadoRequired(estado));
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO eliminarSeccionObservacion(Long id) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        ficha.setSeccionObservacion(null);
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO eliminarSeccionPsicoanamnesis(Long id) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        ficha.setSeccionPrenatal(null);
        ficha.setSeccionNatal(null);
        ficha.setSeccionInfancia(null);
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO limpiarCondicionClinica(Long id) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        ficha.setCondicionClinica(CondicionClinicaEnum.ALTA);
        ficha.setDiagnosticoCie10(null);
        ficha.setPlanSeguimiento(null);
        ficha.setUpdatedAt(LocalDateTime.now());
        fichaPsicologicaRepository.save(ficha);
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional
    public FichaPsicologicaDTO finalizarFicha(Long id) {
        FichaPsicologica ficha = fichaPsicologicaRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ficha psicológica no encontrada"));

        obtenerPsicologoAutenticado(ficha.getPsicologo());
        if (!EstadoFichaEnum.CERRADA.equals(ficha.getEstado())) {
            ficha.setEstado(EstadoFichaEnum.CERRADA);
            ficha.setUpdatedAt(LocalDateTime.now());
            fichaPsicologicaRepository.save(ficha);
        }
        return mapper.toDTO(ficha);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FichaPsicologicaDTO> obtenerHistorialPorPersonal(Long personalMilitarId) {
        if (personalMilitarId == null) {
            throw new IllegalArgumentException("El identificador del personal militar es obligatorio");
        }
        boolean existe = personalMilitarRepository.existsById(personalMilitarId);
        if (!existe) {
            throw new EntityNotFoundException("Personal militar no encontrado");
        }
        List<FichaPsicologica> fichas = fichaPsicologicaRepository
            .findByPersonalMilitarIdOrderByFechaEvaluacionDesc(personalMilitarId);
        return mapper.toDTOs(fichas);
    }

    private void aplicarDatosGenerales(FichaPsicologica ficha, FichaDatosGeneralesRequestDTO request) {
        ficha.setFechaEvaluacion(normalizarFecha(request.getFechaEvaluacion()));
        ficha.setTipoEvaluacion(resolveTipoEvaluacion(request.getTipoEvaluacion()));
        ficha.setEstado(resolveEstadoRequired(request.getEstado()));
    }

    private void aplicarSeccionObservacion(FichaPsicologica ficha, FichaSeccionObservacionRequestDTO request) {
        if (ficha.getSeccionObservacion() == null) {
            ficha.setSeccionObservacion(new ObservacionClinica());
        }
        ficha.getSeccionObservacion().setObservacionClinica(request.getObservacionClinica().trim());
        ficha.getSeccionObservacion().setMotivoConsulta(request.getMotivoConsulta().trim());
        ficha.getSeccionObservacion().setEnfermedadActual(trimOrNull(request.getEnfermedadActual()));
    }

    private void aplicarSeccionPsicoanamnesis(FichaPsicologica ficha, FichaSeccionPsicoanamnesisRequestDTO request) {
        if (request.getPrenatal() != null) {
            if (ficha.getSeccionPrenatal() == null) {
                ficha.setSeccionPrenatal(new PsicoanamnesisPrenatal());
            }
            ficha.getSeccionPrenatal().setCondicionesBiologicasPadres(trimOrNull(request.getPrenatal().getCondicionesBiologicasPadres()));
            ficha.getSeccionPrenatal().setCondicionesPsicologicasPadres(trimOrNull(request.getPrenatal().getCondicionesPsicologicasPadres()));
            ficha.getSeccionPrenatal().setObservacion(trimOrNull(request.getPrenatal().getObservacion()));
        }

        if (request.getNatal() != null) {
            if (ficha.getSeccionNatal() == null) {
                ficha.setSeccionNatal(new PsicoanamnesisNatal());
            }
            ficha.getSeccionNatal().setPartoNormal(request.getNatal().getPartoNormal());
            ficha.getSeccionNatal().setTermino(trimOrNull(request.getNatal().getTermino()));
            ficha.getSeccionNatal().setComplicaciones(trimOrNull(request.getNatal().getComplicaciones()));
            ficha.getSeccionNatal().setObservacion(trimOrNull(request.getNatal().getObservacion()));
        }

        if (request.getInfancia() != null) {
            if (ficha.getSeccionInfancia() == null) {
                ficha.setSeccionInfancia(new PsicoanamnesisInfancia());
            }
            ficha.getSeccionInfancia().setGradoSociabilidad(resolveGradoSociabilidad(request.getInfancia().getGradoSociabilidad()));
            ficha.getSeccionInfancia().setRelacionPadresHermanos(resolveRelacionFamiliar(request.getInfancia().getRelacionPadresHermanos()));
            ficha.getSeccionInfancia().setDiscapacidadIntelectual(request.getInfancia().getDiscapacidadIntelectual());
            ficha.getSeccionInfancia().setGradoDiscapacidad(resolveGradoDiscapacidad(request.getInfancia().getGradoDiscapacidad()));
            ficha.getSeccionInfancia().setTrastornos(trimOrNull(request.getInfancia().getTrastornos()));
            ficha.getSeccionInfancia().setTratamientosPsicologicosPsiquiatricos(request.getInfancia().getTratamientosPsicologicosPsiquiatricos());
            ficha.getSeccionInfancia().setObservacion(trimOrNull(request.getInfancia().getObservacion()));
        }
    }

    private String generarNumeroEvaluacionUnico() {
        String numero;
        do {
            numero = generarNumeroEvaluacion();
        } while (fichaPsicologicaRepository.existsByNumeroEvaluacion(numero));
        return numero;
    }

    private String generarNumeroEvaluacion() {
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return "FIC-" + LocalDate.now().toString().replaceAll("-", "") + "-" + token;
    }

    private LocalDate normalizarFecha(LocalDate fecha) {
        return fecha != null ? fecha : LocalDate.now();
    }

    private String trimOrNull(String value) {
        return value != null && !value.trim().isEmpty() ? value.trim() : null;
    }

    private TipoEvaluacionEnum resolveTipoEvaluacion(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return TipoEvaluacionEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Tipo de evaluación no soportado: " + raw));
    }

    private GradoSociabilidadEnum resolveGradoSociabilidad(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return GradoSociabilidadEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Grado de sociabilidad no soportado: " + raw));
    }

    private RelacionFamiliarEnum resolveRelacionFamiliar(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return RelacionFamiliarEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Relación familiar no soportada: " + raw));
    }

    private GradoDiscapacidadEnum resolveGradoDiscapacidad(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return GradoDiscapacidadEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Grado de discapacidad no soportado: " + raw));
    }

    private EstadoFichaEnum resolveEstadoRequired(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("El estado o condición es obligatorio");
        }
        return EstadoFichaEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Estado de ficha no soportado: " + raw));
    }

    private EstadoFichaEnum resolveEstadoOptional(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return EstadoFichaEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Estado de ficha no soportado: " + raw));
    }

    private CondicionClinicaEnum resolveCondicionOptional(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return CondicionClinicaEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Condición clínica no soportada: " + raw));
    }

    private CondicionClinicaEnum resolveCondicionRequired(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("La condición clínica es obligatoria");
        }
        return CondicionClinicaEnum.from(raw)
            .orElseThrow(() -> new IllegalArgumentException("Condición clínica no soportada: " + raw));
    }

    private Psicologo obtenerPsicologoAutenticado(Psicologo actual) {
        Psicologo psicologo = psicologoAutenticadoProvider.requireCurrent();
        if (actual != null && actual.getId() != null && !actual.getId().equals(psicologo.getId())) {
            throw new EntityNotFoundException("Psicólogo no coincide con el usuario autenticado");
        }
        return psicologo;
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

}
