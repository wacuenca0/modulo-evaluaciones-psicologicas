package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.SeguimientoPsicologico;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SeguimientoPsicologicoMapper {
    SeguimientoPsicologicoDTO toDTO(SeguimientoPsicologico entity);
    SeguimientoPsicologico toEntity(SeguimientoPsicologicoDTO dto);
}