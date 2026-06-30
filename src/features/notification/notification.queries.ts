export const NOTIFICATION_FIELDS_FRAGMENT = `
  fragment NotificationFields on Notification {
    id
    companyId
    recipientId
    recipient
    type
    subject
    content
    status
    errorMessage
    metadata
    sentAt
    readAt
    createdAt
    updatedAt
  }
`;

export const MY_NOTIFICATIONS_QUERY = `
  query MyNotifications {
    myNotifications {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FIELDS_FRAGMENT}
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = `
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FIELDS_FRAGMENT}
`;

export const REGISTER_PUSH_DEVICE_TOKEN_MUTATION = `
  mutation RegisterPushDeviceToken($token: String!, $platform: String, $userAgent: String) {
    registerPushDeviceToken(token: $token, platform: $platform, userAgent: $userAgent) {
      id
      token
    }
  }
`;

export const UNREGISTER_PUSH_DEVICE_TOKEN_MUTATION = `
  mutation UnregisterPushDeviceToken($token: String!) {
    unregisterPushDeviceToken(token: $token)
  }
`;
