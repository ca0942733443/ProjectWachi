import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase"; // Firestore Database
import { getAuth } from "firebase/auth"; // Authentication
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; // Firestore Functions
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ ใช้ Bootstrap

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ ใช้ useCallback เพื่อให้ fetchClasses ไม่เปลี่ยนทุกครั้งที่ render
  const fetchClasses = useCallback(async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    const q = query(collection(db, "classroom"), where("owner", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    setClasses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        navigate("/");
        return;
      }

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        console.error("User not found in Firestore");
        navigate("/");
      }
    };

    fetchData(); 
    fetchClasses(); 
  }, [fetchClasses, navigate]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-primary">📚 Dashboard</h1>
        <button className="btn btn-danger" onClick={() => navigate("/")}>ออกจากระบบ</button>
      </div>

      {/* ✅ ส่วนแสดงข้อมูลผู้ใช้ */}
      {user && (
        <div className="card p-3 mb-4 shadow-sm">
          <div className="d-flex align-items-center">
            <img
              src={user.photo || "default-profile-pic.jpg"}
              alt="User Profile"
              className="rounded-circle me-3"
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
            />
            <div>
              <h4 className="mb-1">{user.name}</h4>
              <p className="text-muted mb-0">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ปุ่มต่าง ๆ */}
      <div className="mb-4 d-flex gap-3">
        <button onClick={() => navigate("/edit-profile")} className="btn btn-outline-primary">
          ✏️ แก้ไขโปรไฟล์
        </button>
        <button onClick={() => navigate("/add-class")} className="btn btn-outline-success">
          ➕ เพิ่มห้องเรียน
        </button>
      </div>

      {/* ✅ แสดงรายการห้องเรียนเป็น Card */}
      <div className="row">
        {classes.length > 0 ? (
          classes.map((cls) => (
            <div key={cls.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm">
                {cls.info.photo && (
                  <img
                    src={cls.info.photo}
                    alt="Class"
                    className="card-img-top"
                    style={{ height: "150px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{cls.info.code} - {cls.info.name}</h5>
                  <p className="text-muted">📍 ห้องเรียน: {cls.info.room}</p>
                  <button onClick={() => navigate(`/manage-class/${cls.id}`)} className="btn btn-primary w-100">
                    จัดการห้องเรียน
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">📌 ยังไม่มีห้องเรียน</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
