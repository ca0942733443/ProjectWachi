import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, AsyncStorage } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc, onSnapshot } from "firebase/firestore";

const QuestionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { cid } = route.params;

  const [cno, setCno] = useState("");
  const [questionShow, setQuestionShow] = useState(false);
  const [answer, setAnswer] = useState("");
  const [questionNo, setQuestionNo] = useState(null);

  useEffect(() => {
    const loadLocalData = async () => {
      const storedCno = await AsyncStorage.getItem(`cno_${cid}`);
      if (storedCno) {
        setCno(storedCno);
      } else {
        fetchOpenCheckin(); // ✅ ถ้าไม่มีข้อมูลใน LocalStorage ให้โหลดจาก Firebase
      }
    };
    loadLocalData();
  }, [cid]);

  const fetchOpenCheckin = async () => {
    const checkinQuery = query(collection(db, `classroom/${cid}/checkin`), where("status", "==", 1));
    const querySnapshot = await getDocs(checkinQuery);

    if (!querySnapshot.empty) {
      const openCheckin = querySnapshot.docs[0];
      setCno(openCheckin.id);
      await AsyncStorage.setItem(`cno_${cid}`, openCheckin.id);
    }
  };

  useEffect(() => {
    if (!cno) return;

    const questionRef = doc(db, `classroom/${cid}/checkin/${cno}`);
    const unsubscribeQuestion = onSnapshot(questionRef, (docSnap) => {
      if (docSnap.exists()) {
        setQuestionShow(docSnap.data().question_show);
        setQuestionNo(docSnap.data().question_no);
      }
    });

    return () => {
      unsubscribeQuestion();
    };
  }, [cid, cno]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert("กรุณากรอกคำตอบ");
      return;
    }

    const studentAnswerRef = doc(db, `classroom/${cid}/checkin/${cno}/answers/${questionNo}/students/${auth.currentUser.uid}`);
    await setDoc(studentAnswerRef, {
      text: answer,
      time: new Date().toISOString(),
    });

    setAnswer("");
    Alert.alert("ส่งคำตอบสำเร็จ!");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>ตอบคำถาม</Text>

      {questionShow ? (
        <>
          <TextInput
            placeholder="กรอกคำตอบของคุณ"
            value={answer}
            onChangeText={setAnswer}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
          />
          <Button title="ส่งคำตอบ" onPress={handleSubmitAnswer} />
        </>
      ) : (
        <Text>❌ ยังไม่มีคำถาม</Text>
      )}

      <Button
        title="กลับหน้าหลัก"
        onPress={() => {
          AsyncStorage.setItem(`cno_${cid}`, cno);
          navigation.navigate("Home");
        }}
      />
    </View>
  );
};

export default QuestionScreen;
