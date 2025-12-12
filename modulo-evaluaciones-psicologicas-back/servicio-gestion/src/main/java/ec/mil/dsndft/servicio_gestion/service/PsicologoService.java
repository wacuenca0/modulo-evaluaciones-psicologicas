package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.PsicologoDTO;
import java.util.List;

public interface PsicologoService {
    List<PsicologoDTO> findAll();
    PsicologoDTO findById(Long id);
    PsicologoDTO save(PsicologoDTO dto);
    void deleteById(Long id);
}