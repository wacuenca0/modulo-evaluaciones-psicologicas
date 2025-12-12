package ec.mil.dsndft.servicio_documentos.service.impl;

import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import ec.mil.dsndft.servicio_documentos.model.dto.TipoDocumentoDTO;
import ec.mil.dsndft.servicio_documentos.model.mapper.TipoDocumentoMapper;
import ec.mil.dsndft.servicio_documentos.repository.TipoDocumentoRepository;
import ec.mil.dsndft.servicio_documentos.service.TipoDocumentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TipoDocumentoServiceImpl implements TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final TipoDocumentoMapper tipoDocumentoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TipoDocumentoDTO> findAll() {
        return tipoDocumentoRepository.findAll().stream()
                .map(tipoDocumentoMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TipoDocumentoDTO findById(Long id) {
        return tipoDocumentoMapper.toDTO(getTipoDocumento(id));
    }

    @Override
    public TipoDocumentoDTO create(TipoDocumentoDTO dto) {
        TipoDocumento entity = tipoDocumentoMapper.toEntity(dto);
        entity.setId(null);
        if (entity.getObligatorio() == null) {
            entity.setObligatorio(Boolean.FALSE);
        }
        TipoDocumento saved = tipoDocumentoRepository.save(entity);
        return tipoDocumentoMapper.toDTO(saved);
    }

    @Override
    public TipoDocumentoDTO update(Long id, TipoDocumentoDTO dto) {
        TipoDocumento entity = getTipoDocumento(id);
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        if (dto.getObligatorio() != null) {
            entity.setObligatorio(dto.getObligatorio());
        }
        TipoDocumento updated = tipoDocumentoRepository.save(entity);
        return tipoDocumentoMapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        tipoDocumentoRepository.deleteById(id);
    }

    private TipoDocumento getTipoDocumento(Long id) {
        return tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("TipoDocumento not found with id " + id));
    }
}
