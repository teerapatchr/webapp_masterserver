import type { FormState } from "@/lib/server/add-server.types";

export const POWER_STATE_OPTIONS = ["Power On", "Power Off"];
export const STATUS_OPTIONS = ["Operation", "Decommissioning", "Terminated"];
export const YES_NO_OPTIONS = ["Yes", "No"];
export const ENV_OPTIONS = ["POC", "Test", "DEV", "QAS", "UAT", "PRD", "Other"];
export const REQUEST_CHANNEL_OPTIONS = ["Promopcare", "Dcloud", "Oneclick", "Email", "CQR", "Other"];

export const REQUIRED_FIELDS: (keyof FormState)[] = [
    "server_name",
    "ip_address",
    "location",
    "system_environment",
    "status",
    "power_state",
    "critical_app",
    "pttep_server_owner",
];