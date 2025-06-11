import styled from "styled-components";
import { BlogImage } from "../../../types/blogTypes";

interface BlogImagesProps {
  images: BlogImage[];
}

export const BlogImagesContainer = styled.div``;
const BlogImages = ({ images }: BlogImagesProps) => {
  return <BlogImagesContainer></BlogImagesContainer>;
};

export default BlogImages;
