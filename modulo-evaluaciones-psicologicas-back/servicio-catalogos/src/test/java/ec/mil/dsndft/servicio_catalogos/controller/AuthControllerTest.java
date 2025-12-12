package ec.mil.dsndft.servicio_catalogos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_catalogos.model.dto.LoginRequestDTO;
import ec.mil.dsndft.servicio_catalogos.model.dto.UserDTO;
import ec.mil.dsndft.servicio_catalogos.service.AuthService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void loginReturnsJwtTokenFromService() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setUsername("wagner");
        request.setPassword("secret");

        when(authService.login(org.mockito.ArgumentMatchers.any(LoginRequestDTO.class))).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("jwt-token"));

        ArgumentCaptor<LoginRequestDTO> captor = ArgumentCaptor.forClass(LoginRequestDTO.class);
        verify(authService).login(captor.capture());
        assertThat(captor.getValue().getUsername()).isEqualTo("wagner");
        assertThat(captor.getValue().getPassword()).isEqualTo("secret");
    }

    @Test
    void currentUserReturnsUserDto() throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(5L);
        userDTO.setUsername("wagner");
        userDTO.setEmail("wagner@example.mil");
        userDTO.setRoleId(2L);

        when(authService.getCurrentUser()).thenReturn(userDTO);

        mockMvc.perform(get("/api/auth/current-user"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(userDTO)));

        verify(authService).getCurrentUser();
    }
}
