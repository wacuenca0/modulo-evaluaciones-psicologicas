package ec.mil.dsndft.servicio_gestion.model.dto;

import java.time.LocalDateTime;

public class PsicologoDTO {

    private Long id;
    private String cedula;
    private String nombres;
    private String apellidos;
    private String apellidosNombres;
    private Long usuarioId;
    private String username;
    private String email;
    private String telefono;
    private String celular;
    private String grado;
    private String unidadMilitar;
    private String especialidad;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getApellidosNombres() { return apellidosNombres; }
    public void setApellidosNombres(String apellidosNombres) { this.apellidosNombres = apellidosNombres; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCelular() { return celular; }
    public void setCelular(String celular) { this.celular = celular; }
    public String getGrado() { return grado; }
    public void setGrado(String grado) { this.grado = grado; }
    public String getUnidadMilitar() { return unidadMilitar; }
    public void setUnidadMilitar(String unidadMilitar) { this.unidadMilitar = unidadMilitar; }
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}