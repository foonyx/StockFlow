
package com.foonyx.stockflow.controller;

import com.foonyx.stockflow.dto.auth.AdminResponse;
import com.foonyx.stockflow.service.auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminApprovalController {

    private final AuthService authService;

    public AdminApprovalController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AdminResponse>> getPendingAdmins() {
        return ResponseEntity.ok(authService.getPendingAdmins());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<String> approveAdmin(@PathVariable Long id) {
        authService.approveAdmin(id);
        return ResponseEntity.ok("Admin account approved successfully.");
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<String> rejectAdmin(@PathVariable Long id) {
        authService.rejectAdmin(id);
        return ResponseEntity.ok("Admin account rejected successfully.");
    }
}
