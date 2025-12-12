package ec.mil.dsndft.servicio_documentos.service.impl;

import ec.mil.dsndft.servicio_documentos.entity.FichaHistorica;
import ec.mil.dsndft.servicio_documentos.entity.enums.EstadoFicha;
import ec.mil.dsndft.servicio_documentos.model.dto.FichaHistoricaDTO;
import ec.mil.dsndft.servicio_documentos.model.mapper.FichaHistoricaMapper;
import ec.mil.dsndft.servicio_documentos.repository.FichaHistoricaRepository;
import ec.mil.dsndft.servicio_documentos.service.FichaHistoricaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FichaHistoricaServiceImpl implements FichaHistoricaService {

    private final FichaHistoricaRepository fichaHistoricaRepository;
    private final FichaHistoricaMapper fichaHistoricaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<FichaHistoricaDTO> findByCedulaPersonal(String cedulaPersonal) {
        return fichaHistoricaRepository.findByDatosIdentificacionNumeroCedulaOrderByFechaEvaluacionDesc(cedulaPersonal)
                .stream()
                .map(fichaHistoricaMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FichaHistoricaDTO findById(Long id) {
        return fichaHistoricaMapper.toDTO(getFichaHistorica(id));
    }

    @Override
    public FichaHistoricaDTO create(FichaHistoricaDTO dto) {
        FichaHistorica entity = fichaHistoricaMapper.toEntity(dto);
        entity.setId(null);
        if (entity.getEstadoFicha() == null) {
            entity.setEstadoFicha(EstadoFicha.BORRADOR);
        }
        if (entity.getFechaEvaluacion() == null) {
            entity.setFechaEvaluacion(LocalDate.now());
        }
        FichaHistorica saved = fichaHistoricaRepository.save(entity);
        return fichaHistoricaMapper.toDTO(saved);
    }

    @Override
    public FichaHistoricaDTO update(Long id, FichaHistoricaDTO dto) {
        FichaHistorica entity = getFichaHistorica(id);
        fichaHistoricaMapper.updateFromDto(dto, entity);
        if (entity.getEstadoFicha() == null) {
            entity.setEstadoFicha(EstadoFicha.BORRADOR);
        }
        if (entity.getFechaEvaluacion() == null) {
            entity.setFechaEvaluacion(LocalDate.now());
        }
        FichaHistorica updated = fichaHistoricaRepository.save(entity);
        return fichaHistoricaMapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        fichaHistoricaRepository.deleteById(id);
    }

    private FichaHistorica getFichaHistorica(Long id) {
        return fichaHistoricaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FichaHistorica not found with id " + id));
    }
}
