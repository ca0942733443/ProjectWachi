import { useState, useEffect, useRef } from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const isProcessing = useRef(false); // ป้องกันการสแกนซ้ำ

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, [permission]);

  const extractData = (data) => {
    const registerMatch = data.match(/\/register\/([a-zA-Z0-9_-]+)/);
    const checkinMatch = data.match(/\/checkin\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9]+)/);

    if (registerMatch) {
      return { type: "cid", value: registerMatch[1] };
    } else if (checkinMatch) {
      return { type: "checkin", cid: checkinMatch[1], code: checkinMatch[2] };
    } else {
      return { type: "unknown", value: data };
    }
  };

  const handleScan = ({ data }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const extracted = extractData(data);
    setScanned(true);
    console.log("✅ QR Code ที่สแกนได้:", extracted);

    if (extracted.type === "cid") {
      Alert.alert("สแกนสำเร็จ", `รหัสวิชา: ${extracted.value}`, [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("AddClass", { scannedCid: extracted.value });
            setTimeout(() => {
              isProcessing.current = false;
              setScanned(false);
            }, 2000);
          },
        },
      ]);
    } else if (extracted.type === "checkin") {
      Alert.alert("สแกนสำเร็จ", `รหัสเช็คชื่อ: ${extracted.code}`, [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Checkin", {
              cid: extracted.cid,
              checkinCode: extracted.code,
            });
            setTimeout(() => {
              isProcessing.current = false;
              setScanned(false);
            }, 2000);
          },
        },
      ]);
    } else {
      Alert.alert("QR Code ไม่รองรับ", `ข้อมูลที่สแกน: ${extracted.value}`, [
        {
          text: "OK",
          onPress: () => {
            isProcessing.current = false;
            setScanned(false);
          },
        },
      ]);
    }
  };

  if (!permission) {
    return (
      <View style={styles.messageContainer}>
        <Text>กำลังขอสิทธิ์ใช้งานกล้อง...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.messageContainer}>
        <Text>❌ ไม่สามารถเข้าถึงกล้องได้</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>🔄 สแกนอีกครั้ง</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>🔙 กลับ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  camera: { flex: 1 },
  messageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scanAgainButton: {
    position: "absolute",
    bottom: 50,
    left: "25%",
    width: "50%",
    backgroundColor: "#008CBA",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  scanAgainText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: { color: "white", fontSize: 16 },
});
