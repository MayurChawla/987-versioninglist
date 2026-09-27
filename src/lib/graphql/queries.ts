import { gql } from "@apollo/client";

export const GET_RELEASES = gql`
  query GetReleases {
    releases {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const GET_RELEASE_STEPS = gql`
  query GetReleaseSteps {
    releaseSteps {
      id
      name
      description
    }
  }
`;

export const CREATE_RELEASE = gql`
  mutation CreateRelease($input: CreateReleaseInput!) {
    createRelease(input: $input) {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const UPDATE_RELEASE = gql`
  mutation UpdateRelease($id: ID!, $input: UpdateReleaseInput!) {
    updateRelease(id: $id, input: $input) {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const TOGGLE_STEP = gql`
  mutation ToggleStep($releaseId: ID!, $stepId: String!, $completed: Boolean!) {
    toggleStep(releaseId: $releaseId, stepId: $stepId, completed: $completed) {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const START_AUTO_PROGRESS = gql`
  mutation StartAutoProgress($releaseId: ID!) {
    startAutoProgress(releaseId: $releaseId) {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const STOP_AUTO_PROGRESS = gql`
  mutation StopAutoProgress($releaseId: ID!) {
    stopAutoProgress(releaseId: $releaseId) {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const RESET_RELEASE_STEPS = gql`
  mutation ResetReleaseSteps($releaseId: ID!) {
    resetReleaseSteps(releaseId: $releaseId) {
      id
      name
      date
      additionalInfo
      completedSteps
      status
      totalSteps
      completedCount
      createdAt
      updatedAt
      isAutoProgressing
      steps {
        id
        name
        description
        completed
      }
    }
  }
`;

export const DELETE_RELEASE = gql`
  mutation DeleteRelease($id: ID!) {
    deleteRelease(id: $id)
  }
`;

