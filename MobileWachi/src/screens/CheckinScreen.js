import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, onSnapshot } from "firebase/firestore";

const CheckinScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { cid, checkinCode } = route.params || {};

  const [cno, setCno] = useState("");
  const [code, setCode] = useState(checkinCode || ""); 
  const [students, setStudents] = useState([]);
  const [questionShow, setQuestionShow] = useState(false); // สำหรับเช็คว่าให้แสดงหน้าจอคำถามหรือไม่
  const [answer, setAnswer] = useState(""); // คำตอบที่นักเรียนกรอก

  useEffect(() => {
    const fetchOpenCheckin = async () => {
      const checkinQuery = query(collection(db, `classroom/${cid}/checkin`), where("status", "==", 1));
      const querySnapshot = await getDocs(checkinQuery);

      if (!querySnapshot.empty) {
        const openCheckin = querySnapshot.docs[0]; // ดึงเซสชันแรกที่เปิดอยู่
        setCno(openCheckin.id);
      } else {
        Alert.alert("❌ ไม่มีการเช็คชื่อที่เปิดอยู่");
      }
    };

    if (cid) fetchOpenCheckin();
  }, [cid]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!cno) return;
      const querySnapshot = await getDocs(collection(db, `classroom/${cid}/checkin/${cno}/students`));
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchStudents();
  }, [cid, cno]);

  useEffect(() => {
    const checkQuestionStatus = async () => {
      const questionRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      const unsubscribe = onSnapshot(questionRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setQuestionShow(data.question_show); // ตรวจสอบสถานะคำถาม
        }
      });

      return unsubscribe;
    };

    if (cid && cno) {
      checkQuestionStatus();
    }
  }, [cid, cno]);

  const handleCheckIn = async () => {
    if (!cno || !code) return Alert.alert("กรุณากรอกรหัสเข้าเรียน");

    const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
    const checkinSnap = await getDoc(checkinRef);

    if (checkinSnap.exists() && checkinSnap.data().code === code) {
      const userUid = auth.currentUser.uid;
      const userName = auth.currentUser.displayName || "ไม่มีชื่อ";

      // ✅ 1. บันทึกการเช็คชื่อ
      await setDoc(doc(db, `classroom/${cid}/checkin/${cno}/students/${userUid}`), {
        stdid: userUid,
        name: userName,
        date: new Date().toISOString(),
      });

      // ✅ 2. อัปเดตคะแนนเช็คชื่อ
      await updateDoc(doc(db, `classroom/${cid}/checkin/${cno}/scores/${userUid}`), {
        date: new Date().toISOString(),
        status: 1, // 1 = เข้าเรียน
        score: 10, // กำหนดคะแนนเข้าเรียน
      });

      Alert.alert("✅ เช็คชื่อสำเร็จ!");
    } else {
      Alert.alert("❌ รหัสเข้าเรียนไม่ถูกต้อง");
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer) {
      Alert.alert("กรุณากรอกคำตอบ");
      return;
    }

    const userUid = auth.currentUser.uid;
    const questionRef = collection(db, `classroom/${cid}/checkin/${cno}/answers`);
    const newAnswerRef = doc(questionRef); // สร้าง document ใหม่สำหรับคำตอบ

    // บันทึกคำตอบ
    await setDoc(newAnswerRef, {
      text: `คำถาม ${cno}`, // ใส่คำถาม (หรือดึงจาก Firestore ถ้ามี)
      students: {
        [userUid]: {
          text: answer,
          time: new Date().toISOString(),
        },
      },
    });

    Alert.alert("✅ คำตอบของคุณได้รับการบันทึก");
    setAnswer(""); // เคลียร์คำตอบหลังจากส่ง
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>📌 เช็คชื่อเข้าเรียน</Text>

      {/* ✅ แสดง CNO อัตโนมัติ */}
      <Text style={{ marginTop: 10 }}>ลำดับการเช็คชื่อ (CNO): {cno || "⏳ กำลังโหลด..."}</Text>

      <TextInput
        placeholder="รหัสเข้าเรียน (Code)"
        value={code}
        onChangeText={setCode}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="🔍 สแกน QR Code" onPress={() => navigation.navigate("QRScanner")} />
      <Button title="✅ เช็คชื่อ" onPress={handleCheckIn} />

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>👥 รายชื่อผู้เช็คชื่อแล้ว</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>✅ {item.stdid} - {item.name}</Text>
        )}
      />

      {/* เพิ่มหน้าจอคำถาม ถ้าสถานะ question_show == true */}
      {questionShow && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold" }}>📚 ตอบคำถาม</Text>
          <TextInput
            placeholder="กรอกคำตอบของคุณ"
            value={answer}
            onChangeText={setAnswer}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
          />
          <Button title="ส่งคำตอบ" onPress={handleAnswerSubmit} />
        </View>
      )}
    </View>
  );
};

export default CheckinScreen;
