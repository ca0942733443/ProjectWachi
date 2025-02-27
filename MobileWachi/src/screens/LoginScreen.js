import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore"; // ✅ Import Firestore
import { useNavigation } from "@react-navigation/native";

const auth = getAuth();
const db = getFirestore();

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ บันทึกข้อมูลลง Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name: user.displayName || "", // ถ้ามีชื่อใน Firebase Auth
        email: user.email,
        photo: user.photoURL || "", // ถ้ามีรูปใน Firebase Auth
      }, { merge: true });

      Alert.alert("เข้าสู่ระบบสำเร็จ!");
      navigation.replace("Home"); // ✅ ไปหน้า Home
    } catch (error) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>เข้าสู่ระบบ</Text>
      <TextInput placeholder="อีเมล" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="เข้าสู่ระบบ" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate("RegisterScreen")} style={{ color: "blue", marginTop: 10 }}>
        สมัครสมาชิก
      </Text>
    </View>
  );
};

const styles = {
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
};

export default LoginScreen;
