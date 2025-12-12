package ec.mil.dsndft.servicio_documentos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_documentos.model.dto.TipoDocumentoDTO;
import ec.mil.dsndft.servicio_documentos.service.TipoDocumentoService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TipoDocumentoControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private TipoDocumentoService tipoDocumentoService;

    @InjectMocks
    private TipoDocumentoController tipoDocumentoController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tipoDocumentoController).build();
    }

    @Test
    void findAllReturnsServicePayload() throws Exception {
        TipoDocumentoDTO dto = new TipoDocumentoDTO();
        dto.setId(1L);
        dto.setNombre("Certificado Médico");
        dto.setDescripcion("Documento firmado por profesional");
        dto.setObligatorio(Boolean.TRUE);
        when(tipoDocumentoService.findAll()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/documentos/tipos"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(List.of(dto))));

        verify(tipoDocumentoService).findAll();
    }

    @Test
    void findByIdReturnsDto() throws Exception {
        TipoDocumentoDTO dto = new TipoDocumentoDTO();
        dto.setId(2L);
        dto.setNombre("Autorización");
        dto.setDescripcion("Autorización firmada");
        dto.setObligatorio(Boolean.FALSE);
        when(tipoDocumentoService.findById(2L)).thenReturn(dto);

        mockMvc.perform(get("/api/documentos/tipos/{id}", 2L))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(dto)));

        verify(tipoDocumentoService).findById(2L);
    }

    @Test
    void createReturnsCreatedLocationAndBody() throws Exception {
        TipoDocumentoDTO request = new TipoDocumentoDTO();
        request.setNombre("Ficha Clínica");
        request.setDescripcion("Ficha con sellos");
        request.setObligatorio(Boolean.TRUE);

        TipoDocumentoDTO created = new TipoDocumentoDTO();
        created.setId(3L);
        created.setNombre(request.getNombre());
        created.setDescripcion(request.getDescripcion());
        created.setObligatorio(Boolean.TRUE);

        when(tipoDocumentoService.create(org.mockito.ArgumentMatchers.any(TipoDocumentoDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/documentos/tipos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/documentos/tipos/3"))
            .andExpect(content().json(objectMapper.writeValueAsString(created)));

        ArgumentCaptor<TipoDocumentoDTO> captor = ArgumentCaptor.forClass(TipoDocumentoDTO.class);
        verify(tipoDocumentoService).create(captor.capture());
        assertThat(captor.getValue().getNombre()).isEqualTo("Ficha Clínica");
    }

    @Test
    void updateDelegatesToService() throws Exception {
        TipoDocumentoDTO request = new TipoDocumentoDTO();
        request.setNombre("Nuevo Nombre");
        request.setDescripcion("Nueva descripción");
        request.setObligatorio(Boolean.FALSE);

        TipoDocumentoDTO updated = new TipoDocumentoDTO();
        updated.setId(4L);
        updated.setNombre("Nuevo Nombre");
        updated.setDescripcion("Nueva descripción");
        updated.setObligatorio(Boolean.FALSE);

        when(tipoDocumentoService.update(org.mockito.ArgumentMatchers.eq(4L), org.mockito.ArgumentMatchers.any(TipoDocumentoDTO.class)))
            .thenReturn(updated);

        mockMvc.perform(put("/api/documentos/tipos/{id}", 4L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(updated)));

        ArgumentCaptor<TipoDocumentoDTO> captor = ArgumentCaptor.forClass(TipoDocumentoDTO.class);
        verify(tipoDocumentoService).update(org.mockito.ArgumentMatchers.eq(4L), captor.capture());
        assertThat(captor.getValue().getDescripcion()).isEqualTo("Nueva descripción");
    }

    @Test
    void deleteDelegatesToService() throws Exception {
        mockMvc.perform(delete("/api/documentos/tipos/{id}", 6L))
            .andExpect(status().isNoContent());

        verify(tipoDocumentoService).delete(6L);
    }
}
