package ec.mil.dsndft.servicio_gestion.model.mapper;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.entity.Psicologo;
import ec.mil.dsndft.servicio_gestion.entity.SeguimientoPsicologico;
import ec.mil.dsndft.servicio_gestion.model.dto.SeguimientoPsicologicoDTO;
import ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.EstadoFichaEnum;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class SeguimientoPsicologicoMapper {

    public SeguimientoPsicologicoDTO toDTO(SeguimientoPsicologico entity) {
        if (entity == null) {
            return null;
        }

        SeguimientoPsicologicoDTO dto = new SeguimientoPsicologicoDTO();
        dto.setId(entity.getId());
        dto.setFechaSeguimiento(entity.getFechaSeguimiento());
        dto.setObservaciones(entity.getObservaciones());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        FichaPsicologica ficha = entity.getFichaPsicologica();
        if (ficha != null) {
            dto.setFichaPsicologicaId(ficha.getId());
            dto.setEstadoFicha(mapEstado(ficha.getEstado()));
            dto.setCondicionFicha(mapCondicion(ficha.getCondicionClinica()));

            PersonalMilitar personalMilitar = ficha.getPersonalMilitar();
            if (personalMilitar != null) {
                dto.setPersonalMilitarId(personalMilitar.getId());
                dto.setPersonalMilitarNombre(personalMilitar.getApellidosNombres());
                dto.setPersonalMilitarCedula(personalMilitar.getCedula());
            }
        }

        Psicologo psicologo = entity.getPsicologo();
        if (psicologo != null) {
            dto.setPsicologoId(psicologo.getId());
            dto.setPsicologoNombre(psicologo.getApellidosNombres());
            dto.setPsicologoUsername(psicologo.getUsername());
        }

        return dto;
    }

    public List<SeguimientoPsicologicoDTO> toDTOs(List<SeguimientoPsicologico> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
            .filter(Objects::nonNull)
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    private String mapEstado(EstadoFichaEnum estado) {
        return estado != null ? estado.getCanonical() : null;
    }

    private String mapCondicion(CondicionClinicaEnum condicion) {
        return condicion != null ? condicion.getCanonical() : null;
    }
}