import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { ProjetResponse, UtilisateurResponse } from "@/types/api";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:   "#ef4444",
  PRODUCT_OWNER: "#a855f7",
  SCRUM_MASTER:  "#f59e0b",
  TESTEUR_QA:    "#06b6d4",
  DEVELOPPEUR:   "#22c55e",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SIZES.lg },
    pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" },
    pageSubtitle: { color: c.textSecondary, fontSize: SIZES.fontSm, marginTop: 2 },
    addBtn: {
      flexDirection: "row", alignItems: "center", gap: SIZES.sm,
      backgroundColor: c.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
      borderRadius: SIZES.radiusMd,
    },
    addBtnText: { color: c.white, fontSize: SIZES.fontSm, fontWeight: "700" },
    projectPicker: { marginBottom: SIZES.md },
    projectChip: {
      paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
      borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: c.inputBorder,
      backgroundColor: c.backgroundSecondary, marginRight: SIZES.sm,
    },
    projectChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    projectChipText: { color: c.textSecondary, fontSize: SIZES.fontSm, fontWeight: "600" },
    projectChipTextActive: { color: c.white },
    emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
    emptyText: { color: c.textSecondary, fontSize: SIZES.fontBase },
    memberCard: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: c.inputBorder,
      padding: SIZES.md, marginBottom: SIZES.sm,
    },
    avatar: {
      width: 44, height: 44, borderRadius: SIZES.radiusRound,
      alignItems: "center", justifyContent: "center", marginRight: SIZES.md,
    },
    avatarText: { fontSize: SIZES.fontSm, fontWeight: "700" },
    memberInfo: { flex: 1 },
    memberName: { color: c.text, fontSize: SIZES.fontBase, fontWeight: "600" },
    memberEmail: { color: c.textSecondary, fontSize: SIZES.fontXs, marginTop: 2 },
    rolePill: { paddingHorizontal: SIZES.sm, paddingVertical: 3, borderRadius: SIZES.radiusSm },
    roleText: { fontSize: SIZES.fontXs, fontWeight: "600" },
    addPanel: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl, borderWidth: 1, borderColor: c.inputBorder,
      padding: SIZES.lg, marginTop: SIZES.md,
    },
    addPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SIZES.md },
    addPanelTitle: { color: c.text, fontSize: SIZES.fontBase, fontWeight: "700" },
    availableMember: {
      flexDirection: "row", alignItems: "center",
      paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: c.inputBorder,
    },
    avatarSm: {
      width: 36, height: 36, borderRadius: SIZES.radiusRound,
      alignItems: "center", justifyContent: "center", marginRight: SIZES.md,
    },
    avatarSmText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  });
}

export default function TeamScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(null);
  const [members, setMembers] = useState<UtilisateurResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<UtilisateurResponse[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [adding, setAdding] = useState(false);

  async function loadProjects() {
    try {
      const data = await projectsService.getMember();
      setProjects(data ?? []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        setMembers(data[0].membres ?? []);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  async function loadAvailable() {
    try {
      const data = await projectsService.getAvailableMembers();
      setAvailableMembers(data ?? []);
    } catch {}
  }

  useEffect(() => { loadProjects(); }, []);

  function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    setMembers(proj.membres ?? []);
  }

  async function openAddPanel() {
    await loadAvailable();
    setShowAddPanel(true);
  }

  async function addMember(member: UtilisateurResponse) {
    if (!selectedProject) return;
    if (members.find((m) => m.id === member.id)) {
      Alert.alert("Info", "Ce membre est déjà dans le projet");
      return;
    }
    setAdding(true);
    try {
      const updated = await projectsService.addMembers(selectedProject.id, [member.id]);
      setMembers(updated.membres ?? []);
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? updated : p)));
      setShowAddPanel(false);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setAdding(false);
    }
  }

  const notInProject = availableMembers.filter((m) => !members.find((mb) => mb.id === m.id));

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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProjects(); }} tintColor={c.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Équipe</Text>
            <Text style={styles.pageSubtitle}>{members.length} membre(s)</Text>
          </View>
          {selectedProject && (
            <TouchableOpacity style={styles.addBtn} onPress={openAddPanel}>
              <Ionicons name="person-add-outline" size={18} color={c.white} />
              <Text style={styles.addBtnText}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingProjects ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: SIZES.xxl }} />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Aucun projet</Text>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectPicker}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.projectChip, selectedProject?.id === p.id && styles.projectChipActive]}
                  onPress={() => selectProject(p)}
                >
                  <Text style={[styles.projectChipText, selectedProject?.id === p.id && styles.projectChipTextActive]}>
                    {p.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {members.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="people-outline" size={48} color={c.textSecondary} />
                <Text style={styles.emptyText}>Aucun membre assigné</Text>
              </View>
            ) : (
              members.map((m) => {
                const rc = ROLE_COLORS[m.role?.code ?? ""] ?? c.textSecondary;
                return (
                  <View key={m.id} style={styles.memberCard}>
                    <View style={[styles.avatar, { backgroundColor: `${rc}33` }]}>
                      <Text style={[styles.avatarText, { color: rc }]}>{getInitials(m.nom)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{m.nom}</Text>
                      <Text style={styles.memberEmail}>{m.email}</Text>
                    </View>
                    {m.role && (
                      <View style={[styles.rolePill, { backgroundColor: `${rc}22` }]}>
                        <Text style={[styles.roleText, { color: rc }]}>{m.role.nom}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            {showAddPanel && (
              <View style={styles.addPanel}>
                <View style={styles.addPanelHeader}>
                  <Text style={styles.addPanelTitle}>Ajouter un membre</Text>
                  <TouchableOpacity onPress={() => setShowAddPanel(false)}>
                    <Ionicons name="close" size={20} color={c.textSecondary} />
                  </TouchableOpacity>
                </View>
                {notInProject.length === 0 ? (
                  <Text style={styles.emptyText}>Tous les membres sont déjà dans le projet</Text>
                ) : (
                  notInProject.map((m) => {
                    const rc = ROLE_COLORS[m.role?.code ?? ""] ?? c.textSecondary;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={styles.availableMember}
                        onPress={() => addMember(m)}
                        disabled={adding}
                      >
                        <View style={[styles.avatarSm, { backgroundColor: `${rc}33` }]}>
                          <Text style={[styles.avatarSmText, { color: rc }]}>{getInitials(m.nom)}</Text>
                        </View>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{m.nom}</Text>
                          <Text style={styles.memberEmail}>{m.role?.nom ?? ""}</Text>
                        </View>
                        <Ionicons name="add-circle-outline" size={20} color={c.primary} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
