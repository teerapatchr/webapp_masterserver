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
  application_name: string;

  location: string;
  zone_lv: string;
  system_environment: string;
  status: string;
  power_state: string;

  os: string;
  os_version: string;
  cpu: string;
  memory: string;
  disk: string;

  critical_app: string;
  veritas_backup: string;
  test_dr: string;

  pttep_server_owner: string;
  pttep_application_owner: string;
  application_support_department: string;
  application_support_name: string;
  application_support_email: string;

  remark: string;
};

