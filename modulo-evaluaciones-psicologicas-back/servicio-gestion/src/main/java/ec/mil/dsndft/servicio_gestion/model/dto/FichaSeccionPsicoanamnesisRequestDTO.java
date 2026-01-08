package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class FichaSeccionPsicoanamnesisRequestDTO {

    @Valid
    @NotNull(message = "La sección prenatal es obligatoria")
    private Prenatal prenatal;

    @Valid
    @NotNull(message = "La sección natal es obligatoria")
    private Natal natal;

    @Valid
    @NotNull(message = "La sección infancia y pubertad es obligatoria")
    private Infancia infancia;

    public Prenatal getPrenatal() {
        return prenatal;
    }

    public void setPrenatal(Prenatal prenatal) {
        this.prenatal = prenatal;
    }

    public Natal getNatal() {
        return natal;
    }

    public void setNatal(Natal natal) {
        this.natal = natal;
    }

    public Infancia getInfancia() {
        return infancia;
    }

    public void setInfancia(Infancia infancia) {
        this.infancia = infancia;
    }

    public static class Prenatal {

        @Size(max = 4000, message = "Las condiciones biológicas no deben superar 4000 caracteres")
        @JsonAlias({"condiciones_biologicas_padres"})
        private String condicionesBiologicasPadres;

        @Size(max = 4000, message = "Las condiciones psicológicas no deben superar 4000 caracteres")
        @JsonAlias({"condiciones_psicologicas_padres"})
        private String condicionesPsicologicasPadres;

        @Size(max = 4000, message = "La observación prenatal no debe superar 4000 caracteres")
        @JsonAlias({"observacion_prenatal"})
        private String observacion;

        public String getCondicionesBiologicasPadres() {
            return condicionesBiologicasPadres;
        }

        public void setCondicionesBiologicasPadres(String condicionesBiologicasPadres) {
            this.condicionesBiologicasPadres = condicionesBiologicasPadres;
        }

        public String getCondicionesPsicologicasPadres() {
            return condicionesPsicologicasPadres;
        }

        public void setCondicionesPsicologicasPadres(String condicionesPsicologicasPadres) {
            this.condicionesPsicologicasPadres = condicionesPsicologicasPadres;
        }

        public String getObservacion() {
            return observacion;
        }

        public void setObservacion(String observacion) {
            this.observacion = observacion;
        }
    }

    public static class Natal {

        @JsonAlias({"parto_normal"})
        private Boolean partoNormal;

        @Size(max = 50, message = "El término del parto no debe superar 50 caracteres")
        @JsonAlias({"termino_parto"})
        private String termino;

        @Size(max = 500, message = "Las complicaciones no deben superar 500 caracteres")
        @JsonAlias({"complicaciones_parto"})
        private String complicaciones;

        @Size(max = 4000, message = "La observación natal no debe superar 4000 caracteres")
        @JsonAlias({"observacion_natal"})
        private String observacion;

        public Boolean getPartoNormal() {
            return partoNormal;
        }

        public void setPartoNormal(Boolean partoNormal) {
            this.partoNormal = partoNormal;
        }

        public String getTermino() {
            return termino;
        }

        public void setTermino(String termino) {
            this.termino = termino;
        }

        public String getComplicaciones() {
            return complicaciones;
        }

        public void setComplicaciones(String complicaciones) {
            this.complicaciones = complicaciones;
        }

        public String getObservacion() {
            return observacion;
        }

        public void setObservacion(String observacion) {
            this.observacion = observacion;
        }
    }

    public static class Infancia {

        @JsonAlias({"grado_sociabilidad"})
        private String gradoSociabilidad;

        @JsonAlias({"relacion_padres_hermanos"})
        private String relacionPadresHermanos;

        @JsonAlias({"discapacidad_intelectual"})
        private Boolean discapacidadIntelectual;

        @JsonAlias({"grado_discapacidad"})
        private String gradoDiscapacidad;

        @Size(max = 500, message = "Los trastornos no deben superar 500 caracteres")
        @JsonAlias({"trastornos"})
        private String trastornos;

        @JsonAlias({"tratamientos_psicologicos_psiquiatricos"})
        private Boolean tratamientosPsicologicosPsiquiatricos;

        @Size(max = 4000, message = "La observación no debe superar 4000 caracteres")
        @JsonAlias({"observacion_infancia"})
        private String observacion;

        public String getGradoSociabilidad() {
            return gradoSociabilidad;
        }

        public void setGradoSociabilidad(String gradoSociabilidad) {
            this.gradoSociabilidad = gradoSociabilidad;
        }

        public String getRelacionPadresHermanos() {
            return relacionPadresHermanos;
        }

        public void setRelacionPadresHermanos(String relacionPadresHermanos) {
            this.relacionPadresHermanos = relacionPadresHermanos;
        }

        public Boolean getDiscapacidadIntelectual() {
            return discapacidadIntelectual;
        }

        public void setDiscapacidadIntelectual(Boolean discapacidadIntelectual) {
            this.discapacidadIntelectual = discapacidadIntelectual;
        }

        public String getGradoDiscapacidad() {
            return gradoDiscapacidad;
        }

        public void setGradoDiscapacidad(String gradoDiscapacidad) {
            this.gradoDiscapacidad = gradoDiscapacidad;
        }

        public String getTrastornos() {
            return trastornos;
        }

        public void setTrastornos(String trastornos) {
            this.trastornos = trastornos;
        }

        public Boolean getTratamientosPsicologicosPsiquiatricos() {
            return tratamientosPsicologicosPsiquiatricos;
        }

        public void setTratamientosPsicologicosPsiquiatricos(Boolean tratamientosPsicologicosPsiquiatricos) {
            this.tratamientosPsicologicosPsiquiatricos = tratamientosPsicologicosPsiquiatricos;
        }

        public String getObservacion() {
            return observacion;
        }

        public void setObservacion(String observacion) {
            this.observacion = observacion;
        }
    }
}
