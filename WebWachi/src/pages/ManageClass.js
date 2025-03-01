import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false); // ✅ แสดง/ซ่อนรายชื่อนักศึกษา



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

    const fetchCheckins = async () => {
      const checkinQuery = query(collection(db, `classroom/${classId}/checkin`));
      const checkinSnapshot = await getDocs(checkinQuery);

      const checkinData = await Promise.all(
        checkinSnapshot.docs.map(async (docSnap) => {
          const checkinInfo = docSnap.data();
          const studentQuery = collection(db, `classroom/${classId}/checkin/${docSnap.id}/students`);
          const studentSnapshot = await getDocs(studentQuery);

          return {
            id: docSnap.id,
            ...checkinInfo,
            studentCount: studentSnapshot.size,
          };
        })
      );

      setCheckins(checkinData);
    };

    const fetchStudents = async () => {
      const studentQuery = query(collection(db, `classroom/${classId}/students`));
      const studentSnapshot = await getDocs(studentQuery);

      const studentList = studentSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setStudents(studentList);
    };

    fetchClassData();
    fetchCheckins();
    fetchStudents();
  }, [classId, navigate]);

  const handleStartCheckIn = () => {
    navigate(`/checkin/${classId}`);
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
              <td>{record.studentCount}</td>
              <td>{record.status === 1 ? "กำลังเรียน" : "เสร็จสิ้น"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-secondary mt-3" onClick={() => navigate("/dashboard")}>กลับไป Dashboard</button>

      {/* ✅ ปุ่มเปิด/ปิดแสดงรายชื่อนักศึกษา */}
      <button className="btn btn-info mt-3 ms-2" onClick={() => setShowStudents(!showStudents)}>
        {showStudents ? "ซ่อนรายชื่อนักศึกษา" : "แสดงรายชื่อนักศึกษา"}
      </button>

      {/* ✅ แสดงรายชื่อนักศึกษาเมื่อ showStudents เป็น true */}
      {showStudents && (
        <div className="mt-4">
          <h5>รายชื่อนักศึกษา</h5>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>รหัส</th>
                <th>ชื่อ</th>
                <th>รูปภาพ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{student.stdid}</td>
                  <td>{student.name}</td>
                  <td>
                    <img src={student.photo} alt="Student" width="50" height="50" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageClass;
