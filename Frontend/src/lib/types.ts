export type ServerInventory = {
  id: string;
  server_name: string;
  ip_address: string;
  application_name: string;
  location: string;
  system_environment: string;
  status: string;
  power_state: string;
  critical_app: string;
  pttep_server_owner: string;
};

export type ServerDetail = {
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


