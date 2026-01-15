package ec.mil.dsndft.servicio_gestion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "fichas_historicas")
public class FichaHistorica {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "numero_ficha", length = 50)
    private String numeroFicha;

    @Column(name = "numero_cedula", length = 20)
    private String numeroCedula;

    @Column(name = "apellidos_nombres", length = 200)
    private String apellidosNombres;

    @Column(name = "estado_ficha", length = 20)
    private String estadoFicha;

    @Column(name = "fecha_evaluacion")
    private LocalDate fechaEvaluacion;

    @Lob
    @Column(name = "diagnostico_cie10")
    private String diagnosticoCie10;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroFicha() {
        return numeroFicha;
    }

    public void setNumeroFicha(String numeroFicha) {
        this.numeroFicha = numeroFicha;
    }

    public String getNumeroCedula() {
        return numeroCedula;
    }

    public void setNumeroCedula(String numeroCedula) {
        this.numeroCedula = numeroCedula;
    }

    public String getApellidosNombres() {
        return apellidosNombres;
    }

    public void setApellidosNombres(String apellidosNombres) {
        this.apellidosNombres = apellidosNombres;
    }

    public String getEstadoFicha() {
        return estadoFicha;
    }

    public void setEstadoFicha(String estadoFicha) {
        this.estadoFicha = estadoFicha;
    }

    public LocalDate getFechaEvaluacion() {
        return fechaEvaluacion;
    }

    public void setFechaEvaluacion(LocalDate fechaEvaluacion) {
        this.fechaEvaluacion = fechaEvaluacion;
    }

    public String getDiagnosticoCie10() {
        return diagnosticoCie10;
    }

    public void setDiagnosticoCie10(String diagnosticoCie10) {
        this.diagnosticoCie10 = diagnosticoCie10;
    }
}
