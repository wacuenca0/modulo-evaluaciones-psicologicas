package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

@Data
public class PsicoanamnesisInfanciaDTO {
    private String gradoSociabilidad;
    private String relacionPadresHermanos;
    private Boolean discapacidadIntelectual;
    private String gradoDiscapacidad;
    private String trastornos;
    private Boolean tratamientosPsicologicosPsiquiatricos;
    private String observacion;
}
