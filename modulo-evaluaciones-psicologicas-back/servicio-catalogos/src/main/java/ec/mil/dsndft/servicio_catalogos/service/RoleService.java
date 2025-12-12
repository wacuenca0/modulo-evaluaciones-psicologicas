package ec.mil.dsndft.servicio_catalogos.service;

import ec.mil.dsndft.servicio_catalogos.model.dto.RoleDTO;

import java.util.List;

public interface RoleService {
    List<RoleDTO> getAllRoles();
}