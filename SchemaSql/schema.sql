-- public.server_inventory definition

-- Drop table

-- DROP TABLE public.server_inventory;

CREATE TABLE public.server_inventory (
	id bigserial NOT NULL,
	server_name text NULL,
	ip_address text NULL,
	dns_name text NULL,
	power_state text NULL,
	create_date text NULL,
	"location" text NULL,
	zone_lv text NULL,
	application_name text NULL,
	system_environment text NULL,
	"function" text NULL,
	status text NULL,
	decommission_date text NULL,
	decom_duration_days text NULL,
	need_terminate_process text NULL,
	terminated_date text NULL,
	os text NULL,
	os_version text NULL,
	service_pack text NULL,
	cpu text NULL,
	memory text NULL,
	disk text NULL,
	update_patch_project text NULL,
	veritas_backup text NULL,
	test_dr text NULL,
	critical_app text NULL,
	pttep_server_owner text NULL,
	pttep_application_owner text NULL,
	application_support_department text NULL,
	application_support_name text NULL,
	application_support_email text NULL,
	server_focal_point text NULL,
	request_channel_for_pttep text NULL,
	ticket_id_request_for_ptt_digital text NULL,
	remark text NULL,
	application_support_email_1 varchar(50) NULL,
	CONSTRAINT server_inventory_pkey PRIMARY KEY (id)
);