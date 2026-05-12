# Security Specification: Civil Completion Registry

## Data Invariants
1. A user profile (`users/{userId}`) can only be created by the authenticated owner.
2. The `role` field on a user profile is protected and cannot be changed by the user once set (or requires admin).
3. A `RegistryEntry` must have a valid `representativeUid` matching the signer's UID.
4. `presidentialSignature` and `presidentialSeal` are system-generated (simulated via client logic but logic-protected to be "immutable" once verified).
5. Once a `RegistryEntry` is `verified`, it cannot be modified by the user.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Creating a registry entry with a different `representativeUid`.
2. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile or registry entry.
3. **Role Escalation**: Updating own `role` from `citizen` to `official`.
4. **Forging Signature**: Providing a `presidentialSignature` during initial creation.
5. **Unauthorized Read**: Citizen trying to read another official's private info.
6. **Bypassing Terms**: Submitting an entry with `termsSigned: false`.
7. **Modifying Terminal State**: Changing a `verified` registry entry.
8. **PII Leak**: Reading `users/{otherUser}/private/info`.
9. **Orphaned Registration**: Creating a registry without a UID.
10. **Resource Poisoning**: Using a 1MB string as a city name.
11. **Time Spoofing**: Providing a manual `timestamp` instead of `request.time`.
12. **Double Signing**: Attempting to overwrite an existing registry ID.

## Security Rules Strategy
- Use `isValidUser` and `isValidRegistry` helpers.
- Enforce strict key checks with `hasAll` and `size()`.
- Use `affectedKeys().hasOnly()` for updates.
- Isolate PII in subcollections.
