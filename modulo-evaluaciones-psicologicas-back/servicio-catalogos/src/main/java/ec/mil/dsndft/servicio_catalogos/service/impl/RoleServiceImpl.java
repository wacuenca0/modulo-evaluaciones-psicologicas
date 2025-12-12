package ec.mil.dsndft.servicio_catalogos.service.impl;

import ec.mil.dsndft.servicio_catalogos.model.dto.RoleDTO;
import ec.mil.dsndft.servicio_catalogos.model.mapper.RoleMapper;
import ec.mil.dsndft.servicio_catalogos.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import ec.mil.dsndft.servicio_catalogos.service.RoleService;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    @Override
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(roleMapper::toDTO)
            .collect(Collectors.toList());
    }
}