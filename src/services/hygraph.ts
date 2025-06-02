import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";

const API_URL = process.env.REACT_APP_HYGRAPH_API_URL || "";
const API_KEY = process.env.REACT_APP_HYGRAPH_API_KEY || "";

// Create HTTP link
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

// Step 1: Create asset mutation with filename
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

// Publish asset mutation
const PUBLISH_ASSET = gql`
  mutation PublishAsset($id: ID!) {
    publishAsset(where: { id: $id }, to: PUBLISHED) {
      id
      url
    }
  }
`;

// Function to publish an asset after upload
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

// Main upload function for a single image - DEBUG VERSION
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Step 1: Create asset and get pre-signed URL data
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

    // Check if asset creation was successful
    if (upload.status !== "ASSET_CREATE_PENDING") {
      throw new Error(
        `Asset creation failed: ${upload.error?.message || "Unknown error"}`
      );
    }

    // Check if upload hasn't expired
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

    // Log what we extracted
    console.log("=== EXTRACTED FIELDS ===");
    console.log("URL:", url);
    console.log("Key:", key);
    console.log("Algorithm:", algorithm);
    console.log("Credential:", credential);
    console.log("Date:", date);
    console.log("Policy:", policy);
    console.log("Signature:", signature);
    console.log("Security Token:", securityToken);
    console.log("File type:", file.type);
    console.log("File name:", file.name);

    // Step 2: Upload file using pre-signed URL
    const formData = new FormData();

    // CRITICAL: Try the exact order that Hygraph/AWS expects
    // Based on AWS S3 documentation, this is typically the correct order:

    if (key) formData.append("key", key);
    if (policy) formData.append("policy", policy);
    if (algorithm) formData.append("x-amz-algorithm", algorithm);
    if (credential) formData.append("x-amz-credential", credential);
    if (date) formData.append("x-amz-date", date);
    if (signature) formData.append("x-amz-signature", signature);
    if (securityToken) formData.append("x-amz-security-token", securityToken);

    // Don't add content-type to FormData - let AWS handle it
    // formData.append("content-type", file.type);

    // File must be added last
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

    // Execute the upload - don't set any headers, let browser handle it
    console.log("=== EXECUTING UPLOAD ===");
    console.log("Uploading to URL:", url);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
      // Don't set any headers - FormData boundary is auto-generated
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

      // Try to parse XML error if it's from S3
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

    // Step 3: Publish the asset to make it available
    console.log("Waiting for asset to process before publishing...");
    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds
    await publishAsset(id);

    console.log(`Successfully uploaded and published asset with ID: ${id}`);
    return id;
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Error in uploadImage:", error);
    throw error;
  }
};

// Function to upload multiple images (replacement for your uploadImages)
export const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    console.log(`Starting upload of ${files.length} files`);

    // Upload files one by one to avoid overwhelming the API
    const imageIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

      const imageId = await uploadImage(file);
      imageIds.push(imageId);

      // Small delay between uploads to be respectful to the API
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`Successfully uploaded all ${imageIds.length} images`);
    console.log({ imageIds });
    return imageIds;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

// Your existing createEntry function (unchanged)
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
    // Create connections for the images
    const imageConnections = imageIds.map((id) => ({ id }));

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

// Your existing getEntries function (unchanged)
export const getEntries = async () => {
  const GET_ALL_ENTRIES = gql`
    query GetAllBlogs {
      blogEntries {
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

  try {
    const result = await client.query({
      query: GET_ALL_ENTRIES,
      fetchPolicy: "network-only",
    });

    return result.data.blogEntries;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};
