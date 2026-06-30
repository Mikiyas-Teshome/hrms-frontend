export const ANNOUNCEMENT_FIELDS_FRAGMENT = `
  fragment AnnouncementFields on Announcement {
    id
    companyId
    title
    body
    status
    audience
    departmentOuId
    publishedAt
    expiresAt
    createdById
    createdAt
    updatedAt
  }
`;

export const ANNOUNCEMENTS_FOR_CURRENT_USER_QUERY = `
  query AnnouncementsForCurrentUser($limit: Int) {
    announcementsForCurrentUser(limit: $limit) {
      ...AnnouncementFields
    }
  }
  ${ANNOUNCEMENT_FIELDS_FRAGMENT}
`;

export const CREATE_AND_PUBLISH_ANNOUNCEMENT_MUTATION = `
  mutation CreateAndPublishAnnouncement($input: CreateAnnouncementInput!) {
    createAndPublishAnnouncement(input: $input) {
      ...AnnouncementFields
    }
  }
  ${ANNOUNCEMENT_FIELDS_FRAGMENT}
`;
