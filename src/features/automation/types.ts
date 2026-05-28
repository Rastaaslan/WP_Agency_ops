export type AutomationTrigger =
  | "scan_succeeded"
  | "intervention_done"
  | "form_test_failed"
  | "security_warning"
  | "report_generated";

export type AutomationAction =
  | "generate_summary"
  | "add_to_report"
  | "create_alert"
  | "create_recommendation"
  | "notify_user";

export type AutomationRule = {
  id: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  enabled: boolean;
};
