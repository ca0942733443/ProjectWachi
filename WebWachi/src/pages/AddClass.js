import { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore"; // ใช้ setDoc แทน addDoc
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // ใช้สร้าง `cid` แบบสุ่ม

const AddClass = () => {
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [classImageUrl, setClassImageUrl] = useState(""); // เก็บ URL ของรูปภาพ
  const navigate = useNavigate();

  // 📌 ฟังก์ชันเลือกไฟล์รูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClassImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 📌 ฟังก์ชันเพิ่มห้องเรียน
  const handleAddClass = async (e) => {
    e.preventDefault();

    if (!className || !classCode || !classRoom || !classImageUrl) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const classId = uuidv4(); // ✅ สร้างรหัส `cid` แบบสุ่ม
    const userId = auth.currentUser?.uid; // ✅ UID ของอาจารย์

    if (!userId) {
      alert("กรุณาเข้าสู่ระบบ");
      return;
    }

    try {
      // ✅ บันทึกข้อมูลลง Firestore `/classroom/{cid}`
      await setDoc(doc(db, "classroom", classId), {
        owner: userId,
        info: {
          name: className,
          code: classCode,
          room: classRoom,
          photo: classImageUrl,
        },
      });

      // ✅ บันทึกข้อมูลห้องเรียนลง `/users/{uid}/classroom/{cid}`
      await setDoc(doc(db, `users/${userId}/classroom`, classId), {
        status: 1, // 🏫 1 = อาจารย์
      });

      alert("เพิ่มห้องเรียนสำเร็จ!");
      navigate("/dashboard"); // 🔄 กลับไปหน้า Dashboard
    } catch (error) {
      console.error("Error adding class: ", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มห้องเรียน!");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h1 className="card-title text-center mb-4">เพิ่มห้องเรียน</h1>
        <form onSubmit={handleAddClass}>
          <div className="mb-3">
            <label className="form-label">ชื่อวิชา</label>
            <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">รหัสวิชา</label>
            <input type="text" value={classCode} onChange={(e) => setClassCode(e.target.value)} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">ห้องเรียน</label>
            <input type="text" value={classRoom} onChange={(e) => setClassRoom(e.target.value)} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">เลือกไฟล์รูปภาพ</label>
            <input type="file" onChange={handleImageChange} className="form-control" required />
          </div>

          {classImageUrl && (
            <div className="mb-3 text-center">
              <img src={classImageUrl} alt="Preview" className="img-thumbnail" style={{ width: "150px", height: "150px", objectFit: "cover" }} />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">เพิ่มห้องเรียน</button>
        </form>
      </div>
    </div>
  );
};

export default AddClass;
