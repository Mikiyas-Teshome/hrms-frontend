export const GET_COMP_OFF_BALANCE_QUERY = `
  query CompOffBalance($userId: ID!) {
    compOffBalance(userId: $userId) {
      totalDays
      entries {
        id
        earnedFromDate
        creditDays
        expiryDate
        isConsumed
        isExpired
        consumedDate
      }
    }
  }
`;

export const GET_COMP_OFF_HISTORY_QUERY = `
  query CompOffHistory($userId: ID!) {
    compOffHistory(userId: $userId) {
      id
      earnedFromDate
      creditDays
      expiryDate
      isConsumed
      isExpired
      consumedDate
    }
  }
`;

export const GET_COMP_OFF_POLICY_QUERY = `
  query CompOffPolicy {
    compOffPolicy {
      id
      companyId
      creditRatioMinutes
      creditMultiplier
      expiryDays
      minOvertimeMinutes
      allowHoliday
      allowWeekend
      allowDutyShift
    }
  }
`;

export const UPSERT_COMP_OFF_POLICY_MUTATION = `
  mutation UpsertCompOffPolicy($input: UpsertCompOffPolicyInput!) {
    upsertCompOffPolicy(input: $input) {
      id
      companyId
      creditRatioMinutes
      creditMultiplier
      expiryDays
      minOvertimeMinutes
      allowHoliday
      allowWeekend
      allowDutyShift
    }
  }
`;
