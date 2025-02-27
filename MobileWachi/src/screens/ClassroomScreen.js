import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const ClassroomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { cid } = route.params;
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchClassInfo = async () => {
      const classRef = doc(db, `classroom/${cid}`);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        setClassInfo(classSnap.data());
      }
    };

    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, `classroom/${cid}/students`));
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchClassInfo();
    fetchStudents();
  }, [cid]);

  return (
    <View style={{ padding: 20 }}>
      {classInfo && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{classInfo.info.name} ({classInfo.info.code})</Text>
          <Text>ห้องเรียน: {classInfo.info.room}</Text>
        </>
      )}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.stdid} - {item.name}</Text>}
      />
      <Button title="เช็คชื่อ" onPress={() => navigation.navigate("Checkin", { cid })} />
      <Button title="ถาม-ตอบ" onPress={() => navigation.navigate("Question", { cid })} />
    </View>
  );
};

export default ClassroomScreen;
