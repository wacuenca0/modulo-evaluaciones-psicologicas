package ec.mil.dsndft.servicio_documentos.model.mapper;

import ec.mil.dsndft.servicio_documentos.entity.DocumentoFicha;
import ec.mil.dsndft.servicio_documentos.entity.FichaHistorica;
import ec.mil.dsndft.servicio_documentos.entity.TipoDocumento;
import ec.mil.dsndft.servicio_documentos.model.dto.DocumentoFichaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentoFichaMapper {

    @Mapping(source = "ficha.id", target = "fichaId")
    @Mapping(source = "tipoDocumento.id", target = "tipoDocumentoId")
    DocumentoFichaDTO toDTO(DocumentoFicha entity);

    @Mapping(source = "fichaId", target = "ficha")
    @Mapping(source = "tipoDocumentoId", target = "tipoDocumento")
    DocumentoFicha toEntity(DocumentoFichaDTO dto);

    default TipoDocumento map(Long tipoDocumentoId) {
        if (tipoDocumentoId == null) {
            return null;
        }
        TipoDocumento tipoDocumento = new TipoDocumento();
        tipoDocumento.setId(tipoDocumentoId);
        return tipoDocumento;
    }

    default FichaHistorica mapFicha(Long fichaId) {
        if (fichaId == null) {
            return null;
        }
        FichaHistorica fichaHistorica = new FichaHistorica();
        fichaHistorica.setId(fichaId);
        return fichaHistorica;
    }
}
