import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import "bootstrap/dist/css/bootstrap.min.css";

const CheckinPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState([]);
  const [studentsCheckedIn, setStudentsCheckedIn] = useState([]);
  const [latestCheckinNo, setLatestCheckinNo] = useState(null);
  const [studentsScores, setStudentsScores] = useState([]);
  const [showScores, setShowScores] = useState(false);
  const [checkinCode, setCheckinCode] = useState(null); // ✅ เก็บ Check-in Code


    const handleGoToQuestionPage = () => {
    navigate(`/qa/${classId}`);
  };

  const fetchCheckinCode = async () => {
    if (!latestCheckinNo) {
      alert("❌ ไม่มีรหัสเช็คชื่อที่เปิดอยู่!");
      return;
    }
    const checkinDoc = await getDoc(
      doc(db, `classroom/${classId}/checkin/${latestCheckinNo}`)
    );
    if (checkinDoc.exists()) {
      setCheckinCode(checkinDoc.data().code);
    } else {
      setCheckinCode(null);
      alert("❌ ไม่พบรหัสเช็คชื่อ!");
    }
  };

  useEffect(() => {
    if (!latestCheckinNo) return;

    const scoresRef = collection(
      db,
      `classroom/${classId}/checkin/${latestCheckinNo}/scores`
    );
    const unsubscribe = onSnapshot(scoresRef, (querySnapshot) => {
      const scores = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStudentsScores(scores);
    });

    return () => unsubscribe();
  }, [classId, latestCheckinNo]);


   // ✅ ฟังก์ชันบันทึกคะแนน
   const handleSaveScores = async () => {
    try {
      for (let student of studentsScores) {
        const studentRef = doc(
          db,
          `classroom/${classId}/checkin/${latestCheckinNo}/scores/${student.id}`
        );
        await updateDoc(studentRef, {
          score: student.score,
          remark: student.remark,
          status: student.status,
        });
      }
      alert("✅ บันทึกข้อมูลเรียบร้อย!");
    } catch (error) {
      console.error("Error updating scores:", error);
      alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล!");
    }
  };

  // โหลดข้อมูลเช็คชื่อ
  useEffect(() => {
    const q = query(collection(db, `classroom/${classId}/checkin`));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const checkinList = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const checkinInfo = docSnap.data();
          const studentQuery = collection(
            db,
            `classroom/${classId}/checkin/${docSnap.id}/students`
          );
          const studentSnapshot = await getDocs(studentQuery);
          return {
            id: docSnap.id,
            ...checkinInfo,
            studentCount: studentSnapshot.size,
          };
        })
      );

      setCheckins(checkinList);
      if (checkinList.length > 0) {
        setLatestCheckinNo(checkinList.length);
      }
    });

    return () => unsubscribe();
  }, [classId]);

  // โหลดรายชื่อนักศึกษาที่เช็คชื่อแล้ว
  useEffect(() => {
    if (!latestCheckinNo) return;

    const studentCheckinRef = collection(
      db,
      `classroom/${classId}/checkin/${latestCheckinNo}/students`
    );
    const unsubscribe = onSnapshot(studentCheckinRef, (querySnapshot) => {
      const checkedInStudents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudentsCheckedIn(checkedInStudents);
    });

    return () => unsubscribe();
  }, [classId, latestCheckinNo]);

  // ✅ **เริ่มเช็คชื่อใหม่**
  const handleStartCheckIn = async () => {
    try {
      const newCno = checkins.length + 1;
      const studentsRef = collection(db, `classroom/${classId}/students`);
      const studentsSnapshot = await getDocs(studentsRef);

      // ✅ 1. สร้าง /classroom/{cid}/checkin/{cno}
      await setDoc(doc(db, `classroom/${classId}/checkin/${newCno}`), {
        code: uuidv4().substring(0, 6).toUpperCase(),
        date: new Date().toLocaleString(),
        status: 1,
      });

      // ✅ 2. คัดลอกรายชื่อนักเรียนไปยัง /classroom/{cid}/checkin/{cno}/scores
      studentsSnapshot.forEach(async (student) => {
        await setDoc(doc(db, `classroom/${classId}/checkin/${newCno}/scores/${student.id}`), {
          stdid: student.data().stdid,
          name: student.data().name,
          remark: "",
          score: 0,  // ค่าคะแนนเริ่มต้น
          status: 0, // สถานะ 0 = ยังไม่เข้าเรียน
          date: "",  // ยังไม่เช็คชื่อ
        });
      });

      alert(`✅ เริ่มเช็คชื่อครั้งที่ ${newCno} สำเร็จ!`);
      setLatestCheckinNo(newCno);
    } catch (error) {
      console.error("Error starting new check-in:", error);
      alert("❌ เกิดข้อผิดพลาดในการเริ่มเช็คชื่อ!");
    }
  };

  // ปิดการเช็คชื่อ
  const handleCloseCheckIn = async () => {
    try {
      if (!latestCheckinNo) {
        alert("ยังไม่มีการเช็คชื่อที่เปิดอยู่!");
        return;
      }

      await updateDoc(
        doc(db, `classroom/${classId}/checkin/${latestCheckinNo}`),
        { status: 2 }
      );

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
        <button className="btn btn-success" onClick={handleStartCheckIn}>
          ✅ เริ่มเช็คชื่อใหม่
        </button>
        <button className="btn btn-danger" onClick={handleCloseCheckIn}>
          ❌ ปิดการเช็คชื่อ
        </button>
        <button className="btn btn-warning" onClick={fetchCheckinCode}>
          🔍 แสดงรหัสเช็คชื่อ
        </button>
      </div>

       {/* ✅ แสดง Check-in Code */}
       {checkinCode && (
        <div className="alert alert-info text-center">
          <h5>📌 รหัสเช็คชื่อ: <strong>{checkinCode}</strong></h5>
        </div>
      )}

      <div className="text-center mb-4">
        <h5>🔗 QR Code สำหรับเช็คชื่อ</h5>
        <QRCodeCanvas
          value={`${window.location.origin}/checkin/${classId}`}
          size={200}
        />
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
                  .filter((student) => student.date !== "")
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

      {/* ✅ ประวัติการเช็คชื่อ */}
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
                  <td>{checkin.studentCount}</td>
                  <td>{checkin.status === 1 ? "กำลังเรียน" : "เสร็จสิ้น"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* ✅ ปุ่มแสดง/ซ่อนคะแนน */}
       <button
        className="btn btn-info mb-3"
        onClick={() => setShowScores(!showScores)}
      >
        {showScores ? "ซ่อนคะแนน" : "แสดงคะแนน"}
      </button>

    {/* ✅ ตารางคะแนน */}
    {showScores && (
        <div className="card mt-3">
          <div className="card-body">
            <h5>📊 คะแนนการเข้าเรียน</h5>
            {studentsScores.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>รหัส</th>
                    <th>ชื่อ</th>
                    <th>หมายเหตุ</th>
                    <th>วันเวลา</th>
                    <th>คะแนน</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsScores.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.stdid}</td>
                      <td>{student.name}</td>
                      <td>
                        <input
                          type="text"
                          value={student.remark}
                          onChange={(e) =>
                            setStudentsScores((prev) =>
                              prev.map((s) =>
                                s.id === student.id
                                  ? { ...s, remark: e.target.value }
                                  : s
                              )
                            )
                          }
                        />
                      </td>
                      <td>{student.date || "-"}</td>
                      <td>
                        <input
                          type="number"
                          value={student.score}
                          onChange={(e) =>
                            setStudentsScores((prev) =>
                              prev.map((s) =>
                                s.id === student.id
                                  ? { ...s, score: Number(e.target.value) }
                                  : s
                              )
                            )
                          }
                        />
                      </td>
                      <td>{student.status === 1 ? "เข้าเรียน" : "ไม่เข้าเรียน"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">ยังไม่มีคะแนน</p>
            )}

            {/* ✅ ปุ่มบันทึก */}
            <button className="btn btn-success mt-3" onClick={handleSaveScores}>
              💾 บันทึกข้อมูล
            </button>
          </div>
        </div>
      )}

      

      <div className="text-center mt-4">
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/manage-class/${classId}`)}
        >
          🔙 กลับไปจัดการห้องเรียน
        </button>
        <button className="btn btn-warning mb-3 ms-2" onClick={handleGoToQuestionPage}>ไปที่หน้าถาม-ตอบ</button>


      </div>
    </div>





  );
};

export default CheckinPage;
