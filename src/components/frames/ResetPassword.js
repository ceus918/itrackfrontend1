// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// function ResetPassword() {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//      const res = await axios.post(
//   `https://itrack-web-backend.onrender.com/api/reset-password/${token}`,
//   { password }
// );

//       setMessage(res.data.message);
//       navigate("/");
//     } catch (err) {
//       setMessage("Error resetting password");
//     }
//   };

//   return (
//     <div>
//       <h2>Reset Your Password</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="Enter new password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit">Reset Password</button>
//       </form>
//       <p>{message}</p>
//     </div>
//   );
// }

// export default ResetPassword;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Log token when page is loaded
  useEffect(() => {
    console.log("Reset Password page opened with token:", token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setMessage("Password cannot be empty.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `https://itrack-web-backend.onrender.com/api/reset-password/${token}`,
        { password }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Error resetting password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}

export default ResetPassword;
