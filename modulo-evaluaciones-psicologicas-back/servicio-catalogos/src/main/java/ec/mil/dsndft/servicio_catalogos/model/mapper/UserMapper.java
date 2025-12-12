package ec.mil.dsndft.servicio_catalogos.model.mapper;

import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;
import ec.mil.dsndft.servicio_catalogos.entity.Usuario;
import ec.mil.dsndft.servicio_catalogos.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "role.id", target = "roleId")
    UserDTO toDTO(Usuario entity);

    @Mapping(source = "roleId", target = "role")
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaUltimoLogin", ignore = true)
    @Mapping(target = "intentosLogin", ignore = true)
    @Mapping(target = "bloqueado", ignore = true)
    Usuario toEntity(UserDTO dto);

    default Role map(Long roleId) {
        if (roleId == null) return null;
        Role r = new Role();
        r.setId(roleId);
        return r;
    }
}