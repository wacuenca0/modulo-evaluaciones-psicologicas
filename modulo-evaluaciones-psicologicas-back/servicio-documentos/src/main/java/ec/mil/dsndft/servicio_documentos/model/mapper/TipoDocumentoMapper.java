package ec.mil.dsndft.servicio_documentos.model.mapper;

import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import ec.mil.dsndft.servicio_documentos.model.dto.TipoDocumentoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TipoDocumentoMapper {
    TipoDocumentoDTO toDTO(TipoDocumento entity);

    @Mapping(target = "documentos", ignore = true)
    TipoDocumento toEntity(TipoDocumentoDTO dto);
}
