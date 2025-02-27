import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, getDocs, setDoc, onSnapshot } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import "bootstrap/dist/css/bootstrap.min.css";

const CheckinPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState([]);
  const [studentsCheckedIn, setStudentsCheckedIn] = useState([]);
  const [latestCheckinNo, setLatestCheckinNo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, `classroom/${classId}/checkin`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const checkinList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCheckins(checkinList);

      if (checkinList.length > 0) {
        setLatestCheckinNo(checkinList.length);
      }
    });

    return () => unsubscribe();
  }, [classId]);

  useEffect(() => {
    if (!latestCheckinNo) return;

    const studentCheckinRef = collection(db, `classroom/${classId}/checkin/${latestCheckinNo}/students`);
    const unsubscribe = onSnapshot(studentCheckinRef, (querySnapshot) => {
      const checkedInStudents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudentsCheckedIn(checkedInStudents);
    });

    return () => unsubscribe();
  }, [classId, latestCheckinNo]);

  const handleStartCheckIn = async () => {
    try {
      const newCno = checkins.length + 1;

      const studentsRef = collection(db, `classroom/${classId}/students`);
      const studentsSnapshot = await getDocs(studentsRef);

      await setDoc(doc(db, `classroom/${classId}/checkin/${newCno}`), {
        code: uuidv4().substring(0, 6).toUpperCase(),
        date: new Date().toLocaleString(),
        status: 1,
      });

      studentsSnapshot.forEach(async (student) => {
        await setDoc(doc(db, `classroom/${classId}/checkin/${newCno}/students/${student.id}`), {
          stdid: student.data().stdid,
          name: student.data().name,
          remark: "",
          date: "", // ยังไม่เช็คชื่อ
        });
      });

      alert(`เริ่มเช็คชื่อครั้งที่ ${newCno} เรียบร้อย!`);
      setLatestCheckinNo(newCno);
    } catch (error) {
      console.error("Error starting new check-in:", error);
      alert("เกิดข้อผิดพลาดในการเริ่มเช็คชื่อ!");
    }
  };

  const handleCloseCheckIn = async () => {
    try {
      if (!latestCheckinNo) {
        alert("ยังไม่มีการเช็คชื่อที่เปิดอยู่!");
        return;
      }

      await updateDoc(doc(db, `classroom/${classId}/checkin/${latestCheckinNo}`), { status: 2 });

      alert("ปิดการเช็คชื่อเรียบร้อย!");
    } catch (error) {
      console.error("Error closing check-in:", error);
      alert("เกิดข้อผิดพลาดในการปิดการเช็คชื่อ!");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">📋 หน้าตรวจเช็คชื่อ</h1>

      <div className="d-flex justify-content-center gap-3 mb-4">
        <button className="btn btn-success" onClick={handleStartCheckIn}>✅ เริ่มเช็คชื่อใหม่</button>
        <button className="btn btn-danger" onClick={handleCloseCheckIn}>❌ ปิดการเช็คชื่อ</button>
      </div>

      <div className="text-center mb-4">
        <h5>🔗 QR Code สำหรับเช็คชื่อ</h5>
        <QRCodeCanvas value={`${window.location.origin}/checkin/${classId}`} size={200} />
      </div>

      {/* ✅ รายชื่อนักศึกษาที่เช็คชื่อแล้ว */}
      <div className="card">
        <div className="card-body">
          <h5>👥 รายชื่อนักศึกษาที่เช็คชื่อแล้ว</h5>
          {studentsCheckedIn.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ</th>
                  <th>วัน-เวลา</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {studentsCheckedIn
                  .filter(student => student.date !== "") // แสดงเฉพาะคนที่เช็คชื่อแล้ว
                  .map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.stdid}</td>
                      <td>{student.name}</td>
                      <td>{student.date}</td>
                      <td>{student.remark || "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">ยังไม่มีนักศึกษาที่เช็คชื่อ</p>
          )}
        </div>
      </div>

      {/* ✅ รายการเช็คชื่อทั้งหมด */}
      <div className="card mt-4">
        <div className="card-body">
          <h5>📅 ประวัติการเช็คชื่อ</h5>
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
              {checkins.map((checkin, index) => (
                <tr key={checkin.id}>
                  <td>{index + 1}</td>
                  <td>{checkin.date}</td>
                  <td>{Object.keys(checkin.students || {}).length}</td>
                  <td>{checkin.status === 1 ? "กำลังเรียน" : "เสร็จสิ้น"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => navigate(`/manage-class/${classId}`)}>🔙 กลับไปจัดการห้องเรียน</button>
      </div>
    </div>
  );
};

export default CheckinPage;
