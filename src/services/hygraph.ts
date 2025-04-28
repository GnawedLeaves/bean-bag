// src/services/hygraph.ts
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const API_URL = process.env.REACT_APP_HYGRAPH_API_URL || "";
const API_KEY = process.env.REACT_APP_HYGRAPH_API_KEY || "";

// Use createUploadLink instead of regular HttpLink to support file uploads
const uploadLink = createUploadLink({
  uri: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export const client = new ApolloClient({
  link: uploadLink,
  cache: new InMemoryCache(),
});

// Hygraph has a specific way to handle asset uploads
// The mutation name is typically 'createAsset' rather than 'uploadAsset'
const CREATE_ASSET = gql`
  mutation CreateAsset($file: Upload!) {
    createAsset(data: { file: $file }) {
      id
      url
    }
  }
`;

export const uploadImages = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    try {
      const result = await client.mutate({
        mutation: CREATE_ASSET,
        variables: { file }, // Changed from fileUpload to file
        context: {
          hasUpload: true,
        },
      });

      // Also need to publish the asset after creation
      if (result.data?.createAsset?.id) {
        await publishAsset(result.data.createAsset.id);
      }

      return result.data.createAsset.id;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

const PUBLISH_ASSET = gql`
  mutation PublishAsset($id: ID!) {
    publishAsset(where: { id: $id }) {
      id
    }
  }
`;

const publishAsset = async (id: string) => {
  return client.mutate({
    mutation: PUBLISH_ASSET,
    variables: { id },
  });
};

// Rest of your code for createEntry and getEntries remains the same
export const createEntry = async (
  title: string,
  content: string,
  location: any,
  imageIds: string[]
) => {
  const timestamp = new Date().toISOString();

  const CREATE_ENTRY = gql`
    mutation CreateEntry(
      $title: String!
      $content: String!
      $timestamp: DateTime!
      $location: JSON!
      $images: [AssetWhereUniqueInput!]!
    ) {
      createEntry(
        data: {
          title: $title
          content: $content
          timestamp: $timestamp
          location: $location
          images: { connect: $images }
        }
      ) {
        id
        title
      }
    }
  `;

  const imageConnections = imageIds.map((id) => ({ where: { id } }));

  const result = await client.mutate({
    mutation: CREATE_ENTRY,
    variables: {
      title,
      content,
      timestamp,
      location,
      images: imageConnections,
    },
  });

  // Publish the entry (required in Hygraph)
  const PUBLISH_ENTRY = gql`
    mutation PublishEntry($id: ID!) {
      publishEntry(where: { id: $id }) {
        id
      }
    }
  `;

  await client.mutate({
    mutation: PUBLISH_ENTRY,
    variables: {
      id: result.data.createEntry.id,
    },
  });

  return result.data.createEntry;
};

export const getEntries = async () => {
  const GET_ALL_ENTRIES = gql`
    query GetAllEntries {
      entries {
        id
        title
        content
        timestamp
        location
        images {
          id
          url
          fileName
        }
      }
    }
  `;

  const result = await client.query({
    query: GET_ALL_ENTRIES,
  });

  return result.data.entries;
};
