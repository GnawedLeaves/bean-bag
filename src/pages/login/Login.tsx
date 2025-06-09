import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

const LoginPage = () => {
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    // Clear previous errors
    setError("");

    // Validate inputs
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

      // Display user-friendly error messages
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

  const handleNameChange = (input: string) => {
    // Clear error when user starts typing
    if (error) setError("");

    switch (input.toLowerCase()) {
      case "tasha":
        setInputEmail("annitasha@gmail.com");
        break;
      case "marcel":
        setInputEmail("annimarcel@gmail.com");
        break;
      default:
        // Allow direct email input
        setInputEmail(input);
    }
  };

  // When user already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(ROUTES.HOME.path);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <div>
        <input
          placeholder="Enter name (tasha/marcel) or email"
          value={inputEmail}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="password"
          type="password"
          value={inputPassword}
          onChange={(e) => {
            setInputPassword(e.target.value);
            if (error) setError(""); // Clear error when typing
          }}
        />
      </div>
      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </div>
  );
};

export default LoginPage;
