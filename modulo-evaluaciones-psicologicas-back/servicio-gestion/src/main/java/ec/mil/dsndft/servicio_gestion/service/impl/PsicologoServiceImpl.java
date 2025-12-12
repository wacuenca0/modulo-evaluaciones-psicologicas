package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicologoDTO;
import ec.mil.dsndft.servicio_gestion.model.mapper.PsicologoMapper;
import ec.mil.dsndft.servicio_gestion.repository.PsicologoRepository;
import ec.mil.dsndft.servicio_gestion.service.PsicologoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PsicologoServiceImpl implements PsicologoService {

    private final PsicologoRepository repository;
    private final PsicologoMapper mapper;

    @Override
    public List<PsicologoDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PsicologoDTO findById(Long id) {
        return repository.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Psicologo not found"));
    }

    @Override
    public PsicologoDTO save(PsicologoDTO dto) {
        Psicologo entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}