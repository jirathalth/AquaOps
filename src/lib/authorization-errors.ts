export class AuthenticationError extends Error { constructor(message = "Authentication required") { super(message); this.name = "AuthenticationError"; } }
export class InactiveUserError extends Error { constructor() { super("User account is inactive"); this.name = "InactiveUserError"; } }
export class AuthorizationError extends Error { constructor() { super("Permission denied"); this.name = "AuthorizationError"; } }
