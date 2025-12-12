package ec.mil.dsndft.servicio_documentos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_documentos.model.dto.DocumentoFichaDTO;
import ec.mil.dsndft.servicio_documentos.service.DocumentoFichaService;
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

import java.time.LocalDate;
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
class DocumentoFichaControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private DocumentoFichaService documentoFichaService;

    @InjectMocks
    private DocumentoFichaController documentoFichaController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentoFichaController).build();
    }

    @Test
    void findActivosByFichaReturnsList() throws Exception {
        DocumentoFichaDTO dto = new DocumentoFichaDTO();
        dto.setId(1L);
        dto.setFichaId(9L);
        dto.setTipoDocumentoId(3L);
        dto.setNombreArchivo("evaluacion.pdf");
        dto.setFechaSubida(LocalDate.of(2025, 1, 15));
        dto.setActivo(Boolean.TRUE);
        when(documentoFichaService.findActivosByFicha(9L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/documentos/fichas/{fichaId}/documentos", 9L))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(List.of(dto))));

        verify(documentoFichaService).findActivosByFicha(9L);
    }

    @Test
    void findByIdReturnsDto() throws Exception {
        DocumentoFichaDTO dto = new DocumentoFichaDTO();
        dto.setId(4L);
        dto.setNombreArchivo("informe.pdf");
        when(documentoFichaService.findById(4L)).thenReturn(dto);

        mockMvc.perform(get("/api/documentos/documentos/{id}", 4L))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(dto)));

        verify(documentoFichaService).findById(4L);
    }

    @Test
    void createReturnsCreatedLocationAndBody() throws Exception {
        DocumentoFichaDTO request = new DocumentoFichaDTO();
        request.setFichaId(2L);
        request.setTipoDocumentoId(5L);
        request.setNombreArchivo("adjunto.pdf");

        DocumentoFichaDTO created = new DocumentoFichaDTO();
        created.setId(8L);
        created.setFichaId(2L);
        created.setTipoDocumentoId(5L);
        created.setNombreArchivo("adjunto.pdf");

        when(documentoFichaService.create(org.mockito.ArgumentMatchers.any(DocumentoFichaDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/documentos/documentos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/documentos/documentos/8"))
            .andExpect(content().json(objectMapper.writeValueAsString(created)));

        ArgumentCaptor<DocumentoFichaDTO> captor = ArgumentCaptor.forClass(DocumentoFichaDTO.class);
        verify(documentoFichaService).create(captor.capture());
        assertThat(captor.getValue().getFichaId()).isEqualTo(2L);
        assertThat(captor.getValue().getTipoDocumentoId()).isEqualTo(5L);
    }

    @Test
    void updateDelegatesToService() throws Exception {
        DocumentoFichaDTO request = new DocumentoFichaDTO();
        request.setDescripcion("Archivo actualizado");
        request.setActivo(Boolean.TRUE);

        DocumentoFichaDTO updated = new DocumentoFichaDTO();
        updated.setId(6L);
        updated.setDescripcion("Archivo actualizado");
        updated.setActivo(Boolean.TRUE);

        when(documentoFichaService.update(org.mockito.ArgumentMatchers.eq(6L), org.mockito.ArgumentMatchers.any(DocumentoFichaDTO.class)))
            .thenReturn(updated);

        mockMvc.perform(put("/api/documentos/documentos/{id}", 6L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(updated)));

        ArgumentCaptor<DocumentoFichaDTO> captor = ArgumentCaptor.forClass(DocumentoFichaDTO.class);
        verify(documentoFichaService).update(org.mockito.ArgumentMatchers.eq(6L), captor.capture());
        assertThat(captor.getValue().getDescripcion()).isEqualTo("Archivo actualizado");
    }

    @Test
    void deleteDelegatesToService() throws Exception {
        mockMvc.perform(delete("/api/documentos/documentos/{id}", 11L))
            .andExpect(status().isNoContent());

        verify(documentoFichaService).delete(11L);
    }
}
