package ec.mil.dsndft.servicio_gestion.config;

import ec.mil.dsndft.servicio_gestion.entity.PersonalMilitar;
import ec.mil.dsndft.servicio_gestion.repository.PersonalMilitarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ServicioGestionDataInitializer implements CommandLineRunner {

    private final PersonalMilitarRepository personalMilitarRepository;

    @Value("${app.bootstrap.demo-data.enabled:true}")
    private boolean demoDataEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!demoDataEnabled) {
            log.info("Carga de datos demo deshabilitada");
            return;
        }

        if (personalMilitarRepository.count() > 0) {
            log.info("Se omite carga demo de personal militar: ya existen registros");
            return;
        }

        PersonalMilitar oficialLogistica = PersonalMilitar.builder()
            .cedula("0102030405")
            .apellidosNombres("Perez Gomez Juan Carlos")
            .tipoPersona("Militar")
            .esMilitar(true)
            .fechaNacimiento(LocalDate.of(1988, 4, 15))
            .edad(36)
            .sexo("Hombre")
            .etnia("Mestizo")
            .estadoCivil("Casado")
            .nroHijos(2)
            .ocupacion("Oficial de logistica")
            .servicioActivo(true)
            .servicioPasivo(false)
            .seguro("ISSFA")
            .grado("Capitan")
            .especialidad("Logistica")
            .provincia("Pichincha")
            .canton("Quito")
            .parroquia("Inaquito")
            .barrioSector("La Carolina")
            .telefono("022345678")
            .celular("0991234567")
            .email("juan.perez@example.mil.ec")
            .build();

        PersonalMilitar suboficialSanidad = PersonalMilitar.builder()
            .cedula("0911121314")
            .apellidosNombres("Mendoza Ruiz Ana Belen")
            .tipoPersona("Militar")
            .esMilitar(true)
            .fechaNacimiento(LocalDate.of(1992, 9, 3))
            .edad(32)
            .sexo("Mujer")
            .etnia("Montubio")
            .estadoCivil("Soltera")
            .nroHijos(0)
            .ocupacion("Suboficial especialista en sanidad")
            .servicioActivo(true)
            .servicioPasivo(false)
            .seguro("ISSFA")
            .grado("Suboficial Segundo")
            .especialidad("Sanidad Militar")
            .provincia("Guayas")
            .canton("Guayaquil")
            .parroquia("Tarqui")
            .barrioSector("Samanes")
            .telefono("042345678")
            .celular("0987654321")
            .email("ana.mendoza@example.mil.ec")
            .build();

        List<PersonalMilitar> personal = List.of(oficialLogistica, suboficialSanidad);
        personalMilitarRepository.saveAll(personal);
        log.info("Se insertaron {} registros demo de personal militar", personal.size());
    }
}
