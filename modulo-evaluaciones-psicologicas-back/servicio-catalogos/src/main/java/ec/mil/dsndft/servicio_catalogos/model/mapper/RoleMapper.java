package ec.mil.dsndft.servicio_catalogos.model.mapper;

import ec.mil.dsndft.servicio_catalogos.model.dto.RoleDTO;
import ec.mil.dsndft.servicio_catalogos.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {
    public RoleDTO toDTO(Role entity) {
        if (entity == null) return null;
        RoleDTO dto = new RoleDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getNombre());
        return dto;
    }
    public Role toEntity(RoleDTO dto) {
        if (dto == null) return null;
        Role entity = new Role();
        entity.setId(dto.getId());
        entity.setNombre(dto.getName());
        return entity;
    }
}