package ec.mil.dsndft.servicio_catalogos.model.mapper;

import ec.mil.dsndft.servicio_catalogos.model.dto.CatalogoCIE10DTO;
import ec.mil.dsndft.servicio_catalogos.entity.CatalogoCIE10;
import org.springframework.stereotype.Component;

@Component
public class CatalogoCIE10Mapper {
    public CatalogoCIE10DTO toDTO(CatalogoCIE10 entity) {
        if (entity == null) return null;
        CatalogoCIE10DTO dto = new CatalogoCIE10DTO();
        dto.setId(entity.getId());
        dto.setCodigo(entity.getCodigo());
        dto.setDescripcion(entity.getDescripcion());
        dto.setActivo(entity.getActivo());
        return dto;
    }
    public CatalogoCIE10 toEntity(CatalogoCIE10DTO dto) {
        if (dto == null) return null;
        CatalogoCIE10 entity = new CatalogoCIE10();
        entity.setId(dto.getId());
        entity.setCodigo(dto.getCodigo());
        entity.setDescripcion(dto.getDescripcion());
        entity.setActivo(dto.getActivo());
        return entity;
    }
}