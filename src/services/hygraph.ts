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

// Define the mutation for creating an asset in Hygraph
const CREATE_ASSET = gql`
  mutation CreateAsset($file: Upload!) {
    createAsset(data: { file: $file }) {
      id
      url
    }
  }
`;

const PUBLISH_ASSET = gql`
  mutation PublishAsset($id: ID!) {
    publishAsset(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

// Function to publish an asset after creation
const publishAsset = async (id: string) => {
  try {
    return await client.mutate({
      mutation: PUBLISH_ASSET,
      variables: { id },
    });
  } catch (error) {
    console.error("Error publishing asset:", error);
    throw error;
  }
};

// Function to upload multiple images
export const uploadImages = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    try {
      // Create a file variable for the mutation
      const result = await client.mutate({
        mutation: CREATE_ASSET,
        variables: { file },
        context: {
          hasUpload: true,
        },
      });

      if (!result.data?.createAsset?.id) {
        throw new Error("Failed to get asset ID after upload");
      }

      const assetId = result.data.createAsset.id;

      // Publish the asset after creation
      await publishAsset(assetId);

      return assetId;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

// Create a blog entry with connected images
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
      $imageConnections: [AssetWhereUniqueInput!]!
    ) {
      createEntry(
        data: {
          title: $title
          content: $content
          timestamp: $timestamp
          location: $location
          images: { connect: $imageConnections }
        }
      ) {
        id
        title
      }
    }
  `;

  try {
    // Create connections for the images
    const imageConnections = imageIds.map((id) => ({ where: { id } }));

    // Create the entry
    const result = await client.mutate({
      mutation: CREATE_ENTRY,
      variables: {
        title,
        content,
        timestamp,
        location,
        imageConnections,
      },
    });

    if (!result.data?.createEntry?.id) {
      throw new Error("Failed to create entry");
    }

    // Publish the entry
    const PUBLISH_ENTRY = gql`
      mutation PublishEntry($id: ID!) {
        publishEntry(where: { id: $id }, to: PUBLISHED) {
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
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
};

export const getEntries = async () => {
  const GET_ALL_ENTRIES = gql`
    query GetAllEntries {
      entries(orderBy: timestamp_DESC) {
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

  try {
    const result = await client.query({
      query: GET_ALL_ENTRIES,
      fetchPolicy: "network-only", // Don't use cache for this query
    });

    return result.data.entries;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};
