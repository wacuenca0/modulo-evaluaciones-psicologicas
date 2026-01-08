package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class PersonalMilitarUpsertRequestDTO {

    @NotBlank(message = "La cédula es obligatoria")
    @Size(min = 6, max = 20, message = "La cédula debe tener entre 6 y 20 caracteres")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "La cédula solo puede contener letras y números")
    @JsonAlias({"cedula"})
    private String cedula;

    @NotBlank(message = "Los apellidos y nombres son obligatorios")
    @Size(max = 200, message = "Los apellidos y nombres no deben superar 200 caracteres")
    @JsonAlias({"apellidos_nombres"})
    private String apellidosNombres;

    @Size(max = 20, message = "El tipo de persona no debe superar 20 caracteres")
    @JsonAlias({"tipo", "tipo_persona"})
    private String tipoPersona;

    @JsonAlias({"es_militar"})
    private Boolean esMilitar;

    @JsonAlias({"fecha_nacimiento"})
    private LocalDate fechaNacimiento;

    @PositiveOrZero(message = "La edad no puede ser negativa")
    @JsonAlias({"edad"})
    private Integer edad;

    @NotBlank(message = "El sexo es obligatorio")
    @Size(max = 10, message = "El sexo no debe superar 10 caracteres")
    @JsonAlias({"sexo"})
    private String sexo;

    @Size(max = 50, message = "La etnia no debe superar 50 caracteres")
    @JsonAlias({"etnia"})
    private String etnia;

    @Size(max = 50, message = "El estado civil no debe superar 50 caracteres")
    @JsonAlias({"estado_civil"})
    private String estadoCivil;

    @PositiveOrZero(message = "El número de hijos no puede ser negativo")
    @JsonAlias({"numero_hijos"})
    private Integer nroHijos;

    @Size(max = 100, message = "La ocupación no debe superar 100 caracteres")
    @JsonAlias({"ocupacion"})
    private String ocupacion;

    @JsonAlias({"servicio_activo"})
    private Boolean servicioActivo;

    @Size(max = 100, message = "El seguro no debe superar 100 caracteres")
    @JsonAlias({"seguro"})
    private String seguro;

    @Size(max = 50, message = "El grado no debe superar 50 caracteres")
    @JsonAlias({"grado"})
    private String grado;

    @Size(max = 100, message = "La especialidad no debe superar 100 caracteres")
    @JsonAlias({"especialidad"})
    private String especialidad;

    @Size(max = 100, message = "La provincia no debe superar 100 caracteres")
    @JsonAlias({"provincia"})
    private String provincia;

    @Size(max = 100, message = "El cantón no debe superar 100 caracteres")
    @JsonAlias({"canton"})
    private String canton;

    @Size(max = 100, message = "La parroquia no debe superar 100 caracteres")
    @JsonAlias({"parroquia"})
    private String parroquia;

    @Size(max = 100, message = "El barrio o sector no debe superar 100 caracteres")
    @JsonAlias({"barrio_sector"})
    private String barrioSector;

    @Size(max = 20, message = "El teléfono no debe superar 20 caracteres")
    @JsonAlias({"telefono"})
    private String telefono;

    @Size(max = 20, message = "El celular no debe superar 20 caracteres")
    @JsonAlias({"celular"})
    private String celular;

    @Email(message = "El correo electrónico no es válido")
    @Size(max = 100, message = "El correo electrónico no debe superar 100 caracteres")
    @JsonAlias({"email"})
    private String email;

    @JsonAlias({"activo"})
    private Boolean activo;

    @JsonAlias({"servicio_pasivo"})
    private Boolean servicioPasivo;

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getApellidosNombres() {
        return apellidosNombres;
    }

    public void setApellidosNombres(String apellidosNombres) {
        this.apellidosNombres = apellidosNombres;
    }

    public String getTipoPersona() {
        return tipoPersona;
    }

    public void setTipoPersona(String tipoPersona) {
        this.tipoPersona = tipoPersona;
    }

    public Boolean getEsMilitar() {
        return esMilitar;
    }

    public void setEsMilitar(Boolean esMilitar) {
        this.esMilitar = esMilitar;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getEtnia() {
        return etnia;
    }

    public void setEtnia(String etnia) {
        this.etnia = etnia;
    }

    public String getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(String estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public Integer getNroHijos() {
        return nroHijos;
    }

    public void setNroHijos(Integer nroHijos) {
        this.nroHijos = nroHijos;
    }

    public String getOcupacion() {
        return ocupacion;
    }

    public void setOcupacion(String ocupacion) {
        this.ocupacion = ocupacion;
    }

    public Boolean getServicioActivo() {
        return servicioActivo;
    }

    public void setServicioActivo(Boolean servicioActivo) {
        this.servicioActivo = servicioActivo;
    }

    public Boolean getServicioPasivo() {
        return servicioPasivo;
    }

    public void setServicioPasivo(Boolean servicioPasivo) {
        this.servicioPasivo = servicioPasivo;
    }

    public String getSeguro() {
        return seguro;
    }

    public void setSeguro(String seguro) {
        this.seguro = seguro;
    }

    public String getGrado() {
        return grado;
    }

    public void setGrado(String grado) {
        this.grado = grado;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getCanton() {
        return canton;
    }

    public void setCanton(String canton) {
        this.canton = canton;
    }

    public String getParroquia() {
        return parroquia;
    }

    public void setParroquia(String parroquia) {
        this.parroquia = parroquia;
    }

    public String getBarrioSector() {
        return barrioSector;
    }

    public void setBarrioSector(String barrioSector) {
        this.barrioSector = barrioSector;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
