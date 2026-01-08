package ec.mil.dsndft.servicio_gestion.service.support;

import ec.mil.dsndft.servicio_gestion.entity.FichaPsicologica;
import ec.mil.dsndft.servicio_gestion.model.enums.CondicionClinicaEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.FrecuenciaSeguimientoEnum;
import ec.mil.dsndft.servicio_gestion.model.enums.TipoSesionEnum;
import ec.mil.dsndft.servicio_gestion.model.value.DiagnosticoCie10;
import ec.mil.dsndft.servicio_gestion.model.value.PlanSeguimiento;
import org.springframework.stereotype.Component;

@Component
public class FichaCondicionManager {

    public void aplicarCondicionObligatoria(FichaPsicologica ficha,
                                            String condicionRaw,
                                            String cieCodigo,
                                            String cieDescripcion,
                                            String planFrecuenciaRaw,
                                            String planTipoSesionRaw,
                                            String planDetalleRaw) {
        aplicarCondicion(ficha, condicionRaw, cieCodigo, cieDescripcion, planFrecuenciaRaw, planTipoSesionRaw, planDetalleRaw, true);
    }

    public void aplicarCondicionOpcional(FichaPsicologica ficha,
                                         String condicionRaw,
                                         String cieCodigo,
                                         String cieDescripcion,
                                         String planFrecuenciaRaw,
                                         String planTipoSesionRaw,
                                         String planDetalleRaw) {
        if (!hasAnyValue(condicionRaw, cieCodigo, cieDescripcion, planFrecuenciaRaw, planTipoSesionRaw, planDetalleRaw)) {
            return;
        }
        aplicarCondicion(ficha, condicionRaw, cieCodigo, cieDescripcion, planFrecuenciaRaw, planTipoSesionRaw, planDetalleRaw, false);
    }

    private void aplicarCondicion(FichaPsicologica ficha,
                                  String condicionRaw,
                                  String cieCodigo,
                                  String cieDescripcion,
                                  String planFrecuenciaRaw,
                                  String planTipoSesionRaw,
                                  String planDetalleRaw,
                                  boolean condicionObligatoria) {
        CondicionClinicaEnum condicion = resolveCondicion(ficha, condicionRaw, condicionObligatoria);
        ficha.setCondicionClinica(condicion);

        if (!condicion.requierePlan()) {
            ficha.setDiagnosticoCie10(null);
            ficha.setPlanSeguimiento(null);
            return;
        }

        DiagnosticoCie10 diagnostico = buildDiagnostico(ficha, cieCodigo, cieDescripcion, condicionObligatoria);
        ficha.setDiagnosticoCie10(diagnostico);

        PlanSeguimiento plan = buildPlan(ficha, planFrecuenciaRaw, planTipoSesionRaw, planDetalleRaw, condicionObligatoria);
        ficha.setPlanSeguimiento(plan);
    }

    private CondicionClinicaEnum resolveCondicion(FichaPsicologica ficha, String condicionRaw, boolean condicionObligatoria) {
        String token = trim(condicionRaw);
        if (token == null) {
            if (condicionObligatoria) {
                throw new IllegalArgumentException("La condicion clinica es obligatoria");
            }
            CondicionClinicaEnum existente = ficha.getCondicionClinica();
            if (existente == null) {
                throw new IllegalArgumentException("La ficha no tiene condicion clinica previa para reutilizar");
            }
            return existente;
        }
        return CondicionClinicaEnum.from(token)
            .orElseThrow(() -> new IllegalArgumentException("Condicion clinica no soportada: " + condicionRaw));
    }

    private DiagnosticoCie10 buildDiagnostico(FichaPsicologica ficha,
                                              String cieCodigo,
                                              String cieDescripcion,
                                              boolean condicionObligatoria) {
        String codigo = uppercase(trim(cieCodigo));
        String descripcion = trim(cieDescripcion);

        if (codigo == null) {
            DiagnosticoCie10 existente = ficha.getDiagnosticoCie10();
            if (existente != null && existente.getCodigo() != null) {
                codigo = existente.getCodigo();
                if (descripcion == null) {
                    descripcion = existente.getDescripcion();
                }
            }
        }

        if (codigo == null) {
            throw new IllegalArgumentException("El codigo CIE-10 es obligatorio para la condicion seleccionada");
        }

        return DiagnosticoCie10.builder()
            .codigo(codigo)
            .descripcion(descripcion)
            .build();
    }

    private PlanSeguimiento buildPlan(FichaPsicologica ficha,
                                      String planFrecuenciaRaw,
                                      String planTipoSesionRaw,
                                      String planDetalleRaw,
                                      boolean condicionObligatoria) {
        String frecuenciaToken = trim(planFrecuenciaRaw);
        String tipoSesionToken = trim(planTipoSesionRaw);
        String detalle = trim(planDetalleRaw);

        PlanSeguimiento existente = ficha.getPlanSeguimiento();

        if (frecuenciaToken == null && existente != null && existente.getFrecuencia() != null) {
            frecuenciaToken = existente.getFrecuencia().getCanonical();
        }

        if (tipoSesionToken == null && existente != null && existente.getTipoSesion() != null) {
            tipoSesionToken = existente.getTipoSesion().getCanonical();
        }

        if (detalle == null && existente != null) {
            detalle = existente.getDetalle();
        }

        if (frecuenciaToken == null) {
            throw new IllegalArgumentException("La frecuencia del plan de seguimiento es obligatoria");
        }
        if (tipoSesionToken == null) {
            throw new IllegalArgumentException("El tipo de sesion es obligatorio");
        }

        return PlanSeguimiento.builder()
            .frecuencia(FrecuenciaSeguimientoEnum.from(frecuenciaToken)
                .orElseThrow(() -> new IllegalArgumentException("Frecuencia de seguimiento no soportada: " + planFrecuenciaRaw)))
            .tipoSesion(TipoSesionEnum.from(tipoSesionToken)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de sesion no soportado: " + planTipoSesionRaw)))
            .detalle(detalle)
            .build();
    }

    private String trim(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String uppercase(String value) {
        return value != null ? value.toUpperCase() : null;
    }

    private boolean hasAnyValue(String... values) {
        if (values == null) {
            return false;
        }
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return true;
            }
        }
        return false;
    }
}
