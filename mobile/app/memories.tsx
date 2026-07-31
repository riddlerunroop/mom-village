// Memories — native port of src/app/dashboard/memories/page.tsx +
// MemoriesClient.tsx, Phase 6. Voice recording (expo-av) → transcribe via
// the website's /api/memories/transcribe (Bearer-authed) → review/edit →
// save; photo logging (expo-image-picker) → save; recall question box via
// /api/memories/recall; merged timeline of both log types.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
// expo-file-system 19.x (SDK 54) moved readAsStringAsync/EncodingType to a
// "legacy" subpath — the new default API is File/Directory-class based.
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../lib/supabase";
import { authedFetch } from "../lib/api";
import { hasActiveSubscription } from "../lib/subscription";
import { Colors } from "../constants/theme";

type VoiceLog = { id: string; transcript: string; logged_at: string };
type PhotoLog = { id: string; photo_path: string; caption: string | null; logged_at: string };
type TimelineEntry =
  | { kind: "voice"; id: string; text: string; loggedAt: string }
  | { kind: "photo"; id: string; text: string; loggedAt: string; signedUrl: string | null };

export default function MemoriesScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [draftTranscript, setDraftTranscript] = useState<string | null>(null);
  const [savingVoice, setSavingVoice] = useState(false);

  const [caption, setCaption] = useState("");
  const [pickedPhoto, setPickedPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  const loadTimeline = useCallback(async (uid: string) => {
    const [{ data: voiceLogs }, { data: photoLogs }] = await Promise.all([
      supabase
        .from("user_voice_logs")
        .select("id, transcript, logged_at")
        .eq("user_id", uid)
        .order("logged_at", { ascending: false })
        .limit(100),
      supabase
        .from("user_photo_logs")
        .select("id, photo_path, caption, logged_at")
        .eq("user_id", uid)
        .order("logged_at", { ascending: false })
        .limit(100),
    ]);

    const photoPaths = (photoLogs || []).map((p: PhotoLog) => p.photo_path);
    let signedMap: Record<string, string> = {};
    if (photoPaths.length > 0) {
      const { data: signed } = await supabase.storage
        .from("memory-photos")
        .createSignedUrls(photoPaths, 3600);
      signedMap = Object.fromEntries((signed || []).map((s) => [s.path, s.signedUrl]));
    }

    const entries: TimelineEntry[] = [
      ...((voiceLogs || []) as VoiceLog[]).map((v) => ({
        kind: "voice" as const,
        id: v.id,
        text: v.transcript,
        loggedAt: v.logged_at,
      })),
      ...((photoLogs || []) as PhotoLog[]).map((p) => ({
        kind: "photo" as const,
        id: p.id,
        text: p.caption || "A photo you logged",
        loggedAt: p.logged_at,
        signedUrl: signedMap[p.photo_path] ?? null,
      })),
    ].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

    setTimeline(entries);
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const subscribed = await hasActiveSubscription(supabase, user.id);
      setIsSubscribed(subscribed);
      if (subscribed) await loadTimeline(user.id);
      setLoading(false);
    })();
  }, [loadTimeline]);

  const askRecall = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const res = await authedFetch("/api/memories/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const json = (await res.json()) as { answer?: string; error?: string };
      setAnswer(json.answer || json.error || "Couldn't find an answer just now — try again.");
    } catch {
      setAnswer("Couldn't reach the recall service — try again in a moment.");
    } finally {
      setAsking(false);
    }
  };

  const startRecording = async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Mom's Village needs microphone access to record a voice memory.");
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setRecording(rec);
    setIsRecording(true);
    setDraftTranscript(null);
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (!uri) return;

    setTranscribing(true);
    try {
      const form = new FormData();
      form.append("audio", {
        uri,
        name: "memory.m4a",
        type: "audio/m4a",
      } as unknown as Blob);

      const res = await authedFetch("/api/memories/transcribe", { method: "POST", body: form });
      const json = (await res.json()) as { transcript?: string; error?: string };
      if (!res.ok) {
        Alert.alert("Couldn't transcribe", json.error || "Try again, or type it instead.");
        setDraftTranscript("");
      } else {
        setDraftTranscript(json.transcript || "");
      }
    } catch {
      Alert.alert("Couldn't transcribe", "Try again, or type it instead.");
      setDraftTranscript("");
    } finally {
      setTranscribing(false);
    }
  };

  const saveVoiceLog = async () => {
    if (!userId || draftTranscript === null || !draftTranscript.trim()) return;
    setSavingVoice(true);
    try {
      const { error } = await supabase.from("user_voice_logs").insert({
        user_id: userId,
        transcript: draftTranscript.trim(),
      });
      if (error) {
        Alert.alert("Couldn't save", error.message);
        return;
      }
      setDraftTranscript(null);
      await loadTimeline(userId);
    } finally {
      setSavingVoice(false);
    }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Mom's Village needs photo access to log a memory photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    setPickedPhoto(result.assets[0]);
  };

  const savePhotoLog = async () => {
    if (!userId || !pickedPhoto) return;
    setSavingPhoto(true);
    try {
      const ext = pickedPhoto.mimeType?.includes("png") ? "png" : "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const base64 = await FileSystem.readAsStringAsync(pickedPhoto.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const { error: uploadError } = await supabase.storage
        .from("memory-photos")
        .upload(path, decodeBase64(base64), { contentType: pickedPhoto.mimeType || "image/jpeg" });
      if (uploadError) {
        Alert.alert("Couldn't upload photo", uploadError.message);
        return;
      }
      const { error } = await supabase.from("user_photo_logs").insert({
        user_id: userId,
        photo_path: path,
        caption: caption.trim() || null,
      });
      if (error) {
        Alert.alert("Couldn't save", error.message);
        return;
      }
      setPickedPhoto(null);
      setCaption("");
      await loadTimeline(userId);
    } finally {
      setSavingPhoto(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Memories</Text>
        <View style={{ width: 22 }} />
      </View>

      {!isSubscribed ? (
        <View style={styles.lockedCard}>
          <Text style={styles.cardTitle}>Log the little things, recall them later</Text>
          <Text style={styles.body}>
            Join to log voice notes and photos in the moment, and ask the app to recall them
            whenever you need.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Ask about something you logged</Text>
          <View style={styles.askRow}>
            <TextInput
              style={styles.askInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="What did I give her for the fever last week?"
              placeholderTextColor={Colors.ink + "55"}
              multiline
            />
            <Pressable style={styles.askButton} onPress={askRecall} disabled={asking}>
              {asking ? <ActivityIndicator color={Colors.ivory} size="small" /> : <Ionicons name="send" size={16} color={Colors.ivory} />}
            </Pressable>
          </View>
          {answer && (
            <View style={styles.answerCard}>
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>Log a voice memory</Text>
          <View style={styles.card}>
            {!isRecording && draftTranscript === null && (
              <Pressable style={styles.recordButton} onPress={startRecording}>
                <Ionicons name="mic-outline" size={20} color={Colors.ivory} />
                <Text style={styles.recordButtonText}>Start recording</Text>
              </Pressable>
            )}
            {isRecording && (
              <Pressable style={[styles.recordButton, { backgroundColor: Colors.terracotta }]} onPress={stopRecording}>
                <Ionicons name="stop-circle-outline" size={20} color={Colors.ivory} />
                <Text style={styles.recordButtonText}>Stop recording</Text>
              </Pressable>
            )}
            {transcribing && (
              <View style={styles.extractingRow}>
                <ActivityIndicator color={Colors.goldDeep} />
                <Text style={styles.extractingText}>Transcribing…</Text>
              </View>
            )}
            {draftTranscript !== null && !transcribing && (
              <>
                <Text style={styles.label}>Review before saving</Text>
                <TextInput
                  style={styles.transcriptInput}
                  value={draftTranscript}
                  onChangeText={setDraftTranscript}
                  multiline
                  placeholder="Edit the transcript…"
                  placeholderTextColor={Colors.ink + "55"}
                />
                <View style={styles.rowButtons}>
                  <Pressable style={styles.secondaryButton} onPress={() => setDraftTranscript(null)}>
                    <Text style={styles.secondaryButtonText}>Discard</Text>
                  </Pressable>
                  <Pressable style={[styles.primaryButton, savingVoice && { opacity: 0.6 }]} onPress={saveVoiceLog} disabled={savingVoice}>
                    <Text style={styles.primaryButtonText}>{savingVoice ? "Saving…" : "Save"}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <Text style={styles.sectionLabel}>Log a photo</Text>
          <View style={styles.card}>
            <Pressable style={styles.photoPickButton} onPress={pickPhoto}>
              <Ionicons name="image-outline" size={18} color={Colors.indigo} />
              <Text style={styles.photoButtonText}>{pickedPhoto ? "Change photo" : "Choose a photo"}</Text>
            </Pressable>
            {pickedPhoto && <Image source={{ uri: pickedPhoto.uri }} style={styles.preview} />}
            {pickedPhoto && (
              <>
                <TextInput
                  style={styles.input}
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Caption (optional)"
                  placeholderTextColor={Colors.ink + "55"}
                />
                <Pressable style={[styles.primaryButton, savingPhoto && { opacity: 0.6 }]} onPress={savePhotoLog} disabled={savingPhoto}>
                  <Text style={styles.primaryButtonText}>{savingPhoto ? "Saving…" : "Save photo"}</Text>
                </Pressable>
              </>
            )}
          </View>

          <Text style={styles.sectionLabel}>Timeline</Text>
          {timeline.length === 0 ? (
            <Text style={styles.emptyText}>Nothing logged yet — your voice notes and photos will show up here.</Text>
          ) : (
            timeline.map((entry) => (
              <View key={`${entry.kind}-${entry.id}`} style={styles.timelineRow}>
                {entry.kind === "photo" && entry.signedUrl && (
                  <Image source={{ uri: entry.signedUrl }} style={styles.timelineThumb} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.timelineDate}>
                    {new Date(entry.loggedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Text style={styles.timelineText}>{entry.text}</Text>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

function decodeBase64(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  topBarTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: Colors.sageDeep, marginTop: 22, marginBottom: 8 },
  askRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  askInput: { flex: 1, borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, backgroundColor: "#fff", color: Colors.ink, minHeight: 44 },
  askButton: { backgroundColor: Colors.goldDeep, borderRadius: 999, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  answerCard: { backgroundColor: Colors.ivory2, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 14, marginTop: 10 },
  answerText: { fontSize: 13, color: Colors.ink, lineHeight: 19 },
  card: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 16 },
  recordButton: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13 },
  recordButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  extractingRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", paddingVertical: 6 },
  extractingText: { fontSize: 13, color: Colors.ink + "99" },
  label: { fontSize: 12, fontWeight: "700", color: Colors.indigo, marginBottom: 6 },
  transcriptInput: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, backgroundColor: "#fff", color: Colors.ink, minHeight: 80, textAlignVertical: "top" },
  rowButtons: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryButton: { flex: 1, backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  primaryButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 13 },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: Colors.line, borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  secondaryButtonText: { color: Colors.ink + "99", fontWeight: "600", fontSize: 13 },
  photoPickButton: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingVertical: 12, backgroundColor: "#fff", marginBottom: 12 },
  photoButtonText: { fontSize: 13, fontWeight: "600", color: Colors.indigo },
  preview: { width: "100%", height: 180, borderRadius: 14, marginBottom: 12, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, backgroundColor: "#fff", marginBottom: 12, color: Colors.ink },
  emptyText: { fontSize: 13, fontStyle: "italic", color: Colors.ink + "80" },
  timelineRow: { flexDirection: "row", gap: 10, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 12, marginBottom: 8, alignItems: "flex-start" },
  timelineThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: Colors.ivory2 },
  timelineDate: { fontSize: 11, fontWeight: "700", color: Colors.sageDeep, marginBottom: 3 },
  timelineText: { fontSize: 13, color: Colors.ink, lineHeight: 18 },
});
