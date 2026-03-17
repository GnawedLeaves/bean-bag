// src/components/blog/EntryForm.tsx
import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Typography,
  Space,
  Card,
} from "antd";

import {
  ImagePreviewContainer,
  ImagePreview,
  RemoveButton,
  StatusMessage,
} from "./PlantEntryFormStyles";
import { useLocationHook } from "../../hooks/useLocation";
import { uploadImages, createPlantEntry } from "../../services/hygraph";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface PlantEntryFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  title: string;
  content: string;
  plantName: string;
}

const PlantEntryForm: React.FC<PlantEntryFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm<FormValues>();
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

  const handleSubmit = async (values: FormValues) => {
    if (files.length === 0) {
      message.error("Please upload at least one image.");
      return;
    }

    if (!location) {
      message.error(
        "Location data is required. Please enable location services."
      );
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ message: "Uploading images...", error: false });

      // Upload images first
      console.log({ files });
      const imageIds = await uploadImages(files);

      setStatus({ message: "Creating entry...", error: false });

      const transformedLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Create the entry with uploaded image IDs
      await createPlantEntry(
        values.title,
        values.content,
        values.plantName,
        transformedLocation,
        imageIds
      );

      setStatus({ message: "Entry created successfully!", error: false });
      message.success("Entry created successfully!");

      // Reset form
      form.resetFields();
      setFiles([]);
      setPreviewUrls([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating entry:", error);
      const errorMessage = `Error creating entry: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      setStatus({
        message: errorMessage,
        error: true,
      });
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // const locationDisplay = location
  //   ? `${location.city ? location.city + ", " : ""}${
  //       location.country ||
  //       `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
  //     }`
  //   : "Getting location...";

  const locationDisplay = "";
  //todo get from database
  const plantOptions = [
    {
      label: "Phillow",
      value: "Phillow",
    },
    {
      label: "Eggy",
      value: "Eggy",
    },
    {
      label: "New Plant",
      value: "New Plant",
    },
  ];

  return (
    <Card>
      <Title level={2}>Create New Plant Entry</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: "Please enter a title" },
            { min: 3, message: "Title must be at least 3 characters long" },
            { max: 100, message: "Title must be less than 100 characters" },
          ]}
        >
          <Input placeholder="Enter title" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[
            { required: true, message: "Please enter content" },
            { min: 10, message: "Content must be at least 10 characters long" },
            { max: 1000, message: "Content must be less than 1000 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="What's on your mind?"
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          name="plantName"
          label="Plant Name"
          rules={[{ required: true, message: "Please select a plant name" }]}
        >
          <Select
            placeholder="Select a plant"
            options={plantOptions}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Images"
          required
          help="Please upload at least one image"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ marginBottom: 16 }}
          />

          {previewUrls.length > 0 && (
            <ImagePreviewContainer>
              {previewUrls.map((url, index) => (
                <ImagePreview
                  key={index}
                  style={{ backgroundImage: `url(${url})` }}
                >
                  <RemoveButton onClick={() => removeImage(index)}>
                    ×
                  </RemoveButton>
                </ImagePreview>
              ))}
            </ImagePreviewContainer>
          )}
        </Form.Item>

        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <div>
            <Text strong>Location: </Text>
            <Text type={locationError ? "danger" : "secondary"}>
              {locationError ? "Error getting location" : locationDisplay}
            </Text>
          </div>

          <div>
            <Text strong>Timestamp: </Text>
            <Text type="secondary">{new Date().toLocaleString()}</Text>
          </div>
        </Space>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={locationLoading}
            size="large"
            block
          >
            {submitting ? "Creating Entry..." : "Create Entry"}
          </Button>
        </Form.Item>
      </Form>

      {status && (
        <StatusMessage error={status.error}>{status.message}</StatusMessage>
      )}
    </Card>
  );
};

export default PlantEntryForm;
