package ec.mil.dsndft.servicio_catalogos.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CatalogoCIE10DTO {
    private Long id;

    @NotBlank(message = "El código CIE10 es obligatorio")
    @Size(max = 10, message = "El código CIE10 no debe superar 10 caracteres")
    private String codigo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500, message = "La descripción no debe superar 500 caracteres")
    private String descripcion;

    private Boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}