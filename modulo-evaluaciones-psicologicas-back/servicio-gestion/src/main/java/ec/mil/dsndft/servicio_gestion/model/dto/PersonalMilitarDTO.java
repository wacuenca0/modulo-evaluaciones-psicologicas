package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PersonalMilitarDTO {
    private Long id;
    private String cedula;
    private String apellidosNombres;
    private String tipoPersona;
    private Boolean esMilitar;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String sexo;
    private String etnia;
    private String estadoCivil;
    private Integer nroHijos;
    private String ocupacion;
    private Boolean servicioActivo;
    private Boolean servicioPasivo;
    private String seguro;
    private String grado;
    private String especialidad;
    private String unidadMilitar;
    private String provincia;
    private String canton;
    private String parroquia;
    private String barrioSector;
    private String telefono;
    private String celular;
    private String email;
    private Boolean activo;
}