package ec.mil.dsndft.servicio_catalogos.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DevUtilsControllerTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DevUtilsController devUtilsController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(devUtilsController).build();
    }

    @Test
    void hashReturnsPasswordAndEncodedValue() throws Exception {
        when(passwordEncoder.encode("plain"))
            .thenReturn("bcrypt-plain");

        mockMvc.perform(get("/api/dev/hash").param("pwd", "plain"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.password").value("plain"))
            .andExpect(jsonPath("$.bcryptHash").value("bcrypt-plain"));

        verify(passwordEncoder).encode("plain");
    }
}
