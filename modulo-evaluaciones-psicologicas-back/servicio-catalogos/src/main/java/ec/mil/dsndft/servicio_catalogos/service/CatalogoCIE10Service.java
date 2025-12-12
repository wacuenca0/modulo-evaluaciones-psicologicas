package ec.mil.dsndft.servicio_catalogos.service;

import ec.mil.dsndft.servicio_catalogos.model.dto.CatalogoCIE10DTO;

import java.util.List;

public interface CatalogoCIE10Service {
    List<CatalogoCIE10DTO> listar(Boolean soloActivos);

    CatalogoCIE10DTO obtenerPorId(Long id);

    CatalogoCIE10DTO crear(CatalogoCIE10DTO dto);

    CatalogoCIE10DTO actualizar(Long id, CatalogoCIE10DTO dto);
}
