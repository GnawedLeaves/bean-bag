// src/services/hygraph.ts
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const API_URL = process.env.HYGRAPH_API_URL; 
const API_KEY = process.env.HYGRAPH_API_KEY; 

export const client = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export const uploadImages = async (files: File[]) => {
  // This needs to be done for each file separately
  const uploadPromises = files.map(async (file) => {
    // Create FormData
    const formData = new FormData();
    formData.append('fileUpload', file);
    
    // Get the upload URL from your Hygraph Settings > API Access > Content API
    const uploadUrl = 'YOUR_HYGRAPH_UPLOAD_URL'; // Replace with your upload URL
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    return data.id; // Return the ID of the uploaded asset
  });
  
  return Promise.all(uploadPromises);
};

export const createEntry = async (
  title: string,
  content: string,
  location: any,
  imageIds: string[]
) => {
  const timestamp = new Date().toISOString();
  
  const CREATE_ENTRY = gql`
    mutation CreateEntry($title: String!, $content: String!, $timestamp: DateTime!, $location: JSON!, $images: [AssetWhereUniqueInput!]!) {
      createEntry(
        data: {
          title: $title,
          content: $content,
          timestamp: $timestamp,
          location: $location,
          images: { connect: $images }
        }
      ) {
        id
        title
      }
    }
  `;
  
  const imageConnections = imageIds.map(id => ({ where: { id } }));
  
  const result = await client.mutate({
    mutation: CREATE_ENTRY,
    variables: {
      title,
      content,
      timestamp,
      location,
      images: imageConnections
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