
package com.foonyx.stockflow.config;

import com.foonyx.stockflow.entity.Admin;
import com.foonyx.stockflow.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSetupConfig {

    @Bean
    public CommandLineRunner createInitialAdmin(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username:}") String username,
            @Value("${app.admin.password:}") String password) {

        return args -> {
            if (username.isBlank() || password.isBlank()) {
                throw new IllegalStateException(
                        "Initial admin credentials are missing. "
                                + "Configure APP_ADMIN_USERNAME and "
                                + "APP_ADMIN_PASSWORD.");
            }

            if (adminRepository.existsByUsername(username)) {
                return;
            }

            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(password));

            adminRepository.save(admin);

            System.out.println("Initial administrator account created.");
        };
    }
}
