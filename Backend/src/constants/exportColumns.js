export const EXPORT_COLUMNS = [
    { key: "server_name", label: "Server Name", group: "Identity" },
    { key: "ip_address", label: "IP Address", group: "Identity" },
    { key: "dns_name", label: "DNS Name", group: "Identity" },
    { key: "location", label: "Location", group: "Identity" },
    { key: "zone_lv", label: "Zone Level", group: "Identity" },

    { key: "application_name", label: "Application Name", group: "Application" },
    { key: "pttep_server_owner", label: "Server Owner", group: "Application" },
    { key: "pttep_application_owner", label: "Application Owner", group: "Application" },

    { key: "system_environment", label: "Environment", group: "Environment" },
    { key: "function", label: "Function", group: "Environment" },
    { key: "status", label: "Status", group: "Environment" },
    { key: "power_state", label: "Power State", group: "Environment" },
    { key: "critical_app", label: "Critical App", group: "Environment" },

    { key: "create_date", label: "Create Date", group: "Lifecycle" },
    { key: "decommission_date", label: "Decommission Date", group: "Lifecycle" },
    { key: "decom_duration_days", label: "Decom Duration Days", group: "Lifecycle" },
    { key: "need_terminate_process", label: "Need Terminate Process", group: "Lifecycle" },
    { key: "terminated_date", label: "Terminated Date", group: "Lifecycle" },

    { key: "os", label: "OS", group: "System" },
    { key: "os_version", label: "OS Version", group: "System" },
    { key: "service_pack", label: "OS Service Pack", group: "System" },
    { key: "cpu", label: "CPU", group: "System" },
    { key: "memory", label: "Memory", group: "System" },
    { key: "disk", label: "Disk", group: "System" },

    { key: "update_patch_project", label: "Patch Project", group: "Operations" },
    { key: "veritas_backup", label: "Veritas Backup", group: "Operations" },
    { key: "test_dr", label: "Test DR", group: "Operations" },


    { key: "application_support_department", label: "Support Department", group: "Support" },
    { key: "application_support_name", label: "Support Name", group: "Support" },
    { key: "application_support_email", label: "Support Email", group: "Support" },
    { key: "server_focal_point", label: "Server Focal Point", group: "Support" },
    { key: "request_channel_for_pttep", label: "Request Channel", group: "Support" },
    { key: "ticket_id_request_for_ptt_digital", label: "Ticket ID", group: "Support" },

    { key: "remark", label: "Remark", group: "Notes" },
];

export const EXPORT_COL_SET = new Set(EXPORT_COLUMNS.map((c) => c.key));

