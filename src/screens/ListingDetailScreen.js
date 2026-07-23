import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    load();
  }, [listingId]);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    setCurrentUserId(userData?.user?.id);

    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(photo_url), profiles!listings_seller_id_fkey(full_name)')
      .eq('id', listingId)
      .single();

    if (!error) setListing(data);
  }

  async function messageSeller() {
    if (!listing || !currentUserId) return;
    if (listing.seller_id === currentUserId) {
      Alert.alert("That's your listing", "You can't message yourself about your own item.");
      return;
    }

    // Find or create the conversation for this listing + buyer.
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', currentUserId)
      .maybeSingle();

    let conversationId = existing?.id;

    if (!conversationId) {
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({ listing_id: listingId, buyer_id: currentUserId, seller_id: listing.seller_id })
        .select('id')
        .single();
      if (error) {
        Alert.alert('Could not start conversation', error.message);
        return;
      }
      conversationId = created.id;
    }

    navigation.getParent()?.navigate('MessagesTab', {
      screen: 'Chat',
      params: { conversationId, listingTitle: listing.title },
    });
  }

  async function markSold() {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Marked as sold');
      navigation.goBack();
    }
  }

  if (!listing) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const isOwner = currentUserId === listing.seller_id;

  return (
    <ScrollView style={styles.container}>
      {listing.listing_photos?.length ? (
        listing.listing_photos.map((p, i) => (
          <Image key={i} source={{ uri: p.photo_url }} style={styles.image} />
        ))
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${(listing.price_cents / 100).toFixed(2)}</Text>
        {listing.listing_type === 'handmade' && (
          <Text style={styles.handmadeBadge}>Handmade by seller</Text>
        )}
        <Text style={styles.seller}>Sold by {listing.profiles?.full_name}</Text>
        <Text style={styles.description}>{listing.description}</Text>
        <Text style={styles.meta}>
          {listing.category ? `${listing.category} · ` : ''}
          {listing.size ? `Size ${listing.size} · ` : ''}
          {listing.condition || ''}
        </Text>

        {isOwner ? (
          listing.status === 'active' && (
            <TouchableOpacity style={styles.button} onPress={markSold}>
              <Text style={styles.buttonText}>Mark as Sold</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity style={styles.button} onPress={messageSeller}>
            <Text style={styles.buttonText}>Message Seller</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 320, backgroundColor: '#eee' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  price: { fontSize: 18, color: '#111', marginTop: 4 },
  handmadeBadge: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#2f9e44',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seller: { marginTop: 12, fontSize: 14, color: '#555' },
  description: { marginTop: 12, fontSize: 15, lineHeight: 21 },
  meta: { marginTop: 12, fontSize: 13, color: '#888' },
  button: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
