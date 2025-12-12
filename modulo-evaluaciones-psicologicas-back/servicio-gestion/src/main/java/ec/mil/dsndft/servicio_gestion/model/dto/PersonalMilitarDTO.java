package ec.mil.dsndft.servicio_gestion.model.dto;

import lombok.Data;

@Data
public class PersonalMilitarDTO {
    private Long id;
    private String cedula;
    private String apellidosNombres;
    private String sexo;
    private String etnia;
    private String estadoCivil;
    private Integer nroHijos;
    private String ocupacion;
    private Boolean servicioActivo;
    private String seguro;
    private String grado;
    private String especialidad;
    private String provincia;
    private String canton;
    private String parroquia;
    private String barrioSector;
    private String telefono;
    private String celular;
    private String email;
    private Boolean activo;
}