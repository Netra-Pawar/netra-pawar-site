import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "workos-api/workos",
    },
    {
      type: "category",
      label: "admin-portal",
      link: {
        type: "doc",
        id: "workos-api/admin-portal",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/portal-sessions-controller-create",
          label: "Generate a Portal Link",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "api_keys",
      link: {
        type: "doc",
        id: "workos-api/api-keys",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/api-keys-controller-validate-api-key",
          label: "Validate API key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/api-keys-controller-delete",
          label: "Delete an API key",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/api-keys-controller-expire",
          label: "Expire an API key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/user-api-keys-controller-list",
          label: "List API keys for a user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/user-api-keys-controller-create",
          label: "Create an API key for a user",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "application.client-secrets",
      link: {
        type: "doc",
        id: "workos-api/application-client-secrets",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/application-credentials-controller-list",
          label: "List Client Secrets for a Connect Application",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/application-credentials-controller-create",
          label: "Create a new client secret for a Connect Application",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/application-credentials-controller-delete",
          label: "Delete a Client Secret",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "applications",
      link: {
        type: "doc",
        id: "workos-api/applications",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/applications-controller-list",
          label: "List Connect Applications",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/applications-controller-create",
          label: "Create a Connect Application",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/applications-controller-find",
          label: "Get a Connect Application",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/applications-controller-update",
          label: "Update a Connect Application",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/applications-controller-delete",
          label: "Delete a Connect Application",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "audit-logs",
      link: {
        type: "doc",
        id: "workos-api/audit-logs",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/audit-log-validators-controller-list",
          label: "List Actions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/audit-log-validator-versions-controller-create",
          label: "Create Schema",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/audit-log-validator-versions-controller-schemas",
          label: "List Schemas",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/audit-log-events-controller-create",
          label: "Create Event",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/audit-log-exports-controller-exports",
          label: "Create Export",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/audit-log-exports-controller-export",
          label: "Get Export",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/audit-logs-retention-controller-audit-logs-retention",
          label: "Get Retention",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/audit-logs-retention-controller-update-audit-logs-retention",
          label: "Set Retention",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "authorization",
      link: {
        type: "doc",
        id: "workos-api/authorization",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/authorization-group-role-assignments-controller-list",
          label: "List role assignments for a group",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-group-role-assignments-controller-create",
          label: "Assign a role to a group",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-group-role-assignments-controller-replace-group-role-assignments",
          label: "Replace all role assignments for a group",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/authorization-group-role-assignments-controller-remove-group-role-assignments",
          label: "Remove group role assignments by criteria",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-group-role-assignments-controller-get",
          label: "Get a group role assignment",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-group-role-assignments-controller-remove-group-role-assignment",
          label: "Remove a group role assignment",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-controller-check",
          label: "Check authorization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-controller-list-resources-for-membership",
          label: "List resources for organization membership",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-controller-list-effective-permissions",
          label: "List effective permissions for an organization membership on a resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-controller-list-effective-permissions-by-external-id",
          label: "List effective permissions for an organization membership on a resource by external ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-assignments-controller-list-role-assignments",
          label: "List role assignments",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-assignments-controller-assign-role",
          label: "Assign a role",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-assignments-controller-remove-role-by-criteria",
          label: "Remove a role assignment",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-assignments-controller-remove-role-by-id",
          label: "Remove a role assignment by ID",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-roles-controller-create",
          label: "Create a custom role",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-roles-controller-list",
          label: "List custom roles",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-roles-controller-get",
          label: "Get a custom role",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-roles-controller-update",
          label: "Update a custom role",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-roles-controller-delete",
          label: "Delete a custom role",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-role-permissions-controller-set-permissions",
          label: "Set permissions for a custom role",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-role-permissions-controller-add-permission",
          label: "Add a permission to a custom role",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-organization-role-permissions-controller-remove-permission",
          label: "Remove a permission from a custom role",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-by-external-id-controller-get-by-external-id",
          label: "Get a resource by external ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-by-external-id-controller-update-by-external-id",
          label: "Update a resource by external ID",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-by-external-id-controller-delete-by-external-id",
          label: "Delete an authorization resource by external ID",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-by-external-id-controller-list-organization-memberships-for-resource-by-external-id",
          label: "List memberships for a resource by external ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-assignments-controller-list-role-assignments-for-resource-by-external-id",
          label: "List role assignments for a resource by external ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-controller-list",
          label: "List resources",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-controller-create",
          label: "Create an authorization resource",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-controller-find-by-id",
          label: "Get a resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-controller-update",
          label: "Update a resource",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-controller-delete",
          label: "Delete an authorization resource",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authorization-resources-controller-list-organization-memberships-for-resource",
          label: "List organization memberships for resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-assignments-controller-list-role-assignments-for-resource",
          label: "List role assignments for a resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-roles-controller-create",
          label: "Create an environment role",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-roles-controller-list",
          label: "List environment roles",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-roles-controller-get",
          label: "Get an environment role",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-roles-controller-update",
          label: "Update an environment role",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-permissions-controller-set-permissions",
          label: "Set permissions for an environment role",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/authorization-role-permissions-controller-add-permission",
          label: "Add a permission to an environment role",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "client",
      link: {
        type: "doc",
        id: "workos-api/client",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/client-api-token-controller-issue-client-api-token",
          label: "Generate a Client API token",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "connections",
      link: {
        type: "doc",
        id: "workos-api/connections",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/connections-controller-list",
          label: "List Connections",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/connections-controller-find",
          label: "Get a Connection",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/connections-controller-delete",
          label: "Delete a Connection",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "directories",
      link: {
        type: "doc",
        id: "workos-api/directories",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/directories-controller-list",
          label: "List Directories",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/directories-controller-find",
          label: "Get a Directory",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/directories-controller-delete-directory",
          label: "Delete a Directory",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "directory-groups",
      link: {
        type: "doc",
        id: "workos-api/directory-groups",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/directory-groups-controller-list",
          label: "List Directory Groups",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/directory-groups-controller-find",
          label: "Get a Directory Group",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "directory-users",
      link: {
        type: "doc",
        id: "workos-api/directory-users",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/directory-users-controller-list",
          label: "List Directory Users",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/directory-users-controller-find",
          label: "Get a Directory User",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "events",
      link: {
        type: "doc",
        id: "workos-api/events",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/events-controller-list",
          label: "List events",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "feature-flags",
      link: {
        type: "doc",
        id: "workos-api/feature-flags",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/feature-flags-controller-list",
          label: "List feature flags",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/feature-flags-controller-find-by-slug",
          label: "Get a feature flag",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/feature-flags-controller-disable-flag",
          label: "Disable a feature flag",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/feature-flags-controller-enable-flag",
          label: "Enable a feature flag",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "feature-flags.targets",
      link: {
        type: "doc",
        id: "workos-api/feature-flags-targets",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/flag-targets-controller-create-target",
          label: "Add a feature flag target",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/flag-targets-controller-delete-target",
          label: "Remove a feature flag target",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "groups",
      link: {
        type: "doc",
        id: "workos-api/groups",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/groups-controller-create",
          label: "Create a group",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/groups-controller-list",
          label: "List groups",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/groups-controller-get",
          label: "Get a group",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/groups-controller-update",
          label: "Update a group",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/groups-controller-delete",
          label: "Delete a group",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/group-memberships-controller-add-member",
          label: "Add a member to a Group",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/group-memberships-controller-list-members",
          label: "List Group members",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/group-memberships-controller-remove-member",
          label: "Remove a member from a Group",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "multi-factor-auth",
      link: {
        type: "doc",
        id: "workos-api/multi-factor-auth",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/authentication-factors-controller-create",
          label: "Enroll Factor",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authentication-factors-controller-get",
          label: "Get Factor",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authentication-factors-controller-delete",
          label: "Delete Factor",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/authentication-factors-controller-challenge",
          label: "Challenge Factor",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "multi-factor-auth.challenges",
      link: {
        type: "doc",
        id: "workos-api/multi-factor-auth-challenges",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/authentication-challenges-controller-verify",
          label: "Verify Challenge",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "organization-domains",
      link: {
        type: "doc",
        id: "workos-api/organization-domains",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/organization-domains-controller-create",
          label: "Create an Organization Domain",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/organization-domains-controller-get",
          label: "Get an Organization Domain",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/organization-domains-controller-delete",
          label: "Delete an Organization Domain",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/organization-domains-controller-verify",
          label: "Verify an Organization Domain",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "organizations",
      link: {
        type: "doc",
        id: "workos-api/organizations",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/organizations-controller-list",
          label: "List Organizations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/organizations-controller-create",
          label: "Create an Organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/organizations-controller-get-by-external-id",
          label: "Get an Organization by External ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/organizations-controller-find",
          label: "Get an Organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/organizations-controller-update-organization",
          label: "Update an Organization",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/organizations-controller-delete-organization",
          label: "Delete an Organization",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/organizations-controller-get-audit-log-configuration",
          label: "Get Audit Log Configuration",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "organizations.api_keys",
      link: {
        type: "doc",
        id: "workos-api/organizations-api-keys",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/organization-api-keys-controller-list",
          label: "List API keys for an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/organization-api-keys-controller-create",
          label: "Create an API key for an organization",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "organizations.feature-flags",
      link: {
        type: "doc",
        id: "workos-api/organizations-feature-flags",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/organization-feature-flags-controller-list",
          label: "List enabled feature flags for an organization",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "permissions",
      link: {
        type: "doc",
        id: "workos-api/permissions",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/authorization-permissions-controller-list",
          label: "List permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-permissions-controller-create",
          label: "Create a permission",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/authorization-permissions-controller-find",
          label: "Get a permission",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorization-permissions-controller-update",
          label: "Update a permission",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/authorization-permissions-controller-delete",
          label: "Delete a permission",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "pipes",
      link: {
        type: "doc",
        id: "workos-api/pipes",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/data-integrations-controller-get-data-integration-authorize-url",
          label: "Get authorization URL",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/data-integrations-controller-get-userland-user-token",
          label: "Get an access token for a connected account",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "pipes.provider",
      link: {
        type: "doc",
        id: "workos-api/pipes-provider",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/provider-controller-list-for-organization",
          label: "List providers for an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/provider-controller-configure",
          label: "Configure a provider for an organization",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "radar",
      link: {
        type: "doc",
        id: "workos-api/radar",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/radar-standalone-controller-assess",
          label: "Create an attempt",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/radar-standalone-controller-update-radar-attempt",
          label: "Update a Radar attempt",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/radar-standalone-controller-update-radar-list",
          label: "Add an entry to a Radar list",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/radar-standalone-controller-delete-radar-list-entry",
          label: "Remove an entry from a Radar list",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "sso",
      link: {
        type: "doc",
        id: "workos-api/sso",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/sso-controller-authorize",
          label: "Initiate SSO",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/sso-controller-logout",
          label: "Logout Redirect",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/sso-controller-logout-authorize",
          label: "Logout Authorize",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/sso-controller-get-profile",
          label: "Get a User Profile",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/sso-controller-token",
          label: "Get a Profile and Token",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.authentication",
      link: {
        type: "doc",
        id: "workos-api/user-management-authentication",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-sessions-controller-authenticate-0",
          label: "Authenticate",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-sso-controller-authorize",
          label: "Get an authorization URL",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-sso-controller-device-authorization",
          label: "Get device authorization URL",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-sessions-controller-logout",
          label: "Logout",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-sessions-controller-revoke-session",
          label: "Revoke Session",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.cors-origins",
      link: {
        type: "doc",
        id: "workos-api/user-management-cors-origins",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/cors-origins-controller-create-cors-origin",
          label: "Create a CORS origin",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.data-providers",
      link: {
        type: "doc",
        id: "workos-api/user-management-data-providers",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/data-integrations-user-management-controller-get-user-data-installation",
          label: "Get a connected account",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/data-integrations-user-management-controller-delete-user-data-installation",
          label: "Delete a connected account",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/data-integrations-user-management-controller-get-user-data-integrations",
          label: "List providers for a user",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.invitations",
      link: {
        type: "doc",
        id: "workos-api/user-management-invitations",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-list",
          label: "List invitations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-create",
          label: "Send an invitation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-get-by-token",
          label: "Find an invitation by token",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-get",
          label: "Get an invitation",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-accept",
          label: "Accept an invitation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-resend",
          label: "Resend an invitation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-invites-controller-revoke",
          label: "Revoke an invitation",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.jwt-template",
      link: {
        type: "doc",
        id: "workos-api/user-management-jwt-template",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/jwt-templates-controller-get-jwt-template",
          label: "Get JWT template",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/jwt-templates-controller-update-jwt-template",
          label: "Update JWT template",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.magic-auth",
      link: {
        type: "doc",
        id: "workos-api/user-management-magic-auth",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-magic-auth-controller-send-magic-auth-code-and-return",
          label: "Create a Magic Auth code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-magic-auth-controller-get",
          label: "Get Magic Auth code details",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.multi-factor-authentication",
      link: {
        type: "doc",
        id: "workos-api/user-management-multi-factor-authentication",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-user-authentication-factors-controller-create-0",
          label: "Enroll an authentication factor",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-authentication-factors-controller-list-0",
          label: "List authentication factors",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.organization-membership",
      link: {
        type: "doc",
        id: "workos-api/user-management-organization-membership",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-list",
          label: "List organization memberships",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-create",
          label: "Create an organization membership",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-get",
          label: "Get an organization membership",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-delete",
          label: "Delete an organization membership",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-update",
          label: "Update an organization membership",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-deactivate",
          label: "Deactivate an organization membership",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-organization-memberships-controller-reactivate",
          label: "Reactivate an organization membership",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.organization-membership.groups",
      link: {
        type: "doc",
        id: "workos-api/user-management-organization-membership-groups",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/organization-membership-groups-controller-list-groups",
          label: "List groups",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.redirect-uris",
      link: {
        type: "doc",
        id: "workos-api/user-management-redirect-uris",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/redirect-uris-controller-create",
          label: "Create a redirect URI",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.session-tokens",
      link: {
        type: "doc",
        id: "workos-api/user-management-session-tokens",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/sso-controller-json-web-key-set",
          label: "Get JWKS",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.users",
      link: {
        type: "doc",
        id: "workos-api/user-management-users",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-users-controller-get-email-verification",
          label: "Get an email verification code",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-create-password-reset-token",
          label: "Create a password reset token",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-reset-password-0",
          label: "Reset the password",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-get-password-reset",
          label: "Get a password reset token",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-list-0",
          label: "List users",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-create-0",
          label: "Create a user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-get-by-external-id",
          label: "Get a user by external ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-update-0",
          label: "Update a user",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-get-0",
          label: "Get a user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-delete-0",
          label: "Delete a user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-confirm-email-change",
          label: "Confirm email change",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-send-email-change",
          label: "Send email change code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-email-verification-0",
          label: "Verify email",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-users-controller-send-verification-email-0",
          label: "Send verification email",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-identities-controller-get",
          label: "Get user identities",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/userland-user-sessions-controller-list",
          label: "List sessions",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.users.authorized-applications",
      link: {
        type: "doc",
        id: "workos-api/user-management-users-authorized-applications",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/authorized-applications-controller-list",
          label: "List authorized applications",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/authorized-applications-controller-delete",
          label: "Delete an authorized application",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "user-management.users.feature-flags",
      link: {
        type: "doc",
        id: "workos-api/user-management-users-feature-flags",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/userland-user-feature-flags-controller-list",
          label: "List enabled feature flags for a user",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "vault",
      link: {
        type: "doc",
        id: "workos-api/vault",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/jump-wire-web-key-controller-create-data-key",
          label: "Create a data key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-key-controller-decrypt",
          label: "Decrypt a data key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-key-controller-rekey",
          label: "Re-encrypt a data key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-index",
          label: "List objects",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-create",
          label: "Create an object",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-show-by-name",
          label: "Read an object by name",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-delete",
          label: "Delete an object",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-show-by-id",
          label: "Read an object by ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-update",
          label: "Update an object",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-describe",
          label: "Describe an object",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/jump-wire-web-data-vault-controller-versions",
          label: "List object versions",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "webhooks",
      link: {
        type: "doc",
        id: "workos-api/webhooks",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/webhook-endpoints-controller-list",
          label: "List Webhook Endpoints",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "workos-api/webhook-endpoints-controller-create",
          label: "Create a Webhook Endpoint",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "workos-api/webhook-endpoints-controller-update",
          label: "Update a Webhook Endpoint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "workos-api/webhook-endpoints-controller-delete",
          label: "Delete a Webhook Endpoint",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "widgets",
      link: {
        type: "doc",
        id: "workos-api/widgets",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/widgets-public-controller-issue-widget-session-token",
          label: "Generate a widget token",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "workos-connect",
      link: {
        type: "doc",
        id: "workos-api/workos-connect",
      },
      items: [
        {
          type: "doc",
          id: "workos-api/external-auth-controller-complete-login",
          label: "Complete external authentication",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
