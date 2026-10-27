
package com.foonyx.stockflow.dto.auth;

import com.foonyx.stockflow.entity.Admin;

public class AdminResponse {

    private Long id;
    private String username;
    private String status;

    public AdminResponse(Admin admin) {
        this.id = admin.getId();
        this.username = admin.getUsername();
        this.status = admin.getStatus();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getStatus() {
        return status;
    }
}
