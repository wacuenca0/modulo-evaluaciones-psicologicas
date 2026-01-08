package ec.mil.dsndft.servicio_documentos.service;

import ec.mil.dsndft.servicio_documentos.model.dto.DocumentoFichaDTO;

import java.util.List;

public interface DocumentoFichaService {
    List<DocumentoFichaDTO> findActivosByFicha(Long fichaId);
    List<DocumentoFichaDTO> findActivosBySeguimiento(Long seguimientoId);
    DocumentoFichaDTO findById(Long id);
    DocumentoFichaDTO create(DocumentoFichaDTO dto);
    DocumentoFichaDTO update(Long id, DocumentoFichaDTO dto);
    void delete(Long id);
}
