import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, getDocs, setDoc, onSnapshot } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from "uuid";

const ManageClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) return;
      const classRef = doc(db, "classroom", classId);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        setClassInfo(classSnap.data());
      } else {
        console.error("Class not found");
        navigate("/dashboard");
      }
    };

    const fetchStudents = async () => {
      const q = query(collection(db, `classroom/${classId}/students`));
      const querySnapshot = await getDocs(q);
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchCheckins = async () => {
      const q = query(collection(db, `classroom/${classId}/checkin`));
      const querySnapshot = await getDocs(q);
      setCheckins(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchClassData();
    fetchStudents();
    fetchCheckins();
  }, [classId, navigate]);

  const handleStartCheckIn = () => {
    navigate(`/checkin/${classId}`);
  };

  const handleGoToQuestionPage = () => {
    navigate(`/qa/${classId}`);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">จัดการห้องเรียน</h1>
      {classInfo && (
        <div className="card mb-4">
          <div className="card-body text-center">
            <h4>{classInfo.info.name} ({classInfo.info.code})</h4>
            <QRCodeCanvas value={`${window.location.origin}/register/${classId}`} size={180} />
          </div>
        </div>
      )}

      <button className="btn btn-primary mb-3" onClick={handleStartCheckIn}>เริ่มเช็คชื่อ</button>
      <button className="btn btn-warning mb-3 ms-2" onClick={handleGoToQuestionPage}>ไปที่หน้าถาม-ตอบ</button>

      <h5>ประวัติการเช็คชื่อ</h5>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>วัน-เวลา</th>
            <th>จำนวนคนเข้าเรียน</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {checkins.map((record, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{record.date}</td>
              <td>{record.students ? Object.keys(record.students).length : 0}</td>
              <td>{record.status === 1 ? "กำลังเรียน" : "เสร็จสิ้น"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-secondary mt-3" onClick={() => navigate("/dashboard")}>กลับไป Dashboard</button>
    </div>
  );
};

export default ManageClass;
  