package ec.mil.dsndft.servicio_gestion.model.dto;

import jakarta.validation.constraints.NotNull;

@Deprecated
public class FichaPsicologicaUpsertRequestDTO {

    @NotNull
    private FichaDatosGeneralesRequestDTO datosGenerales;

    @NotNull
    private FichaSeccionObservacionRequestDTO seccionObservacion;

    @NotNull
    private FichaSeccionPsicoanamnesisRequestDTO seccionPsicoanamnesis;

    public FichaDatosGeneralesRequestDTO getDatosGenerales() {
        return datosGenerales;
    }

    public void setDatosGenerales(FichaDatosGeneralesRequestDTO datosGenerales) {
        this.datosGenerales = datosGenerales;
    }

    public FichaSeccionObservacionRequestDTO getSeccionObservacion() {
        return seccionObservacion;
    }

    public void setSeccionObservacion(FichaSeccionObservacionRequestDTO seccionObservacion) {
        this.seccionObservacion = seccionObservacion;
    }

    public FichaSeccionPsicoanamnesisRequestDTO getSeccionPsicoanamnesis() {
        return seccionPsicoanamnesis;
    }

    public void setSeccionPsicoanamnesis(FichaSeccionPsicoanamnesisRequestDTO seccionPsicoanamnesis) {
        this.seccionPsicoanamnesis = seccionPsicoanamnesis;
    }
}
