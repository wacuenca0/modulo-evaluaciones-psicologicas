package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.mapper.PsicologoMapper;
import ec.mil.dsndft.servicio_gestion.repository.PsicologoRepository;
import ec.mil.dsndft.servicio_gestion.service.PsicologoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PsicologoServiceImpl implements PsicologoService {

    private final PsicologoRepository repository;
    private final PsicologoMapper mapper;

    @Override
    public List<PsicologoDTO> findAll() {
        return repository.findByActivoTrueOrderByApellidosNombresAsc()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Override
    public PsicologoDTO findById(Long id) {
        return repository.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Psicólogo no encontrado"));
    }

    @Override
    public PsicologoDTO save(PsicologoDTO dto) {
        Psicologo entity;
        if (dto.getId() != null) {
            entity = repository.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Psicólogo no encontrado"));
            mapper.updateEntity(entity, dto);
        } else {
            entity = mapper.toEntity(dto);
        }
        if (entity.getCedula() == null || entity.getCedula().isBlank()) {
            throw new IllegalArgumentException("La cédula del psicólogo es obligatoria");
        }
        if (entity.getUsuarioId() == null) {
            throw new IllegalArgumentException("El identificador del usuario asociado es obligatorio");
        }
        if (entity.getUsername() == null || entity.getUsername().isBlank()) {
            throw new IllegalArgumentException("El username del psicólogo es obligatorio");
        }
        entity.refreshNombreCompleto();
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        Psicologo entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Psicólogo no encontrado"));
        entity.setActivo(Boolean.FALSE);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }
}