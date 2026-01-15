package ec.mil.dsndft.servicio_gestion.service.impl;

import ec.mil.dsndft.servicio_gestion.entity.CatalogoDiagnosticoCie10;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10CreateRequestDTO;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10DTO;
import ec.mil.dsndft.servicio_gestion.model.dto.CatalogoDiagnosticoCie10UpdateRequestDTO;
import ec.mil.dsndft.servicio_gestion.repository.CatalogoDiagnosticoCie10Repository;
import ec.mil.dsndft.servicio_gestion.service.CatalogoDiagnosticoCie10Service;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoDiagnosticoCie10ServiceImpl implements CatalogoDiagnosticoCie10Service {

    private final CatalogoDiagnosticoCie10Repository catalogoDiagnosticoRepository;

    @Override
    public List<CatalogoDiagnosticoCie10DTO> listarActivos(String termino) {
        String filtro = normalizarTermino(termino);
        List<CatalogoDiagnosticoCie10> resultados = filtro == null
                ? catalogoDiagnosticoRepository.findByActivoTrueOrderByCodigoAsc()
                : catalogoDiagnosticoRepository.searchActivos(filtro);
        return resultados.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CatalogoDiagnosticoCie10DTO obtenerPorId(Long id) {
        CatalogoDiagnosticoCie10 diagnostico = catalogoDiagnosticoRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new IllegalArgumentException("Diagnóstico CIE-10 no encontrado"));
        return toDTO(diagnostico);
    }

    @Override
    @Transactional
    public CatalogoDiagnosticoCie10DTO crear(CatalogoDiagnosticoCie10CreateRequestDTO request) {
        String codigo = normalizarCodigo(request.getCodigo());
        if (catalogoDiagnosticoRepository.findByCodigoIgnoreCase(codigo).isPresent()) {
            throw new IllegalArgumentException("Ya existe un diagnóstico CIE-10 con el código indicado");
        }

        CatalogoDiagnosticoCie10 nuevo = CatalogoDiagnosticoCie10.builder()
            .codigo(codigo)
            .nombre(normalizarNombre(request.getNombre()))
            .categoriaPadre(normalizarCategoriaPadre(request.getCategoriaPadre()))
            .nivel(normalizarNivel(request.getNivel()))
            .descripcion(normalizarDescripcion(request.getDescripcion(), true))
            .activo(resolverActivo(request.getActivo()))
            .build();

        CatalogoDiagnosticoCie10 guardado = catalogoDiagnosticoRepository.save(nuevo);
        return toDTO(guardado);
    }

    @Override
    @Transactional
    public CatalogoDiagnosticoCie10DTO actualizar(Long id, CatalogoDiagnosticoCie10UpdateRequestDTO request) {
        CatalogoDiagnosticoCie10 existente = catalogoDiagnosticoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Diagnóstico CIE-10 no encontrado"));

        String codigo = normalizarCodigo(request.getCodigo());
        catalogoDiagnosticoRepository.findByCodigoIgnoreCase(codigo)
            .filter(registro -> !registro.getId().equals(id))
            .ifPresent(registro -> {
                throw new IllegalArgumentException("Ya existe un diagnóstico CIE-10 con el código indicado");
            });

        existente.setCodigo(codigo);
        existente.setNombre(normalizarNombre(request.getNombre()));
        existente.setCategoriaPadre(normalizarCategoriaPadre(request.getCategoriaPadre()));
        existente.setNivel(normalizarNivel(request.getNivel()));
        existente.setDescripcion(normalizarDescripcion(request.getDescripcion(), false));
        Boolean activo = request.getActivo();
        if (activo != null) {
            existente.setActivo(activo);
        }
        existente.marcarActualizado();

        CatalogoDiagnosticoCie10 actualizado = catalogoDiagnosticoRepository.save(existente);
        return toDTO(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        CatalogoDiagnosticoCie10 existente = catalogoDiagnosticoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Diagnóstico CIE-10 no encontrado"));
        existente.setActivo(Boolean.FALSE);
        existente.marcarActualizado();
        catalogoDiagnosticoRepository.save(existente);
    }

    private CatalogoDiagnosticoCie10DTO toDTO(CatalogoDiagnosticoCie10 entity) {
        return CatalogoDiagnosticoCie10DTO.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .categoriaPadre(entity.getCategoriaPadre())
                .nivel(entity.getNivel())
                .activo(entity.getActivo())
                .fechaCreacion(entity.getFechaCreacion())
                .fechaActualizacion(entity.getFechaActualizacion())
                .build();
    }

    private String normalizarTermino(String termino) {
        if (termino == null) {
            return null;
        }
        String trimmed = termino.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null) {
            throw new IllegalArgumentException("El código CIE-10 es obligatorio");
        }
        String normalized = codigo.trim().toUpperCase();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("El código CIE-10 es obligatorio");
        }
        return normalized;
    }

    private String normalizarNombre(String nombre) {
        if (nombre == null) {
            throw new IllegalArgumentException("El nombre del diagnóstico es obligatorio");
        }
        String normalized = nombre.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("El nombre del diagnóstico es obligatorio");
        }
        return normalized;
    }

    private String normalizarCategoriaPadre(String categoria) {
        if (categoria == null) {
            return null;
        }
        String normalized = categoria.trim().toUpperCase();
        return normalized.isEmpty() ? null : normalized;
    }

    private Integer normalizarNivel(Integer nivel) {
        if (nivel == null) {
            throw new IllegalArgumentException("El nivel del diagnóstico es obligatorio");
        }
        if (nivel < 0) {
            throw new IllegalArgumentException("El nivel debe ser mayor o igual a 0");
        }
        return nivel;
    }

    private String normalizarDescripcion(String descripcion, boolean obligatorio) {
        if (descripcion == null) {
            if (obligatorio) {
                throw new IllegalArgumentException("La descripción del diagnóstico es obligatoria");
            }
            return null;
        }
        String normalized = descripcion.trim();
        if (normalized.isEmpty()) {
            if (obligatorio) {
                throw new IllegalArgumentException("La descripción del diagnóstico es obligatoria");
            }
            return null;
        }
        return normalized;
    }

    private boolean resolverActivo(Boolean activo) {
        return activo == null || Boolean.TRUE.equals(activo);
    }
}
