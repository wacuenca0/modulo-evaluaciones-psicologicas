package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarDTO;
import ec.mil.dsndft.servicio_gestion.model.mapper.PersonalMilitarMapper;
import ec.mil.dsndft.servicio_gestion.repository.PersonalMilitarRepository;
import ec.mil.dsndft.servicio_gestion.service.PersonalMilitarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
                .orElseThrow(() -> new RuntimeException("Personal Militar not found"));
    }

    @Override
    public PersonalMilitarDTO save(PersonalMilitarDTO dto) {
        PersonalMilitar entity = mapper.toEntity(dto);
        entity.setActivo(dto.getActivo() != null && dto.getActivo());
        entity.setUpdatedAt(LocalDateTime.now());
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}