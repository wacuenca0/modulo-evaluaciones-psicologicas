package ec.mil.dsndft.servicio_catalogos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_catalogos.model.dto.CreateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UpdateUserRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;
import ec.mil.dsndft.servicio_catalogos.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    void getAllUsersReturnsServicePayload() throws Exception {
        UserDTO dto = new UserDTO();
        dto.setId(1L);
        dto.setUsername("usuario");
        dto.setEmail("usuario@example.mil");
        dto.setRoleId(5L);
        when(userService.getAllUsers()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(List.of(dto))));

        verify(userService).getAllUsers();
    }

    @Test
    void createUserDelegatesToServiceAndReturnsResult() throws Exception {
        CreateUserRequestDTO request = new CreateUserRequestDTO();
        request.setUsername("nuevo");
        request.setEmail("nuevo@example.mil");
        request.setPassword("secreto");
        request.setRoleId(3L);

        UserDTO created = new UserDTO();
        created.setId(10L);
        created.setUsername("nuevo");
        created.setEmail("nuevo@example.mil");
        created.setRoleId(3L);

        when(userService.createUser(org.mockito.ArgumentMatchers.any(CreateUserRequestDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(created)));

        ArgumentCaptor<CreateUserRequestDTO> captor = ArgumentCaptor.forClass(CreateUserRequestDTO.class);
        verify(userService).createUser(captor.capture());
        assertThat(captor.getValue().getUsername()).isEqualTo("nuevo");
        assertThat(captor.getValue().getRoleId()).isEqualTo(3L);
    }

    @Test
    void updateUserDelegatesToService() throws Exception {
        UpdateUserRequestDTO request = new UpdateUserRequestDTO();
        request.setUsername("actualizado");
        request.setEmail("actualizado@example.mil");
        request.setRoleId(4L);
        request.setActive(Boolean.TRUE);

        UserDTO updated = new UserDTO();
        updated.setId(2L);
        updated.setUsername("actualizado");
        updated.setEmail("actualizado@example.mil");
        updated.setRoleId(4L);

        when(userService.updateUser(org.mockito.ArgumentMatchers.any(UpdateUserRequestDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(updated)));

        ArgumentCaptor<UpdateUserRequestDTO> captor = ArgumentCaptor.forClass(UpdateUserRequestDTO.class);
        verify(userService).updateUser(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("actualizado@example.mil");
        assertThat(captor.getValue().getActive()).isTrue();
    }

    @Test
    void deleteUserCallsServiceAndReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/users/{username}", "eliminar"))
            .andExpect(status().isNoContent());

        verify(userService).deleteUser("eliminar");
    }
}
