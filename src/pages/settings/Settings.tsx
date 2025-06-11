import { message } from "antd";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";

interface SettingPageProps {}
const SettingsPage = ({}: SettingPageProps) => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      message.success("Signed out successfully");
      navigate(ROUTES.LOGIN.path);
    } catch (error) {
      console.error("Error signing out:", error);
      message.error("Failed to sign out");
    }
  };
  return (
    <>
      Settings
      <button
        onClick={() => {
          handleSignOut();
        }}
      >
        SIGN OUT{" "}
      </button>
    </>
  );
};

export { SettingsPage };
