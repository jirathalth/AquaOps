export function buildMappingSyncPlan(existingPermissionIds: readonly string[], requiredPermissionIds: readonly string[]) {
  const existing = new Set(existingPermissionIds);
  const required = new Set(requiredPermissionIds);
  return {
    add: requiredPermissionIds.filter((id) => !existing.has(id)),
    remove: existingPermissionIds.filter((id) => !required.has(id)),
  };
}
