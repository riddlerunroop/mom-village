// "Share your Reset with the Village" — native mirror of
// src/app/dashboard/community/reset-share/new/. Text, photo, video
// (≤60s), or an in-app-recorded audio clip (≤60s, auto-stops), posted into
// reset_shares (migration_59). Reuses the same expo-image-picker/expo-av
// patterns already established in memories.tsx and vaccinations-log.tsx.

import { useState, useRef } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../lib/supabase";
import { Colors, Fonts } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

type MediaType = "text" | "photo" | "video" | "audio";
const MAX_MEDIA_SECONDS = 60;

function decodeBase64(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export default function ResetShareNewScreen() {
  const { activityId } = useLocalSearchParams<{ activityId?: string }>();

  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");

  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const recordStartRef = useRef(0);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function pickPhoto() {
    setError("");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Mom's Village needs photo access to share a Reset photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    setPhoto(result.assets[0]);
  }

  async function pickVideo() {
    setError("");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Mom's Village needs photo/video access to share a Reset video.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.7,
      videoMaxDuration: MAX_MEDIA_SECONDS,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.duration && asset.duration / 1000 > MAX_MEDIA_SECONDS) {
      setError(`That clip is about ${Math.round(asset.duration / 1000)}s — keep videos to 60 seconds or under.`);
      return;
    }
    setVideo(asset);
  }

  async function startRecording() {
    setError("");
    setRecordedUri(null);
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Mom's Village needs microphone access to record your Reset.");
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setRecording(rec);
    setIsRecording(true);
    recordStartRef.current = Date.now();
    autoStopTimerRef.current = setTimeout(() => stopRecording(rec), MAX_MEDIA_SECONDS * 1000);
  }

  async function stopRecording(target?: Audio.Recording) {
    const rec = target ?? recording;
    if (!rec) return;
    if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
    setIsRecording(false);
    await rec.stopAndUnloadAsync();
    const uri = rec.getURI();
    setRecording(null);
    if (uri) {
      setRecordedUri(uri);
      setAudioDuration(Math.min((Date.now() - recordStartRef.current) / 1000, MAX_MEDIA_SECONDS));
    }
  }

  function switchMediaType(next: MediaType) {
    setMediaType(next);
    setError("");
  }

  const canSubmit =
    !saving &&
    ((mediaType === "text" && text.trim().length > 0) ||
      (mediaType === "photo" && Boolean(photo)) ||
      (mediaType === "video" && Boolean(video)) ||
      (mediaType === "audio" && Boolean(recordedUri)));

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    try {
      let mediaPath: string | null = null;
      let durationSeconds: number | null = null;

      if (mediaType === "photo" && photo) {
        const ext = photo.mimeType?.includes("png") ? "png" : "jpg";
        mediaPath = `${user.id}/${Date.now()}.${ext}`;
        const base64 = await FileSystem.readAsStringAsync(photo.uri, { encoding: FileSystem.EncodingType.Base64 });
        const { error: upErr } = await supabase.storage
          .from("reset-shares")
          .upload(mediaPath, decodeBase64(base64), { contentType: photo.mimeType || "image/jpeg" });
        if (upErr) throw upErr;
      } else if (mediaType === "video" && video) {
        mediaPath = `${user.id}/${Date.now()}.mp4`;
        const base64 = await FileSystem.readAsStringAsync(video.uri, { encoding: FileSystem.EncodingType.Base64 });
        const { error: upErr } = await supabase.storage
          .from("reset-shares")
          .upload(mediaPath, decodeBase64(base64), { contentType: video.mimeType || "video/mp4" });
        if (upErr) throw upErr;
        durationSeconds = video.duration ? video.duration / 1000 : null;
      } else if (mediaType === "audio" && recordedUri) {
        mediaPath = `${user.id}/${Date.now()}.m4a`;
        const base64 = await FileSystem.readAsStringAsync(recordedUri, { encoding: FileSystem.EncodingType.Base64 });
        const { error: upErr } = await supabase.storage
          .from("reset-shares")
          .upload(mediaPath, decodeBase64(base64), { contentType: "audio/m4a" });
        if (upErr) throw upErr;
        durationSeconds = audioDuration;
      }

      const { error: insertError } = await supabase.from("reset_shares").insert({
        user_id: user.id,
        activity_id: activityId ?? null,
        media_type: mediaType,
        media_path: mediaPath,
        caption: mediaType === "text" ? text.trim() : caption.trim() || null,
        duration_seconds: durationSeconds,
      });
      if (insertError) throw insertError;

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't share that — try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <DrillHeader title="Tell the village" />

      {done ? (
        <View style={[styles.card, { alignItems: "center", marginTop: 16 }]}>
          <Text style={styles.doneText}>Shared with the village 🎉</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace("/reset-gallery")}>
            <Text style={styles.primaryButtonText}>See the Reset Gallery →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.artisticNote}>
            Feeling artistic? A song overlay, a filter, a cute edit — make it yours. No pressure to
            make it perfect, just to make it feel like you.
          </Text>

          <View style={styles.chipRow}>
            {(["text", "photo", "video", "audio"] as MediaType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => switchMediaType(t)}
                style={[styles.chip, mediaType === t && styles.chipActive]}
              >
                <Text style={[styles.chipText, mediaType === t && styles.chipTextActive]}>
                  {t === "text" ? "Text" : t === "photo" ? "Photo" : t === "video" ? "Video (≤60s)" : "Audio (≤60s)"}
                </Text>
              </Pressable>
            ))}
          </View>

          {mediaType === "text" && (
            <TextInput
              style={styles.textArea}
              value={text}
              onChangeText={setText}
              multiline
              placeholder="How'd your Reset go?"
              placeholderTextColor={Colors.ink + "55"}
            />
          )}

          {mediaType === "photo" && (
            <View style={styles.card}>
              <Pressable style={styles.pickButton} onPress={pickPhoto}>
                <Text style={styles.pickButtonText}>{photo ? "Change photo" : "Choose a photo"}</Text>
              </Pressable>
              {photo && <Image source={{ uri: photo.uri }} style={styles.preview} />}
              <TextInput
                style={styles.input}
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption (optional)"
                placeholderTextColor={Colors.ink + "55"}
              />
            </View>
          )}

          {mediaType === "video" && (
            <View style={styles.card}>
              <Pressable style={styles.pickButton} onPress={pickVideo}>
                <Text style={styles.pickButtonText}>{video ? "Change video" : "Choose a video"}</Text>
              </Pressable>
              {video && <Text style={styles.smallNote}>Video selected ✓</Text>}
              <TextInput
                style={styles.input}
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption (optional)"
                placeholderTextColor={Colors.ink + "55"}
              />
            </View>
          )}

          {mediaType === "audio" && (
            <View style={styles.card}>
              {!isRecording && !recordedUri && (
                <Pressable style={styles.pickButton} onPress={startRecording}>
                  <Text style={styles.pickButtonText}>● Start recording</Text>
                </Pressable>
              )}
              {isRecording && (
                <Pressable style={[styles.pickButton, { backgroundColor: Colors.ink }]} onPress={() => stopRecording()}>
                  <Text style={[styles.pickButtonText, { color: Colors.ivory }]}>
                    ■ Stop recording (auto-stops at 60s)
                  </Text>
                </Pressable>
              )}
              {recordedUri && (
                <>
                  <Text style={styles.smallNote}>Recording ready ✓</Text>
                  <Pressable onPress={() => setRecordedUri(null)}>
                    <Text style={styles.linkText}>Record again</Text>
                  </Pressable>
                </>
              )}
              <TextInput
                style={styles.input}
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption (optional)"
                placeholderTextColor={Colors.ink + "55"}
              />
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryButton, !canSubmit && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {saving ? (
              <ActivityIndicator color={Colors.ivory} />
            ) : (
              <Text style={styles.primaryButtonText}>Share with the village</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  artisticNote: {
    fontFamily: Fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    color: Colors.sageDeep,
    marginBottom: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: Colors.terracotta, borderColor: Colors.terracotta },
  chipText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink + "99" },
  chipTextActive: { color: Colors.ivory },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    backgroundColor: "#fff",
    color: Colors.ink,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  card: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 16, marginBottom: 16 },
  pickButton: { backgroundColor: Colors.terracotta, borderRadius: 999, paddingVertical: 12, alignItems: "center", marginBottom: 12 },
  pickButtonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
  preview: { width: "100%", height: 180, borderRadius: 14, marginBottom: 12, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, backgroundColor: "#fff", color: Colors.ink },
  smallNote: { fontSize: 12, color: Colors.sageDeep, fontFamily: Fonts.bodySemiBold, marginBottom: 8 },
  linkText: { fontSize: 12, color: Colors.ink + "70", marginBottom: 8 },
  error: { color: Colors.terracotta, fontSize: 13, marginBottom: 12 },
  primaryButton: { backgroundColor: Colors.terracotta, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  primaryButtonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
  doneText: { fontFamily: Fonts.display, fontStyle: "italic", fontSize: 17, color: Colors.sageDeep, marginBottom: 16 },
});
