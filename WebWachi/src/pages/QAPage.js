import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, getDocs, setDoc, onSnapshot } from "firebase/firestore";

const QAPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [questionNo, setQuestionNo] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState({});

  const handleAddQuestion = async () => {
    if (!questionNo || !questionText) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

    const questionRef = doc(db, `classroom/${classId}/checkin/1`);
    await updateDoc(questionRef, {
      question_no: parseInt(questionNo),
      question_text: questionText,
      question_show: true,
    });

    setQuestionNo("");
    setQuestionText("");
    alert("ตั้งคำถามเรียบร้อย!");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">หน้าถาม-ตอบ</h1>

      {/* ตั้งคำถาม */}
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
      <button className="btn btn-primary me-2" onClick={handleAddQuestion}>
        เริ่มถาม
      </button>

      <button className="btn btn-secondary mt-3" onClick={() => navigate(`/manage-class/${classId}`)}>
        กลับไปจัดการห้องเรียน
      </button>
    </div>
  );
};

export default QAPage;
