// src/components/blog/EntryForm.tsx
import React, { useState } from "react";
import { uploadImages, createEntry } from "../services/hygraph";
import {
  FormContainer, // Changed from Form to FormContainer
  Input,
  TextArea,
  ImagePreviewContainer,
  ImagePreview,
  RemoveButton,
  Button,
  StatusMessage,
} from "./EntryFormStyles";
import { useLocationHook } from "../hooks/useLocation";

interface EntryFormProps {
  onSuccess?: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    error: boolean;
  } | null>(null);

  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocationHook();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Create preview URLs for images
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || files.length === 0) {
      setStatus({
        message: "Please fill out all fields and upload at least one image.",
        error: true,
      });
      return;
    }

    if (!location) {
      setStatus({
        message: "Location data is required. Please enable location services.",
        error: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ message: "Uploading images...", error: false });

      // Upload images first
      const imageIds = await uploadImages(files);

      setStatus({ message: "Creating entry...", error: false });

      // Create the entry with uploaded image IDs
      await createEntry(title, content, location, imageIds);

      setStatus({ message: "Entry created successfully!", error: false });

      // Reset form
      setTitle("");
      setContent("");
      setFiles([]);
      setPreviewUrls([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating entry:", error);
      setStatus({
        message: `Error creating entry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const locationDisplay = location
    ? `${location.city ? location.city + ", " : ""}${
        location.country ||
        `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      }`
    : "Getting location...";

  return (
    <FormContainer onSubmit={handleSubmit}>
      <h2>Create New Blog Entry</h2>

      <label htmlFor="title">Title</label>
      <Input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
        required
      />

      <label htmlFor="content">Content</label>
      <TextArea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        required
      />

      <label htmlFor="images">Images</label>
      <Input
        id="images"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      {previewUrls.length > 0 && (
        <ImagePreviewContainer>
          {previewUrls.map((url, index) => (
            <ImagePreview
              key={index}
              style={{ backgroundImage: `url(${url})` }}
            >
              <RemoveButton onClick={() => removeImage(index)}>×</RemoveButton>
            </ImagePreview>
          ))}
        </ImagePreviewContainer>
      )}

      <div>
        <strong>Location:</strong>{" "}
        {locationError ? "Error getting location" : locationDisplay}
      </div>

      <div>
        <strong>Timestamp:</strong> {new Date().toLocaleString()}
      </div>

      <Button type="submit" disabled={submitting || locationLoading}>
        {submitting ? "Submitting..." : "Create Entry"}
      </Button>

      {status && (
        <StatusMessage error={status.error}>{status.message}</StatusMessage>
      )}
    </FormContainer>
  );
};

export default EntryForm;
