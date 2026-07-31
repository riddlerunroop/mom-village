// Log a vaccination dose — native port of
// src/app/dashboard/vaccinations/log/LogDoseClient.tsx, Phase 6. Photo →
// AI suggestion (via the website's /api/vaccination/extract route, called
// with a Bearer token through authedFetch) → she reviews/edits → save.

import { useState } from "react";
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
import { supabase } from "../lib/supabase";
import { authedFetch } from "../lib/api";
import { occurrenceOptions } from "../lib/vaccinationSchedule";
import { Colors } from "../constants/theme";

const OPTIONS = occurrenceOptions();

type ExtractResult = {
  vaccineGuess: string | null;
  dateGuess: string | null;
  rawText: string;
  confident: boolean;
};

export default function VaccinationsLogScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [occurrenceKey, setOccurrenceKey] = useState<string | null>(null);
  const [dateGiven, setDateGiven] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Mom's Village needs this permission to log a card photo.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64 ?? null);
    setMediaType(asset.mimeType || "image/jpeg");
    setExtractResult(null);

    if (asset.base64) {
      setExtracting(true);
      try {
        const res = await authedFetch("/api/vaccination/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: asset.base64, mediaType: asset.mimeType || "image/jpeg" }),
        });
        const json = (await res.json()) as ExtractResult & { error?: string };
        if (!res.ok) {
          Alert.alert("Couldn't read the card", json.error || "Enter the details manually below.");
        } else {
          setExtractResult(json);
          if (json.dateGuess) setDateGiven(json.dateGuess);
          if (json.vaccineGuess) {
            const match = OPTIONS.find((o) =>
              o.vaccine.toLowerCase().includes(json.vaccineGuess!.toLowerCase()) ||
              json.vaccineGuess!.toLowerCase().includes(o.vaccine.toLowerCase())
            );
            if (match) setOccurrenceKey(match.occurrenceKey);
          }
        }
      } catch {
        Alert.alert("Couldn't read the card", "Enter the details manually below.");
      } finally {
        setExtracting(false);
      }
    }
  };

  const save = async () => {
    if (!occurrenceKey || !dateGiven.trim()) {
      Alert.alert("Missing details", "Choose which dose this is and the date it was given.");
      return;
    }
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const chosen = OPTIONS.find((o) => o.occurrenceKey === occurrenceKey);
      let cardPhotoPath: string | null = null;

      if (photoBase64) {
        const ext = mediaType.includes("png") ? "png" : "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("vaccination-cards")
          .upload(path, decodeBase64(photoBase64), { contentType: mediaType });
        if (!uploadError) cardPhotoPath = path;
      }

      const { error } = await supabase.from("user_vaccination_records").upsert(
        {
          user_id: user.id,
          occurrence_key: occurrenceKey,
          vaccine: chosen?.vaccine ?? "",
          dose_label: chosen?.doseLabel ?? "",
          date_given: dateGiven.trim(),
          card_photo_path: cardPhotoPath,
          ai_suggested_vaccine: extractResult?.vaccineGuess ?? null,
          ai_suggested_date: extractResult?.dateGuess ?? null,
        },
        { onConflict: "user_id,occurrence_key" }
      );

      if (error) {
        Alert.alert("Couldn't save", error.message);
        return;
      }

      router.back();
    } finally {
      setSaving(false);
    }
  };

  const chosenLabel = OPTIONS.find((o) => o.occurrenceKey === occurrenceKey)?.label;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Log a dose</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.body}>
        Photograph the vaccination card and we'll suggest the vaccine and date — always review and
        edit before saving, handwritten cards can be hard to read.
      </Text>

      <View style={styles.photoRow}>
        <Pressable style={styles.photoButton} onPress={() => pickImage(true)}>
          <Ionicons name="camera-outline" size={18} color={Colors.indigo} />
          <Text style={styles.photoButtonText}>Camera</Text>
        </Pressable>
        <Pressable style={styles.photoButton} onPress={() => pickImage(false)}>
          <Ionicons name="image-outline" size={18} color={Colors.indigo} />
          <Text style={styles.photoButtonText}>Choose photo</Text>
        </Pressable>
      </View>

      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}

      {extracting && (
        <View style={styles.extractingRow}>
          <ActivityIndicator color={Colors.goldDeep} />
          <Text style={styles.extractingText}>Reading the card…</Text>
        </View>
      )}

      {extractResult && !extracting && (
        <View style={[styles.suggestionCard, { borderColor: extractResult.confident ? Colors.sageDeep : Colors.terracotta }]}>
          <Text style={styles.suggestionTitle}>
            {extractResult.confident ? "Here's what we read" : "Not fully sure — please check"}
          </Text>
          <Text style={styles.suggestionBody}>{extractResult.rawText}</Text>
        </View>
      )}

      <Text style={styles.label}>Which dose is this?</Text>
      <Pressable style={styles.selectBox} onPress={() => setShowPicker((s) => !s)}>
        <Text style={chosenLabel ? styles.selectText : styles.selectPlaceholder}>
          {chosenLabel || "Choose a dose"}
        </Text>
        <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={16} color={Colors.ink + "80"} />
      </Pressable>
      {showPicker && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 260 }}>
            {OPTIONS.map((o) => (
              <Pressable
                key={o.occurrenceKey}
                style={styles.dropdownItem}
                onPress={() => {
                  setOccurrenceKey(o.occurrenceKey);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{o.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.label}>Date given</Text>
      <TextInput
        style={styles.input}
        value={dateGiven}
        onChangeText={setDateGiven}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={Colors.ink + "55"}
      />

      <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.ivory} /> : <Text style={styles.saveButtonText}>Save dose</Text>}
      </Pressable>
    </ScrollView>
  );
}

// Uploads to Supabase Storage need a byte payload; base64 → Uint8Array via
// a small manual decoder (no atob/Buffer available by default in RN).
function decodeBase64(base64: string): Uint8Array {
  const binary = globalThis.atob ? globalThis.atob(base64) : legacyAtob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function legacyAtob(input: string): string {
  let str = input.replace(/[^A-Za-z0-9+/=]/g, "");
  let output = "";
  for (let i = 0; i < str.length; i += 4) {
    const enc1 = CHARS.indexOf(str.charAt(i));
    const enc2 = CHARS.indexOf(str.charAt(i + 1));
    const enc3 = CHARS.indexOf(str.charAt(i + 2));
    const enc4 = CHARS.indexOf(str.charAt(i + 3));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64 && !isNaN(enc3)) output += String.fromCharCode(chr2);
    if (enc4 !== 64 && !isNaN(enc4)) output += String.fromCharCode(chr3);
  }
  return output;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  topBarTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 16 },
  photoRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  photoButton: { flex: 1, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingVertical: 12, backgroundColor: Colors.ivory2 },
  photoButtonText: { fontSize: 13, fontWeight: "600", color: Colors.indigo },
  preview: { width: "100%", height: 220, borderRadius: 14, marginBottom: 14, backgroundColor: Colors.ivory2 },
  extractingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  extractingText: { fontSize: 13, color: Colors.ink + "99" },
  suggestionCard: { borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 16, backgroundColor: Colors.ivory2 },
  suggestionTitle: { fontSize: 13, fontWeight: "700", color: Colors.indigo, marginBottom: 4 },
  suggestionBody: { fontSize: 13, color: Colors.ink + "b3", lineHeight: 18 },
  label: { fontSize: 12, fontWeight: "700", color: Colors.indigo, marginBottom: 6, marginTop: 4 },
  selectBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#fff", marginBottom: 8 },
  selectText: { fontSize: 14, color: Colors.ink },
  selectPlaceholder: { fontSize: 14, color: Colors.ink + "55" },
  dropdown: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, backgroundColor: "#fff", marginBottom: 14, overflow: "hidden" },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.line },
  dropdownItemText: { fontSize: 13, color: Colors.ink },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: "#fff", marginBottom: 20, color: Colors.ink },
  saveButton: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginBottom: 30 },
  saveButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
});
