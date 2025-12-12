package ec.mil.dsndft.servicio_documentos.entity.component;

import ec.mil.dsndft.servicio_documentos.entity.enums.EstadoCivil;
import ec.mil.dsndft.servicio_documentos.entity.enums.NivelInstruccion;
import ec.mil.dsndft.servicio_documentos.entity.enums.Religion;
import ec.mil.dsndft.servicio_documentos.entity.enums.TipoSangre;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class DatosIdentificacion {

    @Column(name = "numero_ficha", length = 50)
    private String numeroFicha;

    @Column(name = "numero_cedula", length = 20, nullable = false)
    private String numeroCedula;

    @Column(name = "apellidos_nombres", length = 200, nullable = false)
    private String apellidosNombres;

    @Column(name = "sexo", length = 20)
    private String sexo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_civil", length = 30)
    private EstadoCivil estadoCivil;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_instruccion", length = 30)
    private NivelInstruccion nivelInstruccion;

    @Column(name = "grado", length = 50)
    private String grado;

    @Column(name = "arma_servicio", length = 100)
    private String armaServicio;

    @Column(name = "unidad", length = 150)
    private String unidad;

    @Column(name = "grupo_compania", length = 150)
    private String grupoCompania;

    @Column(name = "cargo_actual", length = 150)
    private String cargoActual;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "tiempo_servicio_anios")
    private Integer tiempoServicioAnios;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "edad_actual")
    private Integer edadActual;

    @Column(name = "numero_hijos")
    private Integer numeroHijos;

    @Column(name = "ocupacion", length = 150)
    private String ocupacion;

    @Column(name = "especialidad", length = 150)
    private String especialidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "religion", length = 30)
    private Religion religion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sangre", length = 10)
    private TipoSangre tipoSangre;

    @Column(name = "domicilio_provincia", length = 100)
    private String domicilioProvincia;

    @Column(name = "domicilio_canton", length = 100)
    private String domicilioCanton;

    @Column(name = "domicilio_parroquia", length = 100)
    private String domicilioParroquia;

    @Column(name = "domicilio_barrio", length = 150)
    private String domicilioBarrio;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "celular", length = 20)
    private String celular;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "contacto_emergencia", length = 200)
    private String contactoEmergencia;

    @Column(name = "telefono_emergencia", length = 20)
    private String telefonoEmergencia;
}
