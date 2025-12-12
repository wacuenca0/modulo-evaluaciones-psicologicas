package ec.mil.dsndft.servicio_catalogos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dev")
public class DevUtilsController {

    private final PasswordEncoder passwordEncoder;

    public DevUtilsController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // Dev helper: genera el hash BCrypt para una contraseña dada
    @GetMapping("/hash")
    public ResponseEntity<Map<String, String>> hash(@RequestParam("pwd") String pwd) {
        String hash = passwordEncoder.encode(pwd);
        return ResponseEntity.ok(Map.of("password", pwd, "bcryptHash", hash));
    }
}
