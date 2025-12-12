package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.model.dto.PersonalMilitarDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonalMilitarMapper {
    PersonalMilitarDTO toDTO(PersonalMilitar entity);
    PersonalMilitar toEntity(PersonalMilitarDTO dto);
}