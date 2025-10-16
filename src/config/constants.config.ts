export enum TRANSACTION_TYPE {
    FUND = "fund",
    WITHDRAW = "withdraw",
    TRANSFER = "transfer",
    REVERSAL = "reversal"
}

export enum TRANSACTION_DIRECTION {
    CREDIT = "credit",
    DEBIT = "debit"
}

export enum TRANSACTION_STATUS {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
}

export enum WALLET_STATUS {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
}