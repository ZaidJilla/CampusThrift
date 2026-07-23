import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { SCHOOLS } from '../constants/schools';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [myListings, setMyListings] = useState([]);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    setProfile(profileData);

    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, price_cents, status')
      .eq('seller_id', uid)
      .order('created_at', { ascending: false });
    setMyListings(listings || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const schoolName = SCHOOLS.find((s) => s.id === profile?.school_id)?.name;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.school}>{schoolName}</Text>
      </View>

      <Text style={styles.sectionTitle}>Your Listings</Text>
      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowMeta}>
              ${(item.price_cents / 100).toFixed(2)} · {item.status}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>You haven't posted anything yet.</Text>}
      />

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { marginBottom: 20, paddingTop: 20 },
  name: { fontSize: 24, fontWeight: '700' },
  school: { fontSize: 14, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  empty: { color: '#888', marginTop: 8 },
  signOutButton: { marginTop: 'auto', padding: 16, alignItems: 'center' },
  signOutText: { color: '#c92a2a', fontWeight: '600' },
});
