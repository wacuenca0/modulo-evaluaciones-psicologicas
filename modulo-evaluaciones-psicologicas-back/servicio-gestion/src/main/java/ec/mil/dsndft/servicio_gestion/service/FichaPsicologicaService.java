package ec.mil.dsndft.servicio_gestion.service;

import ec.mil.dsndft.servicio_gestion.model.dto.FichaCondicionRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaDatosGeneralesRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaPsicologicaDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaSeccionObservacionRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.FichaSeccionPsicoanamnesisRequestDTO;

import java.util.List;

public interface FichaPsicologicaService {

    List<FichaPsicologicaDTO> listar(Long psicologoId, Long personalMilitarId, String estado, String condicion, Boolean soloActivas);

    List<FichaPsicologicaDTO> listarPorCondicion(String condicion, Long psicologoId, Long personalMilitarId);

    FichaPsicologicaDTO obtenerPorId(Long id);

    FichaPsicologicaDTO obtenerPorNumeroEvaluacion(String numeroEvaluacion);

    FichaPsicologicaDTO crearFicha(FichaDatosGeneralesRequestDTO request);

    FichaPsicologicaDTO actualizarDatosGenerales(Long id, FichaDatosGeneralesRequestDTO request);

    FichaPsicologicaDTO guardarSeccionObservacion(Long id, FichaSeccionObservacionRequestDTO request);

    FichaPsicologicaDTO guardarSeccionPsicoanamnesis(Long id, FichaSeccionPsicoanamnesisRequestDTO request);

    FichaPsicologicaDTO actualizarCondicion(Long id, FichaCondicionRequestDTO request);

    FichaPsicologicaDTO actualizarEstado(Long id, String estado);

    String generarNumeroEvaluacionPreview();

    FichaPsicologicaDTO eliminarSeccionObservacion(Long id);

    FichaPsicologicaDTO eliminarSeccionPsicoanamnesis(Long id);

    FichaPsicologicaDTO limpiarCondicionClinica(Long id);

    FichaPsicologicaDTO finalizarFicha(Long id);

    List<FichaPsicologicaDTO> obtenerHistorialPorPersonal(Long personalMilitarId);
}
