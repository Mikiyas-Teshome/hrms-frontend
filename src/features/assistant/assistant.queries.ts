import { gql } from 'graphql-request';

export const GET_ASSISTANT_FILTER_OPTIONS_QUERY = gql`
  query AssistantFilterOptions {
    assistantFilterOptions {
      organizations {
        id
        label
      }
      focusAreas {
        id
        label
      }
      datePresets {
        id
        label
      }
    }
  }
`;

export const GET_ASSISTANT_THREADS_QUERY = gql`
  query AssistantThreads($limit: Int) {
    assistantThreads(limit: $limit) {
      total
      items {
        id
        title
        contextFilters
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_ASSISTANT_THREAD_QUERY = gql`
  query AssistantThread($id: String!) {
    assistantThread(id: $id) {
      id
      title
      contextFilters
      createdAt
      updatedAt
      messages {
        id
        role
        content
        status
        followUpSuggestions
        summaryCards {
          label
          value
          trend
        }
        toolCalls {
          name
          scopeApplied
        }
        executionTimeMs
        createdAt
      }
    }
  }
`;

export const CREATE_ASSISTANT_THREAD_MUTATION = gql`
  mutation CreateAssistantThread($input: CreateAssistantThreadInput) {
    createAssistantThread(input: $input) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const SEND_ASSISTANT_MESSAGE_MUTATION = gql`
  mutation SendAssistantMessage($input: SendAssistantMessageInput!) {
    sendAssistantMessage(input: $input) {
      threadId
      filtersApplied
      message {
        id
        role
        content
        status
        followUpSuggestions
        summaryCards {
          label
          value
          trend
        }
        toolCalls {
          name
          scopeApplied
        }
        executionTimeMs
        createdAt
      }
    }
  }
`;

export const DELETE_ASSISTANT_THREAD_MUTATION = gql`
  mutation DeleteAssistantThread($id: String!) {
    deleteAssistantThread(id: $id)
  }
`;
