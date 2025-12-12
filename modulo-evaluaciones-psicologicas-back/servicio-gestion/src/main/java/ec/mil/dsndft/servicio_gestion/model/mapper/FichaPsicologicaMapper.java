package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FichaPsicologicaMapper {
    FichaPsicologicaDTO toDTO(FichaPsicologica entity);
    FichaPsicologica toEntity(FichaPsicologicaDTO dto);
}