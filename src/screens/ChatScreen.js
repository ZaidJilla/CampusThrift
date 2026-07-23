import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ChatScreen({ route }) {
  const { conversationId, listingTitle } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    let channel;

    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      setUserId(userData?.user?.id);

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      setMessages(data || []);

      // Subscribe to new messages in this conversation in real time.
      channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();
    }

    init();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function sendMessage() {
    if (!text.trim()) return;
    const body = text.trim();
    setText('');
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body,
    });
    if (error) {
      console.warn('Send failed', error.message);
    }
  }

  function renderItem({ item }) {
    const isMine = item.sender_id === userId;
    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.body}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>{listingTitle}</Text>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 12,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 14, marginBottom: 8 },
  bubbleMine: { backgroundColor: '#111', alignSelf: 'flex-end' },
  bubbleTheirs: { backgroundColor: '#f0f0f0', alignSelf: 'flex-start' },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: '#111' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#111',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: '600' },
});
