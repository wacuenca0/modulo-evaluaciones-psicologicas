package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarUpsertRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PersonalMilitarService {
    List<PersonalMilitarDTO> findAll();
    PersonalMilitarDTO findById(Long id);
    Optional<PersonalMilitarDTO> findByCedula(String cedula);
    Page<PersonalMilitarDTO> searchByApellidos(String apellidos, Pageable pageable);
    Page<PersonalMilitarDTO> searchByNombreCompleto(String termino, Pageable pageable);
    PersonalMilitarDTO create(PersonalMilitarUpsertRequestDTO request);
    PersonalMilitarDTO update(Long id, PersonalMilitarUpsertRequestDTO request);
    void deleteById(Long id);
}