package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.CatalogoCondicion;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoCondicionDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CatalogoCondicionMapper {
    CatalogoCondicionDTO toDTO(CatalogoCondicion entity);
    CatalogoCondicion toEntity(CatalogoCondicionDTO dto);
}