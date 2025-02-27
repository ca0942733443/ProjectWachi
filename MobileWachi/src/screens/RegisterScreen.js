import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), { name, email, photo: "", classroom: {} });
      Alert.alert("สมัครสมาชิกสำเร็จ!");
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("สมัครสมาชิกไม่สำเร็จ", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>สมัครสมาชิก</Text>
      <TextInput placeholder="ชื่อ-สกุล" value={name} onChangeText={setName} />
      <TextInput placeholder="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="สมัครสมาชิก" onPress={handleRegister} />
      <Text onPress={() => navigation.navigate("Login")} style={{ color: "blue", marginTop: 10 }}>เข้าสู่ระบบ</Text>
    </View>
  );
};

export default RegisterScreen;
