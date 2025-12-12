package ec.mil.dsndft.api_gateway.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {

    /**
     * Symmetric secret used to validate inbound JWTs. Must be at least 32 bytes (256 bits).
     */
    @NotBlank
    private String secret;

    /**
     * Expected issuer claim. Optional but recommended.
     */
    private String issuer;

    /**
     * Expected audience claim. Optional.
     */
    private String audience;

    /**
     * Claim name that holds granted authorities.
     */
    private String authoritiesClaim = "roles";

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String getAuthoritiesClaim() {
        return authoritiesClaim;
    }

    public void setAuthoritiesClaim(String authoritiesClaim) {
        this.authoritiesClaim = authoritiesClaim;
    }
}
