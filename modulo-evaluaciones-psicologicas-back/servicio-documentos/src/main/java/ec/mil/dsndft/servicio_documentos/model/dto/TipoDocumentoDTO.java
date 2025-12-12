package ec.mil.dsndft.servicio_documentos.model.dto;

public class TipoDocumentoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Boolean obligatorio;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Boolean getObligatorio() { return obligatorio; }
    public void setObligatorio(Boolean obligatorio) { this.obligatorio = obligatorio; }
}
