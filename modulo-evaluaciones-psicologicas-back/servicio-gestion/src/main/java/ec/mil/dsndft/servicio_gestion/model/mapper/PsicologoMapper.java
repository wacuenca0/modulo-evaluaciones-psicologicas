package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.model.dto.PsicologoDTO;
import org.springframework.stereotype.Component;

@Component
public class PsicologoMapper {
    public PsicologoDTO toDTO(Psicologo entity) {
        if (entity == null) return null;
        PsicologoDTO dto = new PsicologoDTO();
        dto.setId(entity.getId());
        dto.setCedula(entity.getCedula());
        dto.setNombres(entity.getNombres());
        dto.setApellidos(entity.getApellidos());
        dto.setApellidosNombres(entity.getApellidosNombres());
        dto.setUsuarioId(entity.getUsuarioId());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setTelefono(entity.getTelefono());
        dto.setCelular(entity.getCelular());
        dto.setGrado(entity.getGrado());
        dto.setUnidadMilitar(entity.getUnidadMilitar());
        dto.setEspecialidad(entity.getEspecialidad());
        dto.setActivo(entity.getActivo());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
    public Psicologo toEntity(PsicologoDTO dto) {
        if (dto == null) return null;
        Psicologo entity = Psicologo.builder().build();
        entity.setId(dto.getId());
        if (dto.getCreatedAt() != null) {
            entity.setCreatedAt(dto.getCreatedAt());
        }
        if (dto.getUpdatedAt() != null) {
            entity.setUpdatedAt(dto.getUpdatedAt());
        }
        updateEntity(entity, dto);
        if (dto.getActivo() != null) {
            entity.setActivo(dto.getActivo());
        }
        return entity;
    }

    public void updateEntity(Psicologo entity, PsicologoDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        entity.setCedula(dto.getCedula());
        entity.setNombres(dto.getNombres());
        entity.setApellidos(dto.getApellidos());
        if (dto.getUsuarioId() != null) {
            entity.setUsuarioId(dto.getUsuarioId());
        }
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setTelefono(dto.getTelefono());
        entity.setCelular(dto.getCelular());
        entity.setGrado(dto.getGrado());
        entity.setUnidadMilitar(dto.getUnidadMilitar());
        entity.setEspecialidad(dto.getEspecialidad());
        if (dto.getActivo() != null) {
            entity.setActivo(dto.getActivo());
        }
        entity.refreshNombreCompleto();
    }
}