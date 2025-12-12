package ec.mil.dsndft.servicio_documentos.model.mapper;

import ec.mil.dsndft.servicio_documentos.entity.FichaHistorica;
import ec.mil.dsndft.servicio_documentos.entity.component.DatosIdentificacion;
import ec.mil.dsndft.servicio_documentos.entity.component.EvaluacionPsicologica;
import ec.mil.dsndft.servicio_documentos.entity.component.HistoriaClinica;
import ec.mil.dsndft.servicio_documentos.entity.component.HistoriaPsicologica;
import ec.mil.dsndft.servicio_documentos.entity.component.RecomendacionProfesional;
import ec.mil.dsndft.servicio_documentos.model.dto.component.DatosIdentificacionDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.EvaluacionPsicologicaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.HistoriaClinicaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.HistoriaPsicologicaDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.component.RecomendacionProfesionalDTO;
import ec.mil.dsndft.servicio_documentos.model.dto.FichaHistoricaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FichaHistoricaMapper {
    FichaHistoricaDTO toDTO(FichaHistorica entity);
    FichaHistorica toEntity(FichaHistoricaDTO dto);
    void updateFromDto(FichaHistoricaDTO dto, @MappingTarget FichaHistorica entity);

    DatosIdentificacionDTO toDTO(DatosIdentificacion entity);
    DatosIdentificacion toEntity(DatosIdentificacionDTO dto);

    HistoriaClinicaDTO toDTO(HistoriaClinica entity);
    HistoriaClinica toEntity(HistoriaClinicaDTO dto);

    HistoriaPsicologicaDTO toDTO(HistoriaPsicologica entity);
    HistoriaPsicologica toEntity(HistoriaPsicologicaDTO dto);

    EvaluacionPsicologicaDTO toDTO(EvaluacionPsicologica entity);
    EvaluacionPsicologica toEntity(EvaluacionPsicologicaDTO dto);

    RecomendacionProfesionalDTO toDTO(RecomendacionProfesional entity);
    RecomendacionProfesional toEntity(RecomendacionProfesionalDTO dto);
}
