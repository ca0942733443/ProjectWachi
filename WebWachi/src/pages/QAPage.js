import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDocs, updateDoc, collection, query, where, getDoc } from "firebase/firestore";

const QAPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [questionNo, setQuestionNo] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [currentCno, setCurrentCno] = useState(null);
  const [questionActive, setQuestionActive] = useState(false); // ✅ ตรวจสอบว่ามีคำถามเปิดอยู่หรือไม่

  // ✅ โหลดข้อมูลเช็คชื่อที่เปิดอยู่
  useEffect(() => {
    const fetchCurrentCheckin = async () => {
      const q = query(collection(db, `classroom/${classId}/checkin`), where("status", "==", 1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // ✅ ดึง CNO ของเซสชันที่กำลังเปิดอยู่
        const checkinDoc = querySnapshot.docs[0];
        setCurrentCno(checkinDoc.id);

        // ✅ ตรวจสอบว่ามีคำถามเปิดอยู่หรือไม่
        const questionRef = doc(db, `classroom/${classId}/checkin/${checkinDoc.id}`);
        const questionSnap = await getDoc(questionRef);
        if (questionSnap.exists() && questionSnap.data().question_show) {
          setQuestionActive(true);
        } else {
          setQuestionActive(false);
        }
      } else {
        setCurrentCno(null);
        setQuestionActive(false);
      }
    };

    fetchCurrentCheckin();
  }, [classId]);

  // ✅ ฟังก์ชันเพิ่มคำถามใหม่
  const handleAddQuestion = async () => {
    if (!currentCno) {
      alert("❌ ไม่มีการเช็คชื่อที่เปิดอยู่!");
      return;
    }

    if (!questionNo || !questionText) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const questionRef = doc(db, `classroom/${classId}/checkin/${currentCno}`);
    await updateDoc(questionRef, {
      question_no: parseInt(questionNo),
      question_text: questionText,
      question_show: true,
    });

    setQuestionNo("");
    setQuestionText("");
    setQuestionActive(true); // ✅ อัปเดตสถานะว่ามีคำถามเปิดอยู่
    alert("✅ ตั้งคำถามเรียบร้อย!");
  };

  // ✅ ฟังก์ชันปิดคำถาม
  const handleCloseQuestion = async () => {
    if (!currentCno) {
      alert("❌ ไม่มีการเช็คชื่อที่เปิดอยู่!");
      return;
    }

    if (!questionActive) {
      alert("❌ ไม่มีคำถามที่เปิดอยู่!");
      return;
    }

    const questionRef = doc(db, `classroom/${classId}/checkin/${currentCno}`);
    await updateDoc(questionRef, {
      question_show: false,
    });

    setQuestionActive(false); // ✅ อัปเดตสถานะว่าปิดคำถามแล้ว
    alert("✅ ปิดคำถามเรียบร้อย!");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">📢 หน้าถาม-ตอบ</h1>

      {currentCno ? (
        <>
          <p>📌 กำลังถามในเซสชันเช็คชื่อที่ #{currentCno}</p>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="หมายเลขคำถาม"
            value={questionNo}
            onChange={(e) => setQuestionNo(e.target.value)}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="พิมพ์คำถามที่นี่..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          {/* ✅ ปุ่มเริ่มถาม */}
          <button className="btn btn-primary me-2" onClick={handleAddQuestion}>
            ✅ เริ่มถาม
          </button>

          {/* ✅ ปุ่มปิดคำถาม */}
          {questionActive && (
            <button className="btn btn-danger" onClick={handleCloseQuestion}>
              ❌ ปิดคำถาม
            </button>
          )}
        </>
      ) : (
        <p className="text-danger">❌ ไม่มีการเช็คชื่อที่เปิดอยู่</p>
      )}

      <button className="btn btn-secondary mt-3" onClick={() => navigate(`/manage-class/${classId}`)}>
        🔙 กลับไปจัดการห้องเรียน
      </button>
    </div>
  );
};

export default QAPage;
