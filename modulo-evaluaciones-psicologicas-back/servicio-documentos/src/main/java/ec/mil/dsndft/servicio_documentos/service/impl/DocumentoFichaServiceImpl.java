package ec.mil.dsndft.servicio_documentos.service.impl;

import ec.mil.dsndft.servicio_documentos.entity.DocumentoFicha;
import ec.mil.dsndft.servicio_documentos.entity.FichaHistorica;
import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import ec.mil.dsndft.servicio_documentos.model.dto.DocumentoFichaDTO;
import ec.mil.dsndft.servicio_documentos.model.mapper.DocumentoFichaMapper;
import ec.mil.dsndft.servicio_documentos.repository.DocumentoFichaRepository;
import ec.mil.dsndft.servicio_documentos.repository.FichaHistoricaRepository;
import ec.mil.dsndft.servicio_documentos.repository.TipoDocumentoRepository;
import ec.mil.dsndft.servicio_documentos.service.DocumentoFichaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentoFichaServiceImpl implements DocumentoFichaService {

    private final DocumentoFichaRepository documentoFichaRepository;
    private final FichaHistoricaRepository fichaHistoricaRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final DocumentoFichaMapper documentoFichaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoFichaDTO> findActivosByFicha(Long fichaId) {
        return documentoFichaRepository.findByFichaIdAndActivoTrue(fichaId)
                .stream()
                .map(documentoFichaMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentoFichaDTO findById(Long id) {
        return documentoFichaMapper.toDTO(getDocumentoFicha(id));
    }

    @Override
    public DocumentoFichaDTO create(DocumentoFichaDTO dto) {
        TipoDocumento tipoDocumento = resolveTipoDocumento(dto.getTipoDocumentoId());
        DocumentoFicha entity = documentoFichaMapper.toEntity(dto);
        entity.setId(null);
        entity.setTipoDocumento(tipoDocumento);
        entity.setFicha(resolveFicha(dto.getFichaId()));
        if (entity.getActivo() == null) {
            entity.setActivo(Boolean.TRUE);
        }
        DocumentoFicha saved = documentoFichaRepository.save(entity);
        return documentoFichaMapper.toDTO(saved);
    }

    @Override
    public DocumentoFichaDTO update(Long id, DocumentoFichaDTO dto) {
        DocumentoFicha entity = getDocumentoFicha(id);
        if (dto.getTipoDocumentoId() != null) {
            entity.setTipoDocumento(resolveTipoDocumento(dto.getTipoDocumentoId()));
        }
        if (dto.getFichaId() != null && (entity.getFicha() == null || !dto.getFichaId().equals(entity.getFicha().getId()))) {
            entity.setFicha(resolveFicha(dto.getFichaId()));
        }
        entity.setNombreArchivo(dto.getNombreArchivo());
        entity.setRutaArchivo(dto.getRutaArchivo());
        entity.setDescripcion(dto.getDescripcion());
        entity.setFechaSubida(dto.getFechaSubida());
        entity.setTamano(dto.getTamano());
        if (dto.getActivo() != null) {
            entity.setActivo(dto.getActivo());
        }
        DocumentoFicha updated = documentoFichaRepository.save(entity);
        return documentoFichaMapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        DocumentoFicha entity = getDocumentoFicha(id);
        entity.setActivo(Boolean.FALSE);
        documentoFichaRepository.save(entity);
    }

    private DocumentoFicha getDocumentoFicha(Long id) {
        return documentoFichaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DocumentoFicha not found with id " + id));
    }

    private TipoDocumento resolveTipoDocumento(Long tipoDocumentoId) {
        if (tipoDocumentoId == null) {
            throw new IllegalArgumentException("tipoDocumentoId is required");
        }
        return tipoDocumentoRepository.findById(tipoDocumentoId)
                .orElseThrow(() -> new IllegalArgumentException("TipoDocumento not found with id " + tipoDocumentoId));
    }

    private FichaHistorica resolveFicha(Long fichaId) {
        if (fichaId == null) {
            throw new IllegalArgumentException("fichaId is required");
        }
        return fichaHistoricaRepository.findById(fichaId)
                .orElseThrow(() -> new IllegalArgumentException("FichaHistorica not found with id " + fichaId));
    }
}
