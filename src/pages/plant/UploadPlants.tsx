import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { UploadPlantsContainer } from "./PlantStyles";
import { ROUTES } from "../../routes";
import BlogEntryForm from "../../components/blogEntryComponents/BlogEntryForm";

interface UploadPlantsPageProps {}

const UploadPlantsPage = ({}: UploadPlantsPageProps) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to home page after successful submission
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(ROUTES.LOGIN.path);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UploadPlantsContainer>
      <BlogEntryForm onSuccess={handleSuccess} />
    </UploadPlantsContainer>
  );
};

export { UploadPlantsPage };
export type { UploadPlantsPageProps };
