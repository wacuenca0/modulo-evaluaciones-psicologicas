package ec.mil.dsndft.servicio_gestion.model.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CatalogoDiagnosticoCie10UpdateRequestDTO {

    @NotBlank(message = "El código CIE-10 es obligatorio")
    @Size(max = 15, message = "El código CIE-10 no debe superar 15 caracteres")
    @JsonAlias({"codigo"})
    private String codigo;

    @NotBlank(message = "El nombre del diagnóstico es obligatorio")
    @Size(max = 500, message = "El nombre del diagnóstico no debe superar 500 caracteres")
    @JsonAlias({"nombre"})
    private String nombre;

    @Size(max = 2000, message = "La descripción no debe superar 2000 caracteres")
    @JsonAlias({"descripcion"})
    private String descripcion;

    @Size(max = 15, message = "La categoría padre no debe superar 15 caracteres")
    @JsonAlias({"categoria_padre"})
    private String categoriaPadre;

    @NotNull(message = "El nivel del diagnóstico es obligatorio")
    @Min(value = 0, message = "El nivel debe ser mayor o igual a 0")
    @JsonAlias({"nivel"})
    private Integer nivel;

    @JsonAlias({"activo"})
    private Boolean activo;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCategoriaPadre() {
        return categoriaPadre;
    }

    public void setCategoriaPadre(String categoriaPadre) {
        this.categoriaPadre = categoriaPadre;
    }

    public Integer getNivel() {
        return nivel;
    }

    public void setNivel(Integer nivel) {
        this.nivel = nivel;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
