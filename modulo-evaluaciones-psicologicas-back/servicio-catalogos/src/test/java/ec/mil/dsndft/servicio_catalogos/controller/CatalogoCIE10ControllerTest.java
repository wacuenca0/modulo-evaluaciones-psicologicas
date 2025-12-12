package ec.mil.dsndft.servicio_catalogos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_catalogos.model.dto.CatalogoCIE10DTO;
import ec.mil.dsndft.servicio_catalogos.service.CatalogoCIE10Service;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CatalogoCIE10ControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private CatalogoCIE10Service catalogoCIE10Service;

    @InjectMocks
    private CatalogoCIE10Controller catalogoCIE10Controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(catalogoCIE10Controller).build();
    }

    @Test
    void listarDelegatesToServiceWithOptionalFlag() throws Exception {
        CatalogoCIE10DTO dto = new CatalogoCIE10DTO();
        dto.setId(7L);
        dto.setCodigo("F32.1");
        dto.setDescripcion("Episodio depresivo moderado");
        dto.setActivo(Boolean.TRUE);
        when(catalogoCIE10Service.listar(Boolean.TRUE)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/catalogo-cie10").param("soloActivos", "true"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(List.of(dto))));

        verify(catalogoCIE10Service).listar(Boolean.TRUE);
    }

    @Test
    void obtenerPorIdReturnsPayload() throws Exception {
        CatalogoCIE10DTO dto = new CatalogoCIE10DTO();
        dto.setId(9L);
        dto.setCodigo("F33.2");
        dto.setDescripcion("Trastorno depresivo recurrente");
        dto.setActivo(Boolean.TRUE);
        when(catalogoCIE10Service.obtenerPorId(9L)).thenReturn(dto);

        mockMvc.perform(get("/api/catalogo-cie10/{id}", 9L))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(dto)));

        verify(catalogoCIE10Service).obtenerPorId(9L);
    }

    @Test
    void crearReturnsCreatedLocationAndBody() throws Exception {
        CatalogoCIE10DTO request = new CatalogoCIE10DTO();
        request.setCodigo("F41.0");
        request.setDescripcion("Trastorno de ansiedad");
        request.setActivo(Boolean.TRUE);

        CatalogoCIE10DTO created = new CatalogoCIE10DTO();
        created.setId(15L);
        created.setCodigo(request.getCodigo());
        created.setDescripcion(request.getDescripcion());
        created.setActivo(Boolean.TRUE);

        when(catalogoCIE10Service.crear(org.mockito.ArgumentMatchers.any(CatalogoCIE10DTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/catalogo-cie10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/catalogo-cie10/15"))
            .andExpect(content().json(objectMapper.writeValueAsString(created)));

        ArgumentCaptor<CatalogoCIE10DTO> captor = ArgumentCaptor.forClass(CatalogoCIE10DTO.class);
        verify(catalogoCIE10Service).crear(captor.capture());
        assertThat(captor.getValue().getCodigo()).isEqualTo("F41.0");
    }

    @Test
    void actualizarDelegatesToService() throws Exception {
        CatalogoCIE10DTO request = new CatalogoCIE10DTO();
        request.setCodigo("F41.1");
        request.setDescripcion("Ansiedad generalizada");
        request.setActivo(Boolean.FALSE);

        CatalogoCIE10DTO updated = new CatalogoCIE10DTO();
        updated.setId(4L);
        updated.setCodigo("F41.1");
        updated.setDescripcion("Ansiedad generalizada");
        updated.setActivo(Boolean.FALSE);

        when(catalogoCIE10Service.actualizar(org.mockito.ArgumentMatchers.eq(4L), org.mockito.ArgumentMatchers.any(CatalogoCIE10DTO.class)))
            .thenReturn(updated);

        mockMvc.perform(put("/api/catalogo-cie10/{id}", 4L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(updated)));

        ArgumentCaptor<CatalogoCIE10DTO> captor = ArgumentCaptor.forClass(CatalogoCIE10DTO.class);
        verify(catalogoCIE10Service).actualizar(org.mockito.ArgumentMatchers.eq(4L), captor.capture());
        assertThat(captor.getValue().getDescripcion()).isEqualTo("Ansiedad generalizada");
    }
}
