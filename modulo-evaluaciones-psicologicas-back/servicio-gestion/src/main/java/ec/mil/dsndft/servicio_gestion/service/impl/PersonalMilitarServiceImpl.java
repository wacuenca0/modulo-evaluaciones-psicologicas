package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarUpsertRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.enums.EstadoCivilEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.EtniaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.SeguroEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.SexoEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.TipoPersonaEnum;
import ec.mil.dsndft.servicio_gestion.model.mapper.PersonalMilitarMapper;
import ec.mil.dsndft.servicio_gestion.repository.PersonalMilitarRepository;
import ec.mil.dsndft.servicio_gestion.service.PersonalMilitarService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PersonalMilitarServiceImpl implements PersonalMilitarService {

    private final PersonalMilitarRepository repository;
    private final PersonalMilitarMapper mapper;

    @Override
    public List<PersonalMilitarDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PersonalMilitarDTO findById(Long id) {
        return repository.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado"));
    }

    @Override
    public Optional<PersonalMilitarDTO> findByCedula(String cedula) {
        if (cedula == null || cedula.isBlank()) {
            return Optional.empty();
        }
        return repository.findByCedulaIgnoreCase(cedula.trim())
            .map(mapper::toDTO);
    }

    @Override
    public Page<PersonalMilitarDTO> searchByApellidos(String apellidos, Pageable pageable) {
        if (apellidos == null || apellidos.isBlank()) {
            throw new IllegalArgumentException("Debe proporcionar apellidos para realizar la búsqueda");
        }
        String criterio = apellidos.trim();
        Page<PersonalMilitar> resultado = repository
            .findByApellidosNombresContainingIgnoreCaseOrderByApellidosNombresAsc(criterio, pageable);
        return resultado.map(mapper::toDTO);
    }

    @Override
    public Page<PersonalMilitarDTO> searchByNombreCompleto(String termino, Pageable pageable) {
        if (termino == null || termino.isBlank()) {
            throw new IllegalArgumentException("Debe proporcionar un nombre o apellido para realizar la búsqueda");
        }
        String criterio = termino.trim();
        Page<PersonalMilitar> resultado = repository
            .findByApellidosNombresContainingIgnoreCaseOrderByApellidosNombresAsc(criterio, pageable);
        return resultado.map(mapper::toDTO);
    }

    @Override
    public PersonalMilitarDTO create(PersonalMilitarUpsertRequestDTO request) {
        String normalizedCedula = normalize(request.getCedula());
        if (repository.existsByCedulaIgnoreCase(normalizedCedula)) {
            throw new IllegalArgumentException("La cédula ya está registrada");
        }
        PersonalMilitar entity = new PersonalMilitar();
        entity.setCedula(normalizedCedula);
        aplicarDatosPersona(entity, request);
        entity.setActivo(request.getActivo() == null || request.getActivo());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    public PersonalMilitarDTO update(Long id, PersonalMilitarUpsertRequestDTO request) {
        PersonalMilitar existente = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Personal militar no encontrado"));

        String normalizedCedula = normalize(request.getCedula());
        repository.findByCedulaIgnoreCase(normalizedCedula)
            .filter(persona -> !persona.getId().equals(id))
            .ifPresent(persona -> { throw new IllegalArgumentException("La cédula ya está registrada" ); });

        existente.setCedula(normalizedCedula);
        aplicarDatosPersona(existente, request);
        existente.setActivo(request.getActivo() == null || request.getActivo());
        existente.setUpdatedAt(LocalDateTime.now());
        return mapper.toDTO(repository.save(existente));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private void aplicarDatosPersona(PersonalMilitar entity, PersonalMilitarUpsertRequestDTO request) {
        entity.setApellidosNombres(normalize(request.getApellidosNombres()));
        String tipoPersona = resolverTipoPersona(request);
        entity.setTipoPersona(tipoPersona);
        entity.setEsMilitar(resolverEsMilitar(request, tipoPersona));
        LocalDate fechaNacimiento = resolverFechaNacimiento(request.getFechaNacimiento(), request.getEdad());
        entity.setFechaNacimiento(fechaNacimiento);
        entity.setEdad(resolverEdad(fechaNacimiento, request.getEdad()));
        entity.setSexo(SexoEnum.normalizeRequired(request.getSexo()));
        entity.setEtnia(resolveOptional(EtniaEnum.normalizeOptional(request.getEtnia()), request.getEtnia()));
        entity.setEstadoCivil(resolveOptional(EstadoCivilEnum.normalizeOptional(request.getEstadoCivil()), request.getEstadoCivil()));
        entity.setNroHijos(request.getNroHijos() != null ? request.getNroHijos() : 0);
        entity.setOcupacion(trimOrNull(request.getOcupacion()));
        aplicarCondicionServicio(entity, request);
        entity.setSeguro(resolveOptional(SeguroEnum.normalizeOptional(request.getSeguro()), request.getSeguro()));
        entity.setGrado(trimOrNull(request.getGrado()));
        entity.setEspecialidad(trimOrNull(request.getEspecialidad()));
        entity.setUnidadMilitar(trimOrNull(request.getUnidadMilitar()));
        entity.setProvincia(trimOrNull(request.getProvincia()));
        entity.setCanton(trimOrNull(request.getCanton()));
        entity.setParroquia(trimOrNull(request.getParroquia()));
        entity.setBarrioSector(trimOrNull(request.getBarrioSector()));
        entity.setTelefono(trimOrNull(request.getTelefono()));
        entity.setCelular(trimOrNull(request.getCelular()));
        entity.setEmail(trimOrNull(request.getEmail()));
    }

    private String trimOrNull(String value) {
        return value != null && !value.trim().isEmpty() ? value.trim() : null;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        return value.trim();
    }

    private String resolveOptional(String normalizedEnum, String originalValue) {
        if (normalizedEnum != null) {
            return normalizedEnum;
        }
        return trimOrNull(originalValue);
    }

    private LocalDate resolverFechaNacimiento(LocalDate fechaNacimiento, Integer edadDeclarada) {
        if (fechaNacimiento != null) {
            return fechaNacimiento;
        }
        if (edadDeclarada == null) {
            throw new IllegalArgumentException("Debe proporcionar edad o fecha de nacimiento");
        }
        if (edadDeclarada < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
        LocalDate referencia = LocalDate.now().minusYears(edadDeclarada);
        return referencia.withDayOfYear(1);
    }

    private int resolverEdad(LocalDate fechaNacimiento, Integer edadDeclarada) {
        int edadCalculada = calcularEdad(fechaNacimiento);
        if (edadDeclarada == null) {
            return edadCalculada;
        }
        if (edadDeclarada < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
        return edadDeclarada;
    }

    private String resolverTipoPersona(PersonalMilitarUpsertRequestDTO request) {
        Boolean esMilitar = request.getEsMilitar();
        String tipoPersona = trimOrNull(request.getTipoPersona());

        if (esMilitar != null) {
            if (esMilitar) {
                return TipoPersonaEnum.MILITAR.getCanonical();
            }
            String normalized = TipoPersonaEnum.normalizeOptional(tipoPersona);
            return normalized != null ? normalized : TipoPersonaEnum.CIVIL.getCanonical();
        }

        if (tipoPersona != null) {
            return TipoPersonaEnum.normalizeRequired(tipoPersona);
        }

        return TipoPersonaEnum.MILITAR.getCanonical();
    }

    private boolean resolverEsMilitar(PersonalMilitarUpsertRequestDTO request, String tipoPersonaCanonical) {
        if (request.getEsMilitar() != null) {
            return request.getEsMilitar();
        }
        return TipoPersonaEnum.MILITAR.getCanonical().equals(tipoPersonaCanonical);
    }

    private void aplicarCondicionServicio(PersonalMilitar entity, PersonalMilitarUpsertRequestDTO request) {
        Boolean servicioPasivo = request.getServicioPasivo();
        Boolean servicioActivo = request.getServicioActivo();

        if (Boolean.FALSE.equals(entity.getEsMilitar())) {
            if (servicioActivo == null && servicioPasivo == null) {
                entity.setServicioActivo(false);
                entity.setServicioPasivo(false);
                return;
            }
            entity.setServicioActivo(Boolean.TRUE.equals(servicioActivo));
            entity.setServicioPasivo(Boolean.TRUE.equals(servicioPasivo));
            return;
        }

        if (servicioPasivo == null && servicioActivo == null) {
            return;
        }

        if (servicioPasivo != null) {
            entity.setServicioPasivo(servicioPasivo);
            entity.setServicioActivo(Boolean.FALSE.equals(servicioPasivo) && (servicioActivo == null || servicioActivo));
            return;
        }

        entity.setServicioActivo(servicioActivo);
        entity.setServicioPasivo(Boolean.TRUE.equals(servicioActivo) ? Boolean.FALSE : Boolean.TRUE);
    }

    private int calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            throw new IllegalArgumentException("La fecha de nacimiento es obligatoria para calcular la edad");
        }
        LocalDate hoy = LocalDate.now();
        int edad = hoy.getYear() - fechaNacimiento.getYear();
        if (hoy.getDayOfYear() < fechaNacimiento.getDayOfYear()) {
            edad--;
        }
        return Math.max(edad, 0);
    }
}