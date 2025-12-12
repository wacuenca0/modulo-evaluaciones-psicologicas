package ec.mil.dsndft.servicio_documentos.service;

import ec.mil.dsndft.servicio_documentos.model.dto.TipoDocumentoDTO;

import java.util.List;

public interface TipoDocumentoService {
    List<TipoDocumentoDTO> findAll();
    TipoDocumentoDTO findById(Long id);
    TipoDocumentoDTO create(TipoDocumentoDTO dto);
    TipoDocumentoDTO update(Long id, TipoDocumentoDTO dto);
    void delete(Long id);
}
