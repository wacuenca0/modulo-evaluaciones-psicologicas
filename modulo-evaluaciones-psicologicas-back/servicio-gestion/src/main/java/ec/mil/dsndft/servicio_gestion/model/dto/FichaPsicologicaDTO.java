package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

@Data
public class FichaPsicologicaDTO {
    private Long id;
    private Long personalMilitarId;
    private Long psicologoId;
    private String nroHistoriaClinica;
    private String observacionClinica;
    private String motivoConsulta;
    private String enfermedadActual;
    private String historiaPasadaEnfermedad;
    private Boolean tomaMedicacion;
    private String tipoMedicacion;
    private Boolean hospitalizacionRehabilitacion;
    private String tiempoHospitalizacion;
    private String exposicionIntrauterina;
    private String condicionesEconomicasSociales;
    private Boolean partoNormal;
    private String complicacionesParto;
    private String etapasEvolutivasNatales;
    private String gradoSociabilidad;
    private String relacionPadresHermanos;
    private Boolean discapacidadIntelectual;
    private String gradoDiscapacidad;
    private Boolean trastornosEpilepsia;
    private Boolean tratamientosPsicologicosPsiquiatricos;
    private String observacionesFuncionesCognitivas;
    private String estado;
}