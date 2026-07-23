import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function MessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [userId, setUserId] = useState(null);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    setUserId(uid);
    if (!uid) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('id, listing_id, buyer_id, seller_id, listings(title)')
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order('created_at', { ascending: false });

    if (!error) setConversations(data || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.id,
            listingTitle: item.listings?.title,
          })
        }
      >
        <Text style={styles.rowTitle}>{item.listings?.title || 'Listing'}</Text>
        <Text style={styles.rowSubtitle}>
          {item.buyer_id === userId ? 'You messaged the seller' : 'Buyer messaged you'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSubtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 60, color: '#888' },
});
