//Type to insert into database.
export type FormState = {
    id: string;
    server_name: string;
    ip_address: string;
    dns_name: string;
    power_state: string;
    create_date: string;
    location: string;
    zone_lv: string;
    application_name: string;
    system_environment: string;
    function: string;
    status: string;
    decommission_date: string;
    decom_duration_days: string;
    need_terminate_process: string;
    terminated_date: string;
    os: string;
    os_version: string;
    service_pack: string;
    cpu: string;
    memory: string;
    disk: string;
    update_patch_project: string;
    veritas_backup: string;
    test_dr: string;
    critical_app: string;
    pttep_server_owner: string;
    pttep_application_owner: string;
    application_support_department: string;
    application_support_name: string;
    application_support_email: string;
    server_focal_point: string;
    request_channel_for_pttep: string;
    ticket_id_request_for_ptt_digital: string;
    remark: string;
};

//Empty form state for reset and initialization. Adjust default values if your DB has NOT NULL constraints.
export const EMPTY: FormState = {
    id: "",
    server_name: "",
    ip_address: "",
    dns_name: "",
    power_state: "",
    create_date: "",
    location: "",
    zone_lv: "",
    application_name: "",
    system_environment: "",
    function: "",
    status: "",
    decommission_date: "",
    decom_duration_days: "",
    need_terminate_process: "",
    terminated_date: "",
    os: "",
    os_version: "",
    service_pack: "",
    cpu: "",
    memory: "",
    disk: "",
    update_patch_project: "",
    veritas_backup: "",
    test_dr: "",
    critical_app: "",
    pttep_server_owner: "",
    pttep_application_owner: "",
    application_support_department: "",
    application_support_name: "",
    application_support_email: "",
    server_focal_point: "",
    request_channel_for_pttep: "",
    ticket_id_request_for_ptt_digital: "",
    remark: "",
};
