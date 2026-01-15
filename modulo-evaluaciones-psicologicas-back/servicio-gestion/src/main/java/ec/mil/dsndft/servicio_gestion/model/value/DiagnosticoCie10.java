package ec.mil.dsndft.servicio_gestion.model.value;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class DiagnosticoCie10 {

    @Column(length = 15, name = "cie10_codigo")
    private String codigo;

    @Column(length = 500, name = "cie10_nombre")
    private String nombre;

    @Column(length = 15, name = "cie10_categoria_padre")
    private String categoriaPadre;

    @Column(name = "cie10_nivel")
    private Integer nivel;

    @Column(columnDefinition = "CLOB", name = "cie10_descripcion")
    private String descripcion;
}
