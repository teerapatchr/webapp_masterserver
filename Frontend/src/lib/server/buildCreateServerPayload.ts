import type { ServerDetail } from "@/lib/types";

type FormLike = Record<string, string>;

const toUndefinedIfEmpty = (value: string) => {
    const v = value?.trim() ?? "";
    return v === "" ? undefined : v;
};

const toIntOrNull = (value: string) => {
    const v = value?.trim() ?? "";
    if (v === "") return null;

    const n = Number(v);
    return Number.isNaN(n) ? null : n;
};

export function buildCreateServerPayload(form: FormLike): Partial<ServerDetail> {
    return {
        server_name: toUndefinedIfEmpty(form.server_name),
        ip_address: toUndefinedIfEmpty(form.ip_address),
        dns_name: toUndefinedIfEmpty(form.dns_name),

        power_state: toUndefinedIfEmpty(form.power_state),
        create_date: toUndefinedIfEmpty(form.create_date),

        location: toUndefinedIfEmpty(form.location),
        zone_lv: toUndefinedIfEmpty(form.zone_lv),

        application_name: toUndefinedIfEmpty(form.application_name),
        system_environment: toUndefinedIfEmpty(form.system_environment),
        function: toUndefinedIfEmpty(form.function),

        status: toUndefinedIfEmpty(form.status),

        decommission_date: toUndefinedIfEmpty(form.decommission_date),
        decom_duration_days: toIntOrNull(form.decom_duration_days),
        need_terminate_process: toUndefinedIfEmpty(form.need_terminate_process),
        terminated_date: toUndefinedIfEmpty(form.terminated_date),

        os: toUndefinedIfEmpty(form.os),
        os_version: toUndefinedIfEmpty(form.os_version),
        service_pack: toUndefinedIfEmpty(form.service_pack),

        cpu: toUndefinedIfEmpty(form.cpu),
        memory: toUndefinedIfEmpty(form.memory),
        disk: toUndefinedIfEmpty(form.disk),

        update_patch_project: toUndefinedIfEmpty(form.update_patch_project),
        veritas_backup: toUndefinedIfEmpty(form.veritas_backup),
        test_dr: toUndefinedIfEmpty(form.test_dr),

        critical_app: toUndefinedIfEmpty(form.critical_app),

        pttep_server_owner: toUndefinedIfEmpty(form.pttep_server_owner),
        pttep_application_owner: toUndefinedIfEmpty(form.pttep_application_owner),

        application_support_department: toUndefinedIfEmpty(form.application_support_department),
        application_support_name: toUndefinedIfEmpty(form.application_support_name),
        application_support_email: toUndefinedIfEmpty(form.application_support_email),

        server_focal_point: toUndefinedIfEmpty(form.server_focal_point),

        request_channel_for_pttep: toUndefinedIfEmpty(form.request_channel_for_pttep),
        ticket_id_request_for_ptt_digital: toUndefinedIfEmpty(form.ticket_id_request_for_ptt_digital),

        remark: toUndefinedIfEmpty(form.remark),
    };
}