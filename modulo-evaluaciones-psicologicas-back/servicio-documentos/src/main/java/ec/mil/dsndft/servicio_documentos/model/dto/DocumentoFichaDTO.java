package ec.mil.dsndft.servicio_documentos.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DocumentoFichaDTO {
    private Long id;
    private Long fichaId;
    private Long tipoDocumentoId;
    private Long seguimientoId;
    private String nombreArchivo;
    private String rutaArchivo;
    private String descripcion;
    private LocalDate fechaSubida;
    private Long tamano;
    private Boolean activo;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFichaId() { return fichaId; }
    public void setFichaId(Long fichaId) { this.fichaId = fichaId; }
    public Long getTipoDocumentoId() { return tipoDocumentoId; }
    public void setTipoDocumentoId(Long tipoDocumentoId) { this.tipoDocumentoId = tipoDocumentoId; }
    public Long getSeguimientoId() { return seguimientoId; }
    public void setSeguimientoId(Long seguimientoId) { this.seguimientoId = seguimientoId; }
    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }
    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public LocalDate getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDate fechaSubida) { this.fechaSubida = fechaSubida; }
    public Long getTamano() { return tamano; }
    public void setTamano(Long tamano) { this.tamano = tamano; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
