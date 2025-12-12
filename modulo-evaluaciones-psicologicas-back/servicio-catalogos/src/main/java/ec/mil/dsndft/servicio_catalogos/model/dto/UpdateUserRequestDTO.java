package ec.mil.dsndft.servicio_catalogos.model.dto;

public class UpdateUserRequestDTO {
    private Long id;
    private String username;
    private String email;
    private Long roleId;
    private Boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}