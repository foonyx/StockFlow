
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
import com.foonyx.stockflow.dto.auth.RegisterRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import com.foonyx.stockflow.dto.auth.AdminResponse;
import java.util.List;


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
                request.getPassword(), admin.getPassword())
                || !"ACTIVE".equals(admin.getStatus())) {
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

    @Transactional
    public void register(RegisterRequest request) {
        String username = request.getUsername().trim();

        if (adminRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setStatus("PENDING");

        adminRepository.save(admin);
    }


    @Transactional(readOnly = true)
    public List<AdminResponse> getPendingAdmins() {
        return adminRepository.findByStatusOrderByIdAsc("PENDING")
                .stream()
                .map(AdminResponse::new)
                .toList();
    }

    @Transactional
    public void approveAdmin(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Admin account not found"));

        if (!"PENDING".equals(admin.getStatus())) {
            throw new IllegalStateException(
                    "Only pending accounts can be approved");
        }

        admin.setStatus("ACTIVE");
        adminRepository.save(admin);
    }

    @Transactional
    public void rejectAdmin(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Admin account not found"));

        if (!"PENDING".equals(admin.getStatus())) {
            throw new IllegalStateException(
                    "Only pending accounts can be rejected");
        }

        admin.setStatus("REJECTED");
        adminRepository.save(admin);
    }

    @Transactional(readOnly = true)
    public boolean isActiveAdmin(String username) {
        return adminRepository.findByUsername(username)
                .map(admin -> "ACTIVE".equals(admin.getStatus()))
                .orElse(false);
    }

}
