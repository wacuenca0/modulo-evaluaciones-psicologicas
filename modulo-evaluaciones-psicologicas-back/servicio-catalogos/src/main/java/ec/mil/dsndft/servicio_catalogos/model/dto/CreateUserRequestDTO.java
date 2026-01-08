package ec.mil.dsndft.servicio_catalogos.model.dto;

public class CreateUserRequestDTO {
    private String username;
    private String email;
    private String password;
    private Long roleId;
    private PsicologoData psicologo;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public PsicologoData getPsicologo() { return psicologo; }
    public void setPsicologo(PsicologoData psicologo) { this.psicologo = psicologo; }

    public static class PsicologoData {
        private String cedula;
        private String nombres;
        private String apellidos;
        private String telefono;
        private String celular;
        private String grado;
        private String unidadMilitar;
        private String especialidad;

        public String getCedula() { return cedula; }
        public void setCedula(String cedula) { this.cedula = cedula; }
        public String getNombres() { return nombres; }
        public void setNombres(String nombres) { this.nombres = nombres; }
        public String getApellidos() { return apellidos; }
        public void setApellidos(String apellidos) { this.apellidos = apellidos; }
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
    }
}