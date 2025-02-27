import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ นำเข้า Bootstrap

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      }, { merge: true });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg text-center">
        <h1 className="mb-4">เข้าสู่ระบบ</h1>
        <button onClick={handleLogin} className="btn btn-primary">
          <i className="bi bi-google"></i> Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
