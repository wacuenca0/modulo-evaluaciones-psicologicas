package ec.mil.dsndft.servicio_catalogos.service.impl;

import ec.mil.dsndft.servicio_catalogos.entity.CatalogoCIE10;
import ec.mil.dsndft.servicio_catalogos.model.dto.CatalogoCIE10DTO;
import ec.mil.dsndft.servicio_catalogos.model.mapper.CatalogoCIE10Mapper;
import ec.mil.dsndft.servicio_catalogos.repository.CatalogoCIE10Repository;
import ec.mil.dsndft.servicio_catalogos.service.CatalogoCIE10Service;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogoCIE10ServiceImpl implements CatalogoCIE10Service {

    private final CatalogoCIE10Repository repository;
    private final CatalogoCIE10Mapper mapper;

    public CatalogoCIE10ServiceImpl(CatalogoCIE10Repository repository, CatalogoCIE10Mapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public List<CatalogoCIE10DTO> listar(Boolean soloActivos) {
        List<CatalogoCIE10> resultados = Boolean.TRUE.equals(soloActivos)
            ? repository.findByActivoTrueOrderByCodigoAsc()
            : repository.findAll(Sort.by(Sort.Direction.ASC, "codigo"));
        return resultados.stream()
            .map(mapper::toDTO)
            .toList();
    }

    @Override
    public CatalogoCIE10DTO obtenerPorId(Long id) {
        CatalogoCIE10 entity = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("El diagnóstico CIE10 solicitado no existe"));
        return mapper.toDTO(entity);
    }

    @Override
    public CatalogoCIE10DTO crear(CatalogoCIE10DTO dto) {
        String codigoNormalizado = dto.getCodigo().trim().toUpperCase();
        if (repository.existsByCodigoIgnoreCase(codigoNormalizado)) {
            throw new IllegalArgumentException("Ya existe un diagnóstico CIE10 con el código indicado");
        }

        CatalogoCIE10 entity = new CatalogoCIE10();
        entity.setCodigo(codigoNormalizado);
        entity.setDescripcion(dto.getDescripcion().trim());
        entity.setActivo(dto.getActivo() == null || dto.getActivo());

        CatalogoCIE10 guardado = repository.save(entity);
        return mapper.toDTO(guardado);
    }

    @Override
    public CatalogoCIE10DTO actualizar(Long id, CatalogoCIE10DTO dto) {
        CatalogoCIE10 entity = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("El diagnóstico CIE10 solicitado no existe"));

        if (dto.getCodigo() != null) {
            String codigoNormalizado = dto.getCodigo().trim().toUpperCase();
            if (!codigoNormalizado.equalsIgnoreCase(entity.getCodigo()) && repository.existsByCodigoIgnoreCase(codigoNormalizado)) {
                throw new IllegalArgumentException("Ya existe un diagnóstico CIE10 con el código indicado");
            }
            entity.setCodigo(codigoNormalizado);
        }

        if (dto.getDescripcion() != null) {
            entity.setDescripcion(dto.getDescripcion().trim());
        }

        if (dto.getActivo() != null) {
            entity.setActivo(dto.getActivo());
        }

        CatalogoCIE10 actualizado = repository.save(entity);
        return mapper.toDTO(actualizado);
    }
}
