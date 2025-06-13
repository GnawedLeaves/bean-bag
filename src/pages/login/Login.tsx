import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Button, Card, Flex, Input, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import {
  LoginContainer,
  LoginCard,
  LoginButton,
  LoginInput,
  LoginTitle,
} from "./LoginStyles";
import { token } from "../../theme";

const { Text } = Typography;

const LoginPage = () => {
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!inputEmail.trim() || !inputPassword.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, inputEmail, inputPassword);
      navigate("/home");
    } catch (err: any) {
      console.error("error logging in", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/invalid-email":
          setError("Invalid email format");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later");
          break;
        default:
          setError("Login failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = () => {
    if (error) setError("");
    switch (input.toLowerCase()) {
      case "tasha":
        setInputEmail("annitasha@gmail.com");
        break;
      case "marcel":
        setInputEmail("annimarcel@gmail.com");
        break;
      default:
        setInputEmail(input);
    }
  };

  useEffect(() => {
    handleNameChange();
  }, [input]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(ROUTES.HOME.path);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <LoginContainer>
      <div
        style={{
          position: "absolute",
          top: 69,
          right: 69,
          display: input.toLowerCase() === "tasha" ? "" : "none",
        }}
      >
        lmao its the gayest one{" "}
      </div>
      <div
        style={{
          position: "absolute",
          top: 99,
          left: 69,
          display: input.toLowerCase() === "marcel" ? "" : "none",
        }}
      >
        WOWIE its the coolest one{" "}
      </div>
      <LoginCard>
        <Flex vertical gap={24}>
          <LoginTitle>Bean Bag</LoginTitle>

          <Flex vertical gap={8}>
            <Text>Email</Text>
            <LoginInput
              style={{
                background: token.colorBg,
                fontFamily: token.fontFamily,
              }}
              placeholder="Name"
              prefix={<MailOutlined />}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Flex>

          <Flex vertical gap={8}>
            <Text>Password</Text>
            <LoginInput
              placeholder="Password"
              type="password"
              prefix={<LockOutlined />}
              style={{
                background: token.colorBg,
                fontFamily: token.fontFamily,
              }}
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                if (error) setError("");
              }}
            />
          </Flex>

          {error && (
            <Text type="danger" style={{ textAlign: "center" }}>
              {error}
            </Text>
          )}

          <LoginButton
            type="primary"
            onClick={handleLogin}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </LoginButton>
        </Flex>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
