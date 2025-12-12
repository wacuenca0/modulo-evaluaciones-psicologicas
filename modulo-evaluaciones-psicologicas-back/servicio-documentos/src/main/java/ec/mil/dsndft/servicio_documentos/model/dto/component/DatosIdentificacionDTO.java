package ec.mil.dsndft.servicio_documentos.model.dto.component;

import ec.mil.dsndft.servicio_documentos.entity.enums.EstadoCivil;
import ec.mil.dsndft.servicio_documentos.entity.enums.NivelInstruccion;
import ec.mil.dsndft.servicio_documentos.entity.enums.Religion;
import ec.mil.dsndft.servicio_documentos.entity.enums.TipoSangre;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatosIdentificacionDTO {
    private String numeroFicha;
    private String numeroCedula;
    private String apellidosNombres;
    private String sexo;
    private EstadoCivil estadoCivil;
    private NivelInstruccion nivelInstruccion;
    private String grado;
    private String armaServicio;
    private String unidad;
    private String grupoCompania;
    private String cargoActual;
    private LocalDate fechaIngreso;
    private Integer tiempoServicioAnios;
    private LocalDate fechaNacimiento;
    private Integer edadActual;
    private Integer numeroHijos;
    private String ocupacion;
    private String especialidad;
    private Religion religion;
    private TipoSangre tipoSangre;
    private String domicilioProvincia;
    private String domicilioCanton;
    private String domicilioParroquia;
    private String domicilioBarrio;
    private String telefono;
    private String celular;
    private String email;
    private String contactoEmergencia;
    private String telefonoEmergencia;
}
