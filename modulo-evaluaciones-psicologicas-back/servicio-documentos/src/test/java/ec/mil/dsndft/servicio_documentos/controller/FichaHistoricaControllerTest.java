package ec.mil.dsndft.servicio_documentos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.mil.dsndft.servicio_documentos.model.dto.FichaHistoricaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.DatosIdentificacionDTO;
import ec.mil.dsndft.servicio_documentos.service.FichaHistoricaService;
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
class FichaHistoricaControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private FichaHistoricaService fichaHistoricaService;

    @InjectMocks
    private FichaHistoricaController fichaHistoricaController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(fichaHistoricaController).build();
    }

    @Test
    void findByCedulaReturnsList() throws Exception {
        FichaHistoricaDTO dto = FichaHistoricaDTO.builder()
            .id(1L)
            .datosIdentificacion(DatosIdentificacionDTO.builder()
                .numeroCedula("0102030405")
                .apellidosNombres("Juan Perez")
                .build())
            .fechaEvaluacion(LocalDate.of(2024, 5, 20))
            .build();
        when(fichaHistoricaService.findByCedulaPersonal("0102030405")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/documentos/fichas-historicas").param("cedula", "0102030405"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(List.of(dto))));

        verify(fichaHistoricaService).findByCedulaPersonal("0102030405");
    }

    @Test
    void findByIdReturnsDto() throws Exception {
        FichaHistoricaDTO dto = FichaHistoricaDTO.builder().id(9L).build();
        when(fichaHistoricaService.findById(9L)).thenReturn(dto);

        mockMvc.perform(get("/api/documentos/fichas-historicas/{id}", 9L))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(dto)));

        verify(fichaHistoricaService).findById(9L);
    }

    @Test
    void createReturnsCreatedResponse() throws Exception {
        FichaHistoricaDTO request = FichaHistoricaDTO.builder()
            .datosIdentificacion(DatosIdentificacionDTO.builder()
                .numeroCedula("0607080910")
                .apellidosNombres("Maria Lopez")
                .build())
            .build();

        FichaHistoricaDTO created = FichaHistoricaDTO.builder()
            .id(7L)
            .datosIdentificacion(request.getDatosIdentificacion())
            .build();

        when(fichaHistoricaService.create(org.mockito.ArgumentMatchers.any(FichaHistoricaDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/documentos/fichas-historicas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", "/api/documentos/fichas-historicas/7"))
            .andExpect(content().json(objectMapper.writeValueAsString(created)));

        ArgumentCaptor<FichaHistoricaDTO> captor = ArgumentCaptor.forClass(FichaHistoricaDTO.class);
        verify(fichaHistoricaService).create(captor.capture());
        assertThat(captor.getValue().getDatosIdentificacion().getNumeroCedula()).isEqualTo("0607080910");
    }

    @Test
    void updateReturnsUpdatedPayload() throws Exception {
        FichaHistoricaDTO request = FichaHistoricaDTO.builder()
            .datosIdentificacion(DatosIdentificacionDTO.builder()
                .numeroCedula("1102030405")
                .apellidosNombres("Carlos Diaz")
                .build())
            .build();

        FichaHistoricaDTO updated = FichaHistoricaDTO.builder()
            .id(5L)
            .datosIdentificacion(request.getDatosIdentificacion())
            .build();

        when(fichaHistoricaService.update(org.mockito.ArgumentMatchers.eq(5L), org.mockito.ArgumentMatchers.any(FichaHistoricaDTO.class)))
            .thenReturn(updated);

        mockMvc.perform(put("/api/documentos/fichas-historicas/{id}", 5L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(updated)));

        ArgumentCaptor<FichaHistoricaDTO> captor = ArgumentCaptor.forClass(FichaHistoricaDTO.class);
        verify(fichaHistoricaService).update(org.mockito.ArgumentMatchers.eq(5L), captor.capture());
        assertThat(captor.getValue().getDatosIdentificacion().getApellidosNombres()).isEqualTo("Carlos Diaz");
    }

    @Test
    void deleteDelegatesToService() throws Exception {
        mockMvc.perform(delete("/api/documentos/fichas-historicas/{id}", 8L))
            .andExpect(status().isNoContent());

        verify(fichaHistoricaService).delete(8L);
    }
}
