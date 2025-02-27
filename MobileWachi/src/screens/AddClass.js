import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const AddClass = ({ navigation, route }) => {
  const [cid, setCid] = useState("");

  // ✅ ดึงค่าที่ได้จาก QRScannerScreen
  useFocusEffect(() => {
    if (route.params?.scannedCid) {
      setCid(route.params.scannedCid);
      Alert.alert("สแกนสำเร็จ!", `รหัสวิชา: ${route.params.scannedCid}`);
    }
  });

  return (
    <View style={{ padding: 20 }}>
      <Text>เข้าร่วมวิชา</Text>
      <TextInput
        placeholder="รหัสวิชา CID"
        value={cid}
        onChangeText={setCid}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        editable={false} // 🔹 ปิดการแก้ไข
      />

      {/* ✅ ปุ่มไป JoinClass โดยส่ง cid ไปด้วย */}
      <Button title="ดำเนินการต่อ" onPress={() => navigation.navigate("JoinClass", { cid })} />

      {/* ✅ ไปที่ QRScannerScreen */}
      <Button title="สแกน QR Code" onPress={() => navigation.navigate("QRScanner")} />
    </View>
  );
};

export default AddClass;
