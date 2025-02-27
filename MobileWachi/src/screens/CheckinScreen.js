import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from "firebase/firestore";

const CheckinScreen = () => {
  const route = useRoute();
  const { cid } = route.params;
  const [cno, setCno] = useState("");
  const [code, setCode] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, `classroom/${cid}/checkin/${cno}/students`));
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    if (cno) fetchStudents();
  }, [cid, cno]);

  const handleCheckIn = async () => {
    if (!cno || !code) return Alert.alert("กรุณากรอกลำดับการเช็คชื่อและรหัสเข้าเรียน");

    const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
    const checkinSnap = await getDoc(checkinRef);

    if (checkinSnap.exists() && checkinSnap.data().code === code) {
      await setDoc(doc(db, `classroom/${cid}/checkin/${cno}/students/${auth.currentUser.uid}`), {
        stdid: auth.currentUser.uid,
        name: auth.currentUser.displayName || "ไม่มีชื่อ",
        date: new Date().toISOString(),
      });
      Alert.alert("เช็คชื่อสำเร็จ!");
    } else {
      Alert.alert("รหัสเข้าเรียนไม่ถูกต้อง");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>เช็คชื่อเข้าเรียน</Text>
      <TextInput placeholder="ลำดับการเช็คชื่อ (CNO)" value={cno} onChangeText={setCno} keyboardType="numeric" />
      <TextInput placeholder="รหัสเข้าเรียน (Code)" value={code} onChangeText={setCode} />
      <Button title="เช็คชื่อ" onPress={handleCheckIn} />
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.stdid} - {item.name}</Text>}
      />
    </View>
  );
};

export default CheckinScreen;
