import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const JoinClass = ({ navigation, route }) => {
  const { cid } = route.params; // รับค่ารหัสวิชาที่ส่งมาจาก `AddClass`
  const [stdid, setStdid] = useState("");
  const [name, setName] = useState("");

  const handleJoinClass = async () => {
    if (!stdid || !name) return Alert.alert("กรุณากรอกข้อมูลให้ครบ");

    try {
      await setDoc(doc(db, `classroom/${cid}/students/${auth.currentUser.uid}`), {
        name,
        stdid,
      });

      await setDoc(doc(db, `users/${auth.currentUser.uid}/classroom/${cid}`), { status: 2 });

      Alert.alert("เข้าร่วมวิชาสำเร็จ");
      navigation.navigate("Home"); // 🔹 กลับไปหน้าแรก
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>กรอกข้อมูลนักศึกษา</Text>
      <Text>รหัสวิชา: {cid}</Text>
      
      <TextInput
        placeholder="รหัสนักศึกษา"
        value={stdid}
        onChangeText={setStdid}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <TextInput
        placeholder="ชื่อ - นามสกุล"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="ยืนยันการเข้าร่วม" onPress={handleJoinClass} />
    </View>
  );
};

export default JoinClass;
