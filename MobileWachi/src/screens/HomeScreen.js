import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const HomeScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/classroom`));
      setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  return (
    <View>
      <Text>ข้อมูลผู้ใช้: {auth.currentUser.email}</Text>
      <FlatList
        data={courses}
        renderItem={({ item }) => (
          <View>
            <Text>{item.id}</Text>
            <Button title="เข้าเรียน" onPress={() => navigation.navigate("Checkin", { cid: item.id })} />
          </View>
        )}
      />
      <Button title="เพิ่มวิชา" onPress={() => navigation.navigate("AddClass")} />
      <Button title="สแกน QR Code" onPress={() => navigation.navigate("QRScanner")} />
    </View>
  );
};

export default HomeScreen;
