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
        dto.setApellidosNombres(entity.getApellidosNombres());
        dto.setUsername(entity.getUsername());
        return dto;
    }
    public Psicologo toEntity(PsicologoDTO dto) {
        if (dto == null) return null;
        Psicologo entity = Psicologo.builder()
                .id(dto.getId())
                .cedula(dto.getCedula())
                .apellidosNombres(dto.getApellidosNombres())
                .build();
        entity.setUsername(dto.getUsername());
        return entity;
    }
}