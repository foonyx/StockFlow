
package com.foonyx.stockflow.security;

import com.foonyx.stockflow.repository.AdminRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class ActiveAdminAuthorization {

    private final AdminRepository adminRepository;

    public ActiveAdminAuthorization(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public boolean isActiveAdmin(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            return false;
        }

        return adminRepository.findByUsername(authentication.getName())
                .map(admin -> "ACTIVE".equals(admin.getStatus()))
                .orElse(false);
    }
}
