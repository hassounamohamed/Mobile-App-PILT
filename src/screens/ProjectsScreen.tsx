import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { ProjetResponse } from "@/types/api";

const STATUS_META: Record<string, { label: string; color: string }> = {
  ACTIF: { label: "Actif", color: "#22c55e" },
  ARCHIVE: { label: "Archivé", color: "#9ca3af" },
  TERMINE: { label: "Terminé", color: "#3b82f6" },
};

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" },
  pageSubtitle: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    backgroundColor: c.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  createBtnText: {
    color: c.white,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.sm },
  emptyText: { color: c.text, fontSize: SIZES.fontLg, fontWeight: "600" },
  emptyHint: { color: c.textSecondary, fontSize: SIZES.fontSm },
  card: {
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  projectIconWrap: {
    width: 38,
    height: 38,
    borderRadius: SIZES.radiusMd,
    backgroundColor: `${c.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleWrap: { flex: 1 },
  cardTitle: {
    color: c.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
  },
  cardDesc: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
  },
  statusText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: SIZES.lg },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { color: c.textSecondary, fontSize: SIZES.fontXs },
  archiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: c.inputBorder,
  },
  archiveBtnText: { color: c.textSecondary, fontSize: SIZES.fontXs },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: c.backgroundSecondary,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    paddingBottom: SIZES.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  modalTitle: { color: c.text, fontSize: SIZES.fontLg, fontWeight: "700" },
  inputLabel: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    color: c.text,
    fontSize: SIZES.fontBase,
    marginBottom: SIZES.md,
  },
  inputMulti: { height: 80, textAlignVertical: "top" },
  submitBtn: {
    backgroundColor: c.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: "center",
    marginTop: SIZES.sm,
  },
  submitBtnText: {
    color: c.white,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
  },
});
}

export default function ProjectsScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNom, setNewNom] = useState("");
  const [newDesc, setNewDesc] = useState("");

  async function load() {
    try {
      const data = await projectsService.getMine();
      setProjects(data ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!newNom.trim()) {
      Alert.alert("Validation", "Le nom du projet est requis");
      return;
    }
    setCreating(true);
    try {
      const proj = await projectsService.create({
        nom: newNom.trim(),
        description: newDesc.trim() || undefined,
      });
      setProjects((prev) => [proj, ...prev]);
      setShowCreate(false);
      setNewNom("");
      setNewDesc("");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleArchive(proj: ProjetResponse) {
    Alert.alert("Archiver", `Archiver "${proj.nom}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Archiver",
        onPress: async () => {
          try {
            const updated = await projectsService.archive(proj.id);
            setProjects((prev) =>
              prev.map((p) => (p.id === proj.id ? updated : p)),
            );
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SIZES.lg,
          paddingHorizontal: SIZES.lg,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Projets</Text>
            <Text style={styles.pageSubtitle}>{projects.length} projet(s)</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(true)}
          >
            <Ionicons name="add" size={20} color={c.white} />
            <Text style={styles.createBtnText}>Nouveau</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: SIZES.xxl }}
          />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="folder-open-outline"
              size={52}
              color={c.textSecondary}
            />
            <Text style={styles.emptyText}>Aucun projet</Text>
            <Text style={styles.emptyHint}>Créez votre premier projet</Text>
          </View>
        ) : (
          projects.map((proj) => {
            const sm = STATUS_META[proj.statut] ?? {
              label: proj.statut,
              color: c.textSecondary,
            };
            return (
              <View key={proj.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.projectIconWrap}>
                    <Ionicons name="folder" size={20} color={c.primary} />
                  </View>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{proj.nom}</Text>
                    {proj.description ? (
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {proj.description}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: `${sm.color}22` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: sm.color }]}>
                      {sm.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="layers-outline"
                      size={14}
                      color={c.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {proj.nb_modules ?? 0} modules
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="flag-outline"
                      size={14}
                      color={c.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {proj.nb_epics ?? 0} epics
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="document-text-outline"
                      size={14}
                      color={c.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {proj.nb_user_stories ?? 0} stories
                    </Text>
                  </View>
                </View>

                {proj.statut === "ACTIF" && (
                  <TouchableOpacity
                    style={styles.archiveBtn}
                    onPress={() => handleArchive(proj)}
                  >
                    <Ionicons
                      name="archive-outline"
                      size={14}
                      color={c.textSecondary}
                    />
                    <Text style={styles.archiveBtnText}>Archiver</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau projet</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Nom du projet *</Text>
            <TextInput
              style={styles.input}
              value={newNom}
              onChangeText={setNewNom}
              placeholder="Ex: Application mobile FlowPilot"
              placeholderTextColor={c.textSecondary}
            />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="Description du projet..."
              placeholderTextColor={c.textSecondary}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={c.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Créer le projet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


