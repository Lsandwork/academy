export const CONTRACT_STATUS = {
  PENDING_ADMIN: "pending_admin",
  APPROVED: "approved",
  ACTIVE: "active",
  DECLINED: "declined",
  COMPLETED: "completed"
} as const;

export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

export const PENDING_STATUSES = [CONTRACT_STATUS.PENDING_ADMIN, "pending"] as const;

export function isApprovedContractStatus(status: string) {
  return status === CONTRACT_STATUS.APPROVED || status === CONTRACT_STATUS.ACTIVE || status === CONTRACT_STATUS.COMPLETED;
}

export function contractStatusLabel(status: string) {
  switch (status) {
    case CONTRACT_STATUS.PENDING_ADMIN:
    case "pending":
      return "Awaiting admin approval";
    case CONTRACT_STATUS.APPROVED:
      return "Approved";
    case CONTRACT_STATUS.ACTIVE:
      return "Active";
    case CONTRACT_STATUS.DECLINED:
      return "Declined";
    case CONTRACT_STATUS.COMPLETED:
      return "Completed";
    default:
      return status;
  }
}
