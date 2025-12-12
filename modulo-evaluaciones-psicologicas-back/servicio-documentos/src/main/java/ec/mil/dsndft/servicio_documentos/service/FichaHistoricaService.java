package ec.mil.dsndft.servicio_documentos.service;

import ec.mil.dsndft.servicio_documentos.model.dto.FichaHistoricaDTO;

import java.util.List;

public interface FichaHistoricaService {
    List<FichaHistoricaDTO> findByCedulaPersonal(String cedulaPersonal);
    FichaHistoricaDTO findById(Long id);
    FichaHistoricaDTO create(FichaHistoricaDTO dto);
    FichaHistoricaDTO update(Long id, FichaHistoricaDTO dto);
    void delete(Long id);
}
