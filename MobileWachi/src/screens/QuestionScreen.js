import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, collection, setDoc, onSnapshot } from "firebase/firestore";

const QuestionScreen = () => {
  const route = useRoute();
  const { cid } = route.params;
  const [cno, setCno] = useState("");
  const [questionShow, setQuestionShow] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (!cno) return;

    const questionRef = doc(db, `classroom/${cid}/checkin/${cno}`);
    const unsubscribe = onSnapshot(questionRef, (docSnap) => {
      if (docSnap.exists()) {
        setQuestionShow(docSnap.data().question_show);
      }
    });

    const answerRef = collection(db, `classroom/${cid}/checkin/${cno}/answers`);
    const answerUnsub = onSnapshot(answerRef, (snapshot) => {
      setAnswers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      answerUnsub();
    };
  }, [cid, cno]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    const answerRef = doc(db, `classroom/${cid}/checkin/${cno}/answers/${auth.currentUser.uid}`);
    await setDoc(answerRef, {
      text: answer,
      time: new Date().toISOString(),
    });

    setAnswer("");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>ตอบคำถาม</Text>
      <TextInput placeholder="ลำดับการเช็คชื่อ (CNO)" value={cno} onChangeText={setCno} keyboardType="numeric" />
      {questionShow ? (
        <>
          <TextInput placeholder="กรอกคำตอบของคุณ" value={answer} onChangeText={setAnswer} />
          <Button title="ส่งคำตอบ" onPress={handleSubmitAnswer} />
          <FlatList
            data={answers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Text>{item.text} - {item.time}</Text>}
          />
        </>
      ) : (
        <Text>ยังไม่มีคำถาม</Text>
      )}
    </View>
  );
};

export default QuestionScreen;
