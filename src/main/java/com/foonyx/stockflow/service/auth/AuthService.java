
package com.foonyx.stockflow.service.auth;

import com.foonyx.stockflow.dto.auth.LoginRequest;
import com.foonyx.stockflow.dto.auth.LoginResponse;
import com.foonyx.stockflow.entity.Admin;
import com.foonyx.stockflow.repository.AdminRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.JwsHeader;

import java.time.Instant;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException(
                        "Invalid username or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), admin.getPassword())) {
            throw new BadCredentialsException(
                    "Invalid username or password");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(60 * 60);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("stockflow")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(admin.getUsername())
                .claim("role", "ADMIN")
                .build();

        String token = jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                JwsHeader.with(MacAlgorithm.HS256).build(),
                                claims
                        )
                )
                .getTokenValue();

        return new LoginResponse(token, "Bearer");
    }
}
