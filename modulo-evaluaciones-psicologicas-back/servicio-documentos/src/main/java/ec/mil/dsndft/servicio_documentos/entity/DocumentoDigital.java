package ec.mil.dsndft.servicio_documentos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos_digitales")
public class DocumentoDigital {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_documentos_digitales")
    @SequenceGenerator(name = "seq_documentos_digitales", sequenceName = "seq_documentos_digitales", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_documento_id")
    private TipoDocumento tipoDocumento;

    @Column(name = "ficha_psicologica_id", nullable = false)
    private Long fichaPsicologicaId;

    @Column(name = "ficha_numero_evaluacion", length = 50)
    private String fichaNumeroEvaluacion;

    @Column(name = "nombre_original", nullable = false, length = 255)
    private String nombreOriginal;

    @Column(name = "ruta_almacenamiento", nullable = false, length = 500)
    private String rutaAlmacenamiento;

    @Column(name = "ruta_relativa", length = 500)
    private String rutaRelativa;

    @Column(name = "tipo_mime", length = 150)
    private String tipoMime;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "descripcion", columnDefinition = "CLOB")
    private String descripcion;

    @Column(name = "origen_modulo", length = 120)
    private String origenModulo;

    @Column(name = "referencia_externa", length = 150)
    private String referenciaExterna;

    @Column(name = "metadatos", columnDefinition = "CLOB")
    private String metadatos;

    @Column(name = "checksum", length = 128)
    private String checksum;

    @Column(name = "version_documento")
    private Integer versionDocumento;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (fechaSubida == null) {
            fechaSubida = now;
        }
        if (versionDocumento == null) {
            versionDocumento = 1;
        }
        if (activo == null) {
            activo = Boolean.TRUE;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (versionDocumento == null) {
            versionDocumento = 1;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public Long getFichaPsicologicaId() {
        return fichaPsicologicaId;
    }

    public void setFichaPsicologicaId(Long fichaPsicologicaId) {
        this.fichaPsicologicaId = fichaPsicologicaId;
    }

    public String getFichaNumeroEvaluacion() {
        return fichaNumeroEvaluacion;
    }

    public void setFichaNumeroEvaluacion(String fichaNumeroEvaluacion) {
        this.fichaNumeroEvaluacion = fichaNumeroEvaluacion;
    }

    public String getNombreOriginal() {
        return nombreOriginal;
    }

    public void setNombreOriginal(String nombreOriginal) {
        this.nombreOriginal = nombreOriginal;
    }

    public String getRutaAlmacenamiento() {
        return rutaAlmacenamiento;
    }

    public void setRutaAlmacenamiento(String rutaAlmacenamiento) {
        this.rutaAlmacenamiento = rutaAlmacenamiento;
    }

    public String getRutaRelativa() {
        return rutaRelativa;
    }

    public void setRutaRelativa(String rutaRelativa) {
        this.rutaRelativa = rutaRelativa;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
    }

    public Long getTamanoBytes() {
        return tamanoBytes;
    }

    public void setTamanoBytes(Long tamanoBytes) {
        this.tamanoBytes = tamanoBytes;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getOrigenModulo() {
        return origenModulo;
    }

    public void setOrigenModulo(String origenModulo) {
        this.origenModulo = origenModulo;
    }

    public String getReferenciaExterna() {
        return referenciaExterna;
    }

    public void setReferenciaExterna(String referenciaExterna) {
        this.referenciaExterna = referenciaExterna;
    }

    public String getMetadatos() {
        return metadatos;
    }

    public void setMetadatos(String metadatos) {
        this.metadatos = metadatos;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public Integer getVersionDocumento() {
        return versionDocumento;
    }

    public void setVersionDocumento(Integer versionDocumento) {
        this.versionDocumento = versionDocumento;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }

    public void setFechaSubida(LocalDateTime fechaSubida) {
        this.fechaSubida = fechaSubida;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
