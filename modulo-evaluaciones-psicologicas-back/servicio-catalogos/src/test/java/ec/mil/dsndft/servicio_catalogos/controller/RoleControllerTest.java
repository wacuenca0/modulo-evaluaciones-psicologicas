package ec.mil.dsndft.servicio_catalogos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_catalogos.model.dto.RoleDTO;
import ec.mil.dsndft.servicio_catalogos.service.RoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private RoleService roleService;

    @InjectMocks
    private RoleController roleController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(roleController).build();
    }

    @Test
    void getAllRolesReturnsListFromService() throws Exception {
        RoleDTO role = new RoleDTO();
        role.setId(3L);
        role.setName("ADMINISTRADOR");
        when(roleService.getAllRoles()).thenReturn(List.of(role));

        mockMvc.perform(get("/api/roles"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(List.of(role))));

        verify(roleService).getAllRoles();
    }
}
