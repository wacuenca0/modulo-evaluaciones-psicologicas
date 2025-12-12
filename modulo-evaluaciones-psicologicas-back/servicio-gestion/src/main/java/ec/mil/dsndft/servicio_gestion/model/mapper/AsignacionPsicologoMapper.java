package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.AsignacionPsicologo;
import ec.mil.dsndft.servicio_gestion.model.dto.AsignacionPsicologoDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AsignacionPsicologoMapper {
    AsignacionPsicologoDTO toDTO(AsignacionPsicologo entity);
    AsignacionPsicologo toEntity(AsignacionPsicologoDTO dto);
}