package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarDTO;
import java.util.List;

public interface PersonalMilitarService {
    List<PersonalMilitarDTO> findAll();
    PersonalMilitarDTO findById(Long id);
    PersonalMilitarDTO save(PersonalMilitarDTO dto);
    void deleteById(Long id);
}