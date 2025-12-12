package ec.mil.dsndft.servicio_gestion.model.dto;

public class PsicologoDTO {
    private Long id;
    private String cedula;
    private String apellidosNombres;
    // Campo anterior para compatibilidad (puede quedar null si se usa username)
    private Long usuarioId;
    // Nuevo campo desacoplado del microservicio de catálogos
    private String username;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }
    public String getApellidosNombres() { return apellidosNombres; }
    public void setApellidosNombres(String apellidosNombres) { this.apellidosNombres = apellidosNombres; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}