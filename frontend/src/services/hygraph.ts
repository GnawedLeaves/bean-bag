import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";

const API_URL = process.env.REACT_APP_HYGRAPH_API_URL || "";
const API_KEY = process.env.REACT_APP_HYGRAPH_API_KEY || "";

const httpLink = new HttpLink({
  uri: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const CREATE_ASSET = gql`
  mutation CreateAsset($fileName: String!) {
    createAsset(data: { fileName: $fileName }) {
      id
      url
      upload {
        status
        expiresAt
        error {
          code
          message
        }
        requestPostData {
          url
          date
          key
          signature
          algorithm
          policy
          credential
          securityToken
        }
      }
    }
  }
`;

const PUBLISH_ASSET = gql`
  mutation PublishAsset($id: ID!) {
    publishAsset(where: { id: $id }, to: PUBLISHED) {
      id
      url
    }
  }
`;

const publishAsset = async (id: string) => {
  try {
    const response = await client.mutate({
      mutation: PUBLISH_ASSET,
      variables: { id },
    });
    return response.data.publishAsset;
  } catch (error) {
    console.error("Error publishing asset:", error);
    throw error;
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const result = await client.mutate({
      mutation: CREATE_ASSET,
      variables: {
        fileName: file.name,
      },
    });

    if (!result.data?.createAsset) {
      throw new Error("Failed to create asset");
    }

    const { id, upload } = result.data.createAsset;

    console.log("=== UPLOAD DEBUG INFO ===");
    console.log("Asset ID:", id);
    console.log("Upload status:", upload.status);
    console.log("Upload expires at:", upload.expiresAt);
    console.log("Request POST data:", upload.requestPostData);

    if (upload.status !== "ASSET_CREATE_PENDING") {
      throw new Error(
        `Asset creation failed: ${upload.error?.message || "Unknown error"}`
      );
    }

    const expiresAt = new Date(upload.expiresAt);
    const now = new Date();
    if (now >= expiresAt) {
      throw new Error("Upload URL has expired");
    }

    const {
      url,
      date,
      key,
      signature,
      algorithm,
      policy,
      credential,
      securityToken,
    } = upload.requestPostData;

    const formData = new FormData();

    if (key) formData.append("key", key);
    if (policy) formData.append("policy", policy);
    if (algorithm) formData.append("x-amz-algorithm", algorithm);
    if (credential) formData.append("x-amz-credential", credential);
    if (date) formData.append("x-amz-date", date);
    if (signature) formData.append("x-amz-signature", signature);
    if (securityToken) formData.append("x-amz-security-token", securityToken);

    formData.append("file", file);

    console.log("=== FORM DATA ENTRIES ===");
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (typeof value === "string") {
        console.log(
          `${key}: ${
            value.length > 100 ? value.substring(0, 100) + "..." : value
          }`
        );
      } else {
        console.log(
          `${key}: File - ${value.name} (${value.size} bytes, ${value.type})`
        );
      }
    });

    console.log(
      "Total FormData entries:",
      Array.from(formData.entries()).length
    );

    console.log("=== EXECUTING UPLOAD ===");
    console.log("Uploading to URL:", url);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    console.log("=== UPLOAD RESPONSE ===");
    console.log("Status:", uploadResponse.status);
    console.log("Status Text:", uploadResponse.statusText);
    console.log(
      "Headers:",
      Object.fromEntries(uploadResponse.headers.entries())
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("=== UPLOAD FAILED ===");
      console.error("Error response:", errorText);

      if (errorText.includes("<?xml")) {
        console.error("S3 XML Error detected");
      }

      throw new Error(
        `Upload failed with status: ${uploadResponse.status} - ${errorText}`
      );
    }

    console.log("=== UPLOAD SUCCESS ===");
    const successText = await uploadResponse.text();
    console.log("Success response:", uploadResponse);

    console.log("Waiting for asset to process before publishing...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await publishAsset(id);

    console.log(`Successfully uploaded and published asset with ID: ${id}`);
    return id;
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Error in uploadImage:", error);
    throw error;
  }
};

export const uploadImages = async (
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<string[]> => {
  try {
    const imageIds: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (onProgress) onProgress(i + 1, files.length, file.name);
      const imageId = await uploadImage(file);
      imageIds.push(imageId);
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return imageIds;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

export const createBlogEntry = async (
  title: string,
  content: string,
  location: any,
  imageIds: string[],
  dateAdded: string
) => {
  const timestamp = dateAdded;

  const CREATE_ENTRY = gql`
    mutation CreateEntry(
      $title: String!
      $content: String!
      $timestamp: DateTime!
      $location: LocationInput!
      $imageConnections: [AssetWhereUniqueInput!]!
    ) {
      createBlogEntry(
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
    const imageConnections = imageIds.map((id) => ({ id }));

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

    console.log({ result });

    if (!result.data?.createBlogEntry?.id) {
      throw new Error("Failed to create entry");
    }

    const PUBLISH_ENTRY = gql`
      mutation PublishEntry($id: ID!) {
        publishBlogEntry(where: { id: $id }, to: PUBLISHED) {
          id
        }
      }
    `;

    await client.mutate({
      mutation: PUBLISH_ENTRY,
      variables: {
        id: result.data.createBlogEntry.id,
      },
    });

    return result.data.createBlogEntry;
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
};

export const getBlogEntries = async () => {
  const GET_ALL_ENTRIES = gql`
    query GetAllBlogs($first: Int!, $skip: Int!) {
      blogEntries(first: $first, skip: $skip, orderBy: timestamp_DESC) {
        id
        title
        content
        timestamp
        images {
          url
          fileName
        }
        location {
          latitude
          longitude
        }
      }
    }
  `;

  const allEntries: any[] = [];
  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await client.query({
      query: GET_ALL_ENTRIES,
      variables: { first: batchSize, skip },
      fetchPolicy: "network-only",
    });

    const entries = result.data.blogEntries;
    allEntries.push(...entries);

    if (entries.length < batchSize) {
      hasMore = false;
    } else {
      skip += batchSize;
    }
  }

  return allEntries;
};

export const createPlantEntry = async (
  title: string,
  content: string,
  plantName: string,
  location: any,
  imageIds: string[]
) => {
  const timestamp = new Date().toISOString();

  const CREATE_ENTRY = gql`
    mutation CreateEntry(
      $title: String!
      $content: String!
      $plantName: String!
      $timestamp: DateTime!
      $location: LocationInput!
      $imageConnections: [AssetWhereUniqueInput!]!
    ) {
      createPlantEntry(
        data: {
          title: $title
          content: $content
          plantName: $plantName
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
    const imageConnections = imageIds.map((id) => ({ id }));

    const result = await client.mutate({
      mutation: CREATE_ENTRY,
      variables: {
        title,
        content,
        plantName,
        timestamp,
        location,
        imageConnections,
      },
    });

    console.log({ result });

    if (!result.data?.createPlantEntry?.id) {
      throw new Error("Failed to create entry");
    }

    const PUBLISH_ENTRY = gql`
      mutation PublishEntry($id: ID!) {
        publishPlantEntry(where: { id: $id }, to: PUBLISHED) {
          id
        }
      }
    `;

    await client.mutate({
      mutation: PUBLISH_ENTRY,
      variables: {
        id: result.data.createPlantEntry.id,
      },
    });

    return result.data.createPlantEntry;
  } catch (error) {
    console.error("Error creating plant entry:", error);
    throw error;
  }
};

export const getPlantEntries = async () => {
  const GET_ALL_ENTRIES = gql`
    query GetAllPlants {
      plantEntries {
        title
        content
        plantName
        timestamp
        images {
          url
          fileName
        }
        location {
          latitude
          longitude
        }
      }
    }
  `;

  try {
    const result = await client.query({
      query: GET_ALL_ENTRIES,
      fetchPolicy: "network-only",
    });

    return result.data.plantEntries;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};

export const getAssetUrlById = async (assetId: string): Promise<string> => {
  try {
    const GET_ASSET_URL = gql`
      query GetAssetUrl($id: ID!) {
        asset(where: { id: $id }) {
          url
        }
      }
    `;

    const result = await client.query({
      query: GET_ASSET_URL,
      variables: { id: assetId },
    });

    if (!result.data?.asset?.url) {
      throw new Error("Failed to get asset URL");
    }

    return result.data.asset.url;
  } catch (error) {
    console.error("Error getting asset URL:", error);
    throw error;
  }
};
