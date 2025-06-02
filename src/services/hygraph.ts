import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";

const API_URL = process.env.REACT_APP_HYGRAPH_API_URL || "";
const API_KEY = process.env.REACT_APP_HYGRAPH_API_KEY || "";

// Create a regular HTTP link instead of an upload link
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

// Define the mutation for creating an asset in Hygraph using the correct structure
const CREATE_ASSET = gql`
  mutation CreateAsset {
    createAsset(data: {}) {
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

// Function to publish an asset after creation
const publishAsset = async (id: string) => {
  try {
    const response = await client.mutate({
      mutation: PUBLISH_ASSET,
      variables: { id },
    });
    console.log("Asset published:", response);
    return response;
  } catch (error) {
    console.error("Error publishing asset:", error);
    throw error;
  }
};

// Function to upload multiple images using direct upload
export const uploadImages = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    try {
      // Step 1: Request upload URL from Hygraph
      const result = await client.mutate({
        mutation: CREATE_ASSET,
        variables: {},
      });

      if (!result.data?.createAsset) {
        throw new Error("Failed to get upload URL");
      }

      const { id, upload } = result.data.createAsset;

      if (upload.status !== "CREATED") {
        throw new Error(
          `Upload preparation failed: ${
            upload.error?.message || "Unknown error"
          }`
        );
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

      // Step 2: Prepare form data for direct upload
      const formData = new FormData();

      // Add all required AWS S3 fields
      if (date) formData.append("x-amz-date", date);
      if (key) formData.append("key", key);
      if (signature) formData.append("x-amz-signature", signature);
      if (algorithm) formData.append("x-amz-algorithm", algorithm);
      if (policy) formData.append("policy", policy);
      if (credential) formData.append("x-amz-credential", credential);
      if (securityToken) formData.append("x-amz-security-token", securityToken);

      // Add content type based on file
      formData.append("content-type", file.type);

      // Add file as the last field
      formData.append("file", file);

      // Step 3: Upload file directly to the provider
      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload response:", errorText);
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      // Step 4: Publish the asset
      await publishAsset(id);

      return id;
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
      fetchPolicy: "network-only", // Don't use cache for this query
    });

    return result.data.blogEntries;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};

//backup mutation from hygraph
// mutation createAsset {
//   createAsset(data: {}) {
//     id
//     url
//     upload {
//       status
//       expiresAt
//       error {
//         code
//         message
//       }
//       requestPostData {
//         url
//         date
//         key
//         signature
//         algorithm
//         policy
//         credential
//         securityToken
//       }
//     }
//   }
// }
