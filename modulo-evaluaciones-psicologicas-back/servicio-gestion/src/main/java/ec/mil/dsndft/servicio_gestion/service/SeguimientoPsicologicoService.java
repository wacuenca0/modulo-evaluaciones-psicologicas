package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoRequestDTO;

import java.time.LocalDate;
import java.util.List;

public interface SeguimientoPsicologicoService {

    List<SeguimientoPsicologicoDTO> listar(Long fichaPsicologicaId,
                                           Long psicologoId,
                                           Long personalMilitarId,
                                           LocalDate fechaDesde,
                                           LocalDate fechaHasta);

    SeguimientoPsicologicoDTO obtenerPorId(Long id);

    SeguimientoPsicologicoDTO crear(SeguimientoPsicologicoRequestDTO request);

    SeguimientoPsicologicoDTO actualizar(Long id, SeguimientoPsicologicoRequestDTO request);

    void eliminar(Long id);
}
