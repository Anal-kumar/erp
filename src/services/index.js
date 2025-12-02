export { default as adminService } from "./adminService";
export { default as authService } from "./authService";
export { default as backupService } from "./backupService";
export { default as dashboardService } from "./dashboardService";
export { default as expiryReminderService } from "./expiryReminderService";
export { default as firmDetailsService } from "./firmDetailsService";
export { default as incomingService } from "./incomingService"
export { default as outgoingService } from "./outgoingService";
export { default as labourService } from "./labourService";
export { default as millService } from "./millService";
export { default as moduleService } from "./moduleService";
export { default as productionService } from "./productionService";
export { default as daybookService } from "./daybookService";

import apiClient from "./api";

export function getModuleStatus() {
  return apiClient.get("/modules/enabled_modules");
}


